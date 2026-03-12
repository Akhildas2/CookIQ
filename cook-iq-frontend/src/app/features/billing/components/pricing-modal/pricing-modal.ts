import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { BillingService } from '../../services/billing/billing-service';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { MaterialImportsModule } from '../../../../shared/material/material.imports';
import { BillingPlan } from '../../models/plan.model';
import { getPlanBadgeClass, getPlanIcon, getPlanTextColor } from '../../../../shared/utils/plan.utils';
import { ConfirmService } from '../../../../shared/services/confirm/confirm-service';
import { CheckoutService } from '../../../../shared/services/checkout/checkout-service';
import { getButtonClass, getButtonLabel } from '../../../../shared/utils/plan-ui.utils';
import { capitalize } from '../../../../shared/utils/string.utils';
import { formatPeriodEnd } from '../../../../shared/utils/date.utils';

@Component({
  selector: 'app-pricing-modal',
  imports: [CommonModule, MaterialImportsModule],
  templateUrl: './pricing-modal.html',
  styleUrl: './pricing-modal.css'
})
export class PricingModal implements OnInit {
  billingCycle = signal<'monthly' | 'yearly'>('monthly');
  loadingPlan = signal<string | null>(null);

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  isLoading = computed(() => this.loadingPlan() !== null);

  getPlanIcon = getPlanIcon;
  getPlanTextColor = getPlanTextColor;
  getPlanBadgeClass = getPlanBadgeClass;

  constructor(public billingService: BillingService, private confirm: ConfirmService, private checkout: CheckoutService, public dialogRef: MatDialogRef<PricingModal>,) {
    effect(() => {
      const cycle = this.billingService.currentBillingCycle();
      if (cycle) this.billingCycle.set(cycle);
    });
  }

  ngOnInit(): void {
    this.billingService.fetchPlans();
    this.billingService.fetchMySubscription(false);
  }

  // ── Billing computed shortcuts ─────────────────────────────────────────────
  razorpayPlans = computed(() => this.billingService.plans());
  plansLoading = computed(() => this.billingService.plansLoading());
  subscriptionLoading = computed(() => this.billingService.subscriptionLoading());
  currentPlan = computed(() => this.billingService.currentPlan());
  currentBillingCycle = computed(() => this.billingService.currentBillingCycle());
  isActive = computed(() => this.billingService.isActive());
  cancelAtPeriodEnd = computed(() => this.billingService.willCancelAtPeriodEnd());
  periodEnd = computed(() => this.billingService.currentSubscription()?.currentPeriodEnd);

  // ── Toggle Cycle ─────────────────────────────────
  toggleCycle(cycle: 'monthly' | 'yearly') {
    this.billingCycle.set(cycle);
  }

  // ── Free Plan ─────────────────────────────────
  freePlan: BillingPlan = {
    name: 'free',
    description: 'Perfect for beginners and hobbyists',
    features: ['Basic AI recipes', 'Basic ingredient search', 'Limited daily usage', 'Community access'],
    monthly: { planId: '', interval: 'month', amount: 0 },
    yearly: { planId: '', interval: 'year', amount: 0 },
  };

  readonly featureMap: Record<string, string[]> = {
    pro: ['Unlimited AI recipes', 'Meal planner', 'Nutrition breakdown', 'Priority support'],
    premium: ['Everything in Pro', 'Personal AI chef', 'Advanced analytics', 'Early feature access'],
  };

  // ── Yearly Discount ─────────────────────────────────
  yearlyDiscount = computed(() => {
    const savings = this.razorpayPlans().map(p => p.yearlySavingsPct ?? 0).filter(v => v > 0);
    return savings.length ? Math.max(...savings) : 0;
  });

  // ── All Plans ─────────────────────────────────
  allPlans = computed<BillingPlan[]>(() => {
    const order = ['pro', 'premium'];
    const paid = [...this.razorpayPlans()]
      .map(p => ({ ...p, features: this.featureMap[p.name] ?? p.features }))
      .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
    return [this.freePlan, ...paid];
  });

  // ── Determine if button is disabled ───────────────────────────────────────
  isButtonDisabled(plan: BillingPlan): boolean {
    if (this.subscriptionLoading()) return true;
    const loading = this.loadingPlan();
    return !!loading && loading !== plan.name;
  }

  // ── Get Button Label ─────────────────────────────────
  getButtonLabel(plan: BillingPlan): string {
    if (this.subscriptionLoading()) return 'Loading...';
    const action = this.billingService.getPlanAction(plan.name, this.billingCycle());

    return getButtonLabel(plan, action, this.billingCycle());
  }

  // ── Get Button Class ─────────────────────────────────
  getButtonClass(plan: BillingPlan): string {
    const isLoading = this.loadingPlan() === plan.name;
    const isCurrent = this.billingService.getPlanAction(plan.name, this.billingCycle()) === 'current';

    return getButtonClass(isLoading, isCurrent, this.subscriptionLoading());
  }

  // ── Main action handler ────────────────────────────────────────────────────
  async handlePlanAction(plan: BillingPlan) {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const cycle = this.billingCycle();
    const action = this.billingService.getPlanAction(plan.name, cycle);
    const cyclePlan = cycle === 'monthly' ? plan.monthly : plan.yearly;

    if (!cyclePlan?.planId || action === 'current' || plan.name === 'free') return;

    this.loadingPlan.set(plan.name);

    try {
      // ── Subscribe ──
      if (action === 'subscribe') {
        await this.subscribeNewPlan(cyclePlan.planId, plan.name, cycle);
      }
      // ── Upgrade or billing cycle change ──
      else if (action === 'upgrade' || action === 'cycle-change') {
        const label =
          action === 'cycle-change'
            ? `${capitalize(plan.name)} ${cycle === 'yearly' ? 'Yearly' : 'Monthly'}`
            : capitalize(plan.name);


        const confirmed = await this.confirm.confirm({
          icon: 'swap_horiz',
          title: 'Switch plan',
          message:
            `Switch to ${label}?\n\n` +
            `Your current plan will end now and you'll be charged for the new cycle.`,
          confirmText: 'Switch plan',
          cancelText: 'Keep current plan',
          confirmIcon: 'check',
          cancelIcon: 'close',
          variant: 'warning',
        });

        if (!confirmed) return;
        await this.changeAndCheckout(cyclePlan.planId, plan.name, 'upgrade', cycle);

      }
      // ── Downgrade ──
      else if (action === 'downgrade') {
        const effectiveDate = formatPeriodEnd(Number(this.periodEnd())) ?? 'your billing period end';

        const confirmed = await this.confirm.confirm({
          icon: 'schedule',
          title: 'Schedule downgrade',
          message:
            `Switch to ${capitalize(plan.name)}?\n\n` +
            `You'll keep your current plan until ${effectiveDate}, then switch automatically.`,
          confirmText: 'Schedule downgrade',
          cancelText: 'Keep current plan',
          confirmIcon: 'check',
          cancelIcon: 'close',
          variant: 'info',
        });
        if (!confirmed) return;

        const res: any = await this.billingService.changePlan(cyclePlan.planId, plan.name, 'downgrade', cycle);
        const date = new Date(res.effectiveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
        this.successMessage.set(`Switching to ${capitalize(plan.name)} on ${date}.`);
      }
    } catch (err: any) {
      const raw: string = err?.error?.error?.message || err?.error?.message || err?.message || '';

      if (raw === 'ALREADY_SUBSCRIBED') {
        try {
          await this.changeAndCheckout(cyclePlan.planId, plan.name, 'upgrade', cycle);
        } catch {
          this.errorMessage.set('Could not switch plans. Please refresh and try again.');
        }
      } else {
        this.errorMessage.set(raw || 'Something went wrong. Please try again.');
      }
    } finally {
      this.loadingPlan.set(null);
    }
  }

  // ── Cancel subscription ────────────────────────────────────────────────────
  async cancelSubscription() {
    const endDate = formatPeriodEnd(Number(this.periodEnd())) ?? 'the end of your billing period';

    const confirmed = await this.confirm.confirm({
      icon: 'cancel_subscription',
      title: 'Cancel subscription',
      message:
        `Your subscription will stop at the end of the current billing period.\n\n` +
        `You will retain access until ${endDate}.`,
      confirmText: 'Cancel subscription',
      cancelText: 'Keep subscription',
      confirmIcon: 'cancel',
      cancelIcon: 'undo',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      const res = await this.billingService.cancelSubscription(false);
      this.successMessage.set(res.message);
    } catch {
      this.errorMessage.set('Could not cancel subscription');
    }
  }


  // ── Private helpers ────────────────────────────────────────────────────────
  // Subscribe New Plan
  private async subscribeNewPlan(planId: string, planName: string, cycle: 'monthly' | 'yearly') {
    const res: any = await this.billingService.createRazorpaySubscription(planId, planName, cycle);
    this.dialogRef.close();
    await this.openCheckout(res.subscriptionId, res.key, planName, cycle);
  }

  // Change And Checkout
  private async changeAndCheckout(planId: string, planName: string, direction: 'upgrade' | 'downgrade', cycle: 'monthly' | 'yearly') {
    const res: any = await this.billingService.changePlan(planId, planName, direction, cycle);
    this.dialogRef.close();
    await this.openCheckout(res.subscriptionId, res.key, planName, cycle);
  }

  // Open Checkout 
  private async openCheckout(subscriptionId: string, key: string, planName: string, cycle: 'monthly' | 'yearly') {
    const cycleLabel = cycle === 'yearly' ? 'Yearly' : 'Monthly';

    await this.checkout.openCheckout({
      key,
      subscriptionId,
      name: 'CookIQ',
      description:
        `${capitalize(planName)} Plan — ${cycleLabel}`,
      color: '#16a34a',
      handler: async (response: any) => {
        try {
          this.loadingPlan.set(planName);
          await this.billingService.syncSubscription(response.razorpay_subscription_id);
          this.successMessage.set(`You're now on ${capitalize(planName)} ${cycleLabel}! 🎉`);
        } catch {
          window.location.reload();
        } finally {
          this.loadingPlan.set(null);
        }
      },
    });
  }

  // Get Yearly Savings 
  getYearlySavings(plan: BillingPlan): number {
    return plan.yearlySavingsPct ?? 0;
  }

  // close 
  close() {
    this.dialogRef.close();
  }

}