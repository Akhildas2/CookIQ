import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { BillingPlan, UserSubscription } from '../../models/plan.model';
import { environment } from '../../../../../environments/environment';
import { SupabaseService } from '../../../../core/services/supabase/supabase-service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private readonly baseUrl = environment.strapi.url;

  // ── Signals ────────────────────────────────────────────────────────────────
  plans = signal<BillingPlan[]>([]);
  plansLoading = signal<boolean>(false);
  currentSubscription = signal<UserSubscription | null>(null);
  subscriptionLoading = signal<boolean>(true); // start true — assume loading until first fetch
  private subscriptionLoaded = false;

  // ── Computed helpers ───────────────────────────────────────────────────────
  currentPlan = computed((): 'free' | 'pro' | 'premium' => {
    return this.currentSubscription()?.plan ?? 'free';
  });

  currentBillingCycle = computed((): 'monthly' | 'yearly' | null => {
    return this.currentSubscription()?.billingCycle ?? null;
  });

  isFreePlan = computed(() => this.currentPlan() === 'free');

  isPaidActive = computed(() => {
    const sub = this.currentSubscription();
    return (
      sub?.plan !== 'free' &&
      ['active', 'pending', 'authenticated'].includes(sub?.subscriptionStatus as string)
    );
  });

  willCancelAtPeriodEnd = computed(() =>
    this.currentSubscription()?.cancelAtPeriodEnd === true
  );

  hasManageableSubscription = computed(() =>
    !!this.currentSubscription()?.razorpaySubscriptionId
  );

  isActive = computed(() => {
    const status = this.currentSubscription()?.subscriptionStatus;
    const plan = this.currentSubscription()?.plan;
    if (plan === 'free' || plan == null) return status !== 'cancelled' && status !== 'expired';
    return ['active', 'pending', 'authenticated'].includes(status as string);
  });

  constructor(
    private http: HttpClient,
    private supabaseService: SupabaseService
  ) { }

  // ── Fetch all plans ────────────────────────────────────────────────────────
  fetchPlans(): void {
    if (this.plans().length) return;

    this.plansLoading.set(true);
    this.http.get<BillingPlan[]>(`${this.baseUrl}/api/billing/plans`).subscribe({
      next: (plans) => {
        this.plans.set(plans);
        this.plansLoading.set(false);
      },
      error: () => this.plansLoading.set(false),
    });
  }

  // ── Fetch current user's subscription ─────────────────────────────────────
  async fetchMySubscription(force = false): Promise<void> {
    if (this.subscriptionLoaded && !force) return;

    this.subscriptionLoading.set(true);

    try {
      const headers = await this.getAuthHeaders();
      const sub = await firstValueFrom(
        this.http.get<UserSubscription>(
          `${this.baseUrl}/api/billing/my-subscription`,
          { headers }
        )
      );

      this.currentSubscription.set(sub);
      this.subscriptionLoaded = true;

    } catch {
      this.currentSubscription.set({ plan: 'free', subscriptionStatus: null });
      this.subscriptionLoaded = true;
    } finally {
      this.subscriptionLoading.set(false);
    }
  }

  // ── Clear subscription state on logout ────────────────────────────────────    
  clearSubscription(): void {
    this.currentSubscription.set(null);
    this.subscriptionLoaded = false;
    this.subscriptionLoading.set(true);
  }

  // ── Create new subscription (first time) ──────────────────────────────────
  async createRazorpaySubscription(
    planId: string,
    planName: string,
    billingCycle: 'monthly' | 'yearly'
  ): Promise<any> {
    const headers = await this.getAuthHeaders();
    return firstValueFrom(
      this.http.post(
        `${this.baseUrl}/api/billing/create-subscription`,
        { planId, planName, billingCycle },
        { headers }
      )
    );
  }

  // ── Change plan (upgrade or downgrade) ────────────────────────────────────
  async changePlan(
    planId: string,
    planName: string,
    changeType: 'upgrade' | 'downgrade',
    billingCycle: 'monthly' | 'yearly'
  ): Promise<any> {
    const headers = await this.getAuthHeaders();
    return firstValueFrom(
      this.http.post(
        `${this.baseUrl}/api/billing/change-plan`,
        { planId, planName, changeType, billingCycle },
        { headers }
      )
    );
  }

  // ── Sync subscription after payment ───────────────────────────────────────
  async syncSubscription(razorpaySubscriptionId: string): Promise<any> {
    const headers = await this.getAuthHeaders();
    const result = await firstValueFrom(
      this.http.post(
        `${this.baseUrl}/api/billing/sync-subscription`,
        { razorpaySubscriptionId },
        { headers }
      )
    );

    await this.fetchMySubscription(true);
    return result;
  }

  // ── Cancel subscription ────────────────────────────────────────────────────
  async cancelSubscription(immediately = false): Promise<{ message: string; effectiveDate?: string }> {
    const headers = await this.getAuthHeaders();
    const result = await firstValueFrom(
      this.http.post<{ message: string; effectiveDate: string }>(
        `${this.baseUrl}/api/billing/cancel`,
        { immediately },
        { headers }
      )
    );

    await this.fetchMySubscription(true);
    return result;
  }

  // ── Determine action type for a target plan + cycle ───────────────────────
  getPlanAction(
    targetPlan: string,
    targetCycle: 'monthly' | 'yearly'
  ): 'current' | 'upgrade' | 'downgrade' | 'subscribe' | 'cycle-change' {
    const current = this.currentPlan();
    const currentCycle = this.currentBillingCycle();
    const sub = this.currentSubscription();
    const order = ['free', 'pro', 'premium'];

    // Consider any paid subscription as "has a plan" — not just 'active'.
    const hasPaidPlan = sub?.plan && sub.plan !== 'free' &&
      !['cancelled', 'expired', null].includes(sub.subscriptionStatus as any);

    if (!hasPaidPlan && targetPlan !== 'free') return 'subscribe';

    const currentIdx = order.indexOf(current);
    const targetIdx = order.indexOf(targetPlan);

    if (targetIdx > currentIdx) return 'upgrade';
    if (targetIdx < currentIdx) return 'downgrade';

    if (targetPlan === 'free') return 'current';
    // Same plan tier — check cycle
    if (currentCycle !== targetCycle) return 'cycle-change';

    return 'current';
  }

  // ── Private: get auth headers ──────────────────────────────────────────────
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await this.supabaseService.client.auth.getSession();
    if (!session?.access_token) throw new Error('User not authenticated');
    return { Authorization: `Bearer ${session.access_token}` };
  }
}