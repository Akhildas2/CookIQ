import { computed, Injectable, signal } from '@angular/core';
import { SupabaseService } from '../supabase/supabase-service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { StrapiService } from '../strapi/strapi-service';
import { BillingService } from '../../../features/billing/services/billing/billing-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = signal<any>(null); // Holds authenticated user state
  loading = signal<boolean>(false); // Global auth loading state
  private hasSynced = false;

  constructor(private supabaseService: SupabaseService, private billingService: BillingService, private toast: ToastService, private strapi: StrapiService) {
    this.initializeAuth();
  }

  private async initializeAuth() {
    const { data } = await this.supabaseService.client.auth.getSession(); // Get current session on app load
    const user = data.session?.user ?? null; // Set initial user state

    this.user.set(user);

    // Google OAuth success toast (after redirect)
    if (sessionStorage.getItem('oauth-login') && user) {
      this.toast.add({
        severity: 'success',
        summary: 'Google Sign-in Successful',
        detail: 'Welcome to CookIQ!',
      });
      sessionStorage.removeItem('oauth-login');
    }

    // Sync user profile + load subscription on app boot
    if (user && !this.hasSynced) {
      this.hasSynced = true;
      await this.handleUserSync(user);
    }

    // Keep auth state in sync with Supabase auth events
    this.supabaseService.client.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      this.user.set(currentUser);

      if (event === 'SIGNED_IN' && currentUser && !this.hasSynced) {
        this.hasSynced = true;
        await this.handleUserSync(currentUser);
      }

      if (event === 'SIGNED_OUT') {
        this.hasSynced = false;
        // Clear subscription state so stale data isn't shown on next login
        this.billingService.clearSubscription();
      }
    });
  }

  // ==========================
  // EMAIL LOGIN
  // ==========================
  async login(email: string, password: string): Promise<boolean> {
    this.loading.set(true);
    const { data, error } = await this.supabaseService.client.auth.signInWithPassword({ email, password });
    this.loading.set(false);

    // Handle login errors with user-friendly messages
    if (error) {
      this.toast.add({
        severity: 'error',
        summary: 'Login Failed',
        detail: this.mapAuthError(error.message),
      });

      return false;
    }

    this.user.set(data.user);

    // Show welcome toast on successful login
    this.toast.add({
      severity: 'success',
      summary: 'Welcome Back!',
      detail: 'Successfully logged in to CookIQ.',
    });

    return true;
  }

  // ==========================
  // REGISTER
  // ==========================
  async register(email: string, password: string): Promise<boolean> {
    this.loading.set(true);
    const { data, error } = await this.supabaseService.client.auth.signUp({ email, password });
    this.loading.set(false);

    // Handle registration errors with user-friendly messages
    if (error) {
      this.toast.add({
        severity: 'error',
        summary: 'Registration Failed',
        detail: this.mapAuthError(error.message),
      });

      return false;
    }

    // Check if email is confirmed
    if (!data.user?.confirmed_at) {
      this.toast.add({
        severity: 'info',
        summary: 'Email Confirmation Required',
        detail: 'Please check your email to verify your account.',
      });

      return false;
    }

    this.user.set(data.user); // Set user state on successful registration

    // Show success toast on successful registration
    this.toast.add({
      severity: 'success',
      summary: 'Account Created',
      detail: 'Your CookIQ account has been created successfully!',
    });

    return true;
  }

  // ==========================
  // GOOGLE LOGIN
  // ==========================
  async loginWithGoogle() {
    this.loading.set(true);

    // Save intent before redirect
    sessionStorage.setItem('oauth-login', 'google');

    // Initiate Google OAuth flow
    const { error } = await this.supabaseService.client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    // Handle OAuth errors
    if (error) {
      sessionStorage.removeItem('oauth-login');

      // Show error toast if Google Sign-in fails
      this.toast.add({
        severity: 'error',
        summary: 'Google Sign-in Failed',
        detail: error.message,
      });

      this.loading.set(false);
    }
  }

  // ==========================
  // LOGOUT
  // ==========================
  async logout() {
    await this.supabaseService.client.auth.signOut();
    this.user.set(null);

    // Show logout toast
    this.toast.add({
      severity: 'info',
      summary: 'Logged Out',
      detail: 'You have been logged out.',
    });

  }

  // ==========================
  // STRAPI SYNC
  //  Sync user profile with Strapi + load subscription
  // ==========================
  private async handleUserSync(user: any) {
    if (!user) return;

    try {
      // Ensure Strapi user record exists 
      await this.strapi.syncUserWithStrapi(user);
    } catch (err) {
      console.error('Strapi user sync failed', err);
    }

    await this.billingService.fetchMySubscription(true);
  }


  // ==========================
  // HELPERS
  // ==========================
  plan = computed(() => {
    if (this.billingService.subscriptionLoading()) return 'loading';
    return this.billingService.currentPlan();
  });

  // Expose loading state
  subscriptionLoading = computed(() => this.billingService.subscriptionLoading());

  // Check if user is authenticated
  isLoggedIn() {
    return !!this.user();
  }

  private mapAuthError(message: string): string {
    if (message.includes('Invalid login')) return 'Invalid email or password';
    if (message.includes('Email not confirmed')) return 'Please verify your email';
    if (message.includes('User already registered')) return 'User already exists';
    return 'Something went wrong. Please try again.';
  }

}