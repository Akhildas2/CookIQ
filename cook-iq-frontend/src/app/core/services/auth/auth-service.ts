import { Injectable, signal } from '@angular/core';
import { SupabaseService } from '../supabase/supabase-service';
import { ToastService } from '../../../shared/ui/toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = signal<any>(null); // Holds authenticated user state
  loading = signal<boolean>(false); // Global auth loading state

  constructor(private supabaseService: SupabaseService, private toast: ToastService) {
    // Only restore session silently on app init.
    this.supabaseService.client.auth.getSession().then(({ data }) => {
      const user = data.session?.user ?? null;
      this.user.set(user);

      const oauth = sessionStorage.getItem('oauth-login');

      if (oauth && user) {
        this.toast.add({
          severity: 'success',
          summary: 'Google Sign-in Successful',
          detail: 'Welcome to CookIQ!',
        });

        sessionStorage.removeItem('oauth-login');
      }
    });

    // Only update user state on auth changes, without triggering silent refresh.
    supabaseService.client.auth.onAuthStateChange((_event, session) => {
      this.user.set(session?.user ?? null);
    });
  }

  // ==========================
  // EMAIL LOGIN
  // ==========================
  async login(email: string, password: string): Promise<boolean> {
    this.loading.set(true);
    const { data, error } = await this.supabaseService.client.auth.signInWithPassword({ email, password });
    this.loading.set(false);

    if (error) {
      this.toast.add({
        severity: 'error',
        summary: 'Login Failed',
        detail: this.mapAuthError(error.message),
      });

      return false;
    }

    this.user.set(data.user);

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

    if (error) {
      this.toast.add({
        severity: 'error',
        summary: 'Registration Failed',
        detail: this.mapAuthError(error.message),
      });

      return false;
    }

    if (!data.user?.confirmed_at) {
      this.toast.add({
        severity: 'info',
        summary: 'Email Confirmation Required',
        detail: 'Please check your email to verify your account.',
      });

      return false;
    }

    this.user.set(data.user);

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

    const { error } = await this.supabaseService.client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      sessionStorage.removeItem('oauth-login');

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

    this.toast.add({
      severity: 'info',
      summary: 'Logged Out',
      detail: 'You have been logged out.',
    });

  }


  // ==========================
  // HELPERS
  // ==========================
  private mapAuthError(message: string): string {
    if (message.includes('Invalid login')) return 'Invalid email or password';
    if (message.includes('Email not confirmed')) return 'Please verify your email';
    if (message.includes('User already registered')) return 'User already exists';
    return 'Something went wrong. Please try again.';
  }

  isLoggedIn() {
    return !!this.user();
  }

}