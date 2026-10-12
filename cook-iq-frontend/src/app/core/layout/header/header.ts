import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth/auth-service';
import { MatDialog } from '@angular/material/dialog';
import { AuthDialog } from '../../../features/auth/components/auth-dialog/auth-dialog';
import { CommonModule } from '@angular/common';
import { MaterialImportsModule } from '../../../shared/material/material.imports';
import { RouterModule } from '@angular/router';
import { ClickOutside } from '../../../shared/directives/click-outside/click-outside';
import { PricingModal } from '../../../features/billing/components/pricing-modal/pricing-modal';
import { BillingService } from '../../../features/billing/services/billing/billing-service';
import { getPlanBadgeClass, getPlanIcon } from '../../../shared/utils/plan.utils';
import { ConfirmDialog } from '../../../shared/dialogs/confirm-dialog/confirm-dialog';
import { firstValueFrom } from 'rxjs';
import { ACCOUNT_NAV_ITEMS, PUBLIC_NAV_ITEMS } from './header.types';

@Component({
  selector: 'app-header',
  imports: [CommonModule, MaterialImportsModule, RouterModule, ClickOutside],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  readonly billingService = inject(BillingService);

  readonly menuOpen = signal(false);
  readonly mobileMenuOpen = signal(false);
  readonly plusVisible = signal(true);

  readonly navItems = PUBLIC_NAV_ITEMS;
  readonly accountNavItems = ACCOUNT_NAV_ITEMS;

  readonly plan = this.auth.plan;

  readonly subscriptionLoading = computed(
    () => this.billingService.subscriptionLoading(),
  );

  readonly showPlus = computed(
    () => this.auth.plan() === 'free' && this.plusVisible(),
  );

  readonly planBadgeClass = computed(
    () => getPlanBadgeClass(this.auth.plan()),
  );

  readonly planIcon = computed(
    () => getPlanIcon(this.auth.plan()),
  );

  // Computed user name
  readonly userName = computed(() => {
    const user = this.auth.user();
    const fullName = user?.user_metadata?.full_name ??
      user?.user_metadata?.name ??
      user?.email ?? 'User';

    const name = fullName.includes('@')
      ? fullName.split('@')[0] : fullName;

    return name.length > 10
      ? `${name.slice(0, 10)}...` : name;
  });

  // Computed avatar
  readonly avatarUrl = computed(() => {
    const user = this.auth.user();
    if (!user) return '';

    const avatar = user.user_metadata?.avatar_url;

    if (typeof avatar === 'string' && avatar.startsWith('https://')) {
      return avatar;
    }

    return this.createAvatarUrl(
      user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? 'CookIQ',
    );
  });

  constructor() {
    try {
      this.plusVisible.set(
        localStorage.getItem('hidePlus') !== 'true',
      );
    } catch {
      // Continue normally when storage is unavailable.
    }
  }

  private createAvatarUrl(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1c3a2b&color=faf7f0`;
  }

  // Handle avatar image error
  handleAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const fallback = this.createAvatarUrl(this.userName());

    // Prevent an infinite image-error loop.
    if (img.src !== fallback) {
      img.src = fallback;
    }
  }

  // Auth dialog
  openAuth(mode: 'login' | 'register'): void {
    this.dialog.open(AuthDialog, {
      data: { mode },
      width: '420px',
      maxWidth: '90vw',
      panelClass: 'auth-dialog-panel',
      disableClose: true,
    });
  }

  // Pricing modal
  openPricingModal(): void {
    this.dialog.open(PricingModal, {
      width: '95vw',
      maxWidth: '1200px',
      panelClass: 'custom-pricing-dialog',
      autoFocus: false
    });
  }

  // Menu toggles
  toggleMobileMenu(): void {
    this.menuOpen.set(false);
    this.mobileMenuOpen.update((open) => !open);
  }

  // Toolbar menu toggle
  toggleMenu(): void {
    this.mobileMenuOpen.set(false);
    this.menuOpen.update((open) => !open);
  }

  // Hide plus button
  hidePlus(event: Event): void {
    event.stopPropagation();
    this.plusVisible.set(false);

    try {
      localStorage.setItem('hidePlus', 'true');
    } catch {
      // Hiding the button still works for this session.
    }
  }

  closeMenus(): void {
    this.menuOpen.set(false);
    this.mobileMenuOpen.set(false);
  }

  // logout
  async logout(): Promise<void> {

    const ref = this.dialog.open(ConfirmDialog, {
      disableClose: true,
      data: {
        icon: 'power_settings_new',
        title: 'See you soon?',
        message: 'Are you sure you would like to log out of your CookIQ account?',
        confirmText: 'Log Me Out',
        confirmIcon: 'logout',
        cancelText: 'Stay Logged In',
        cancelIcon: 'close',
        variant: 'warning'
      }
    });

    const confirmed = await firstValueFrom(ref.afterClosed());
    if (!confirmed) return;

    try {
      await this.auth.logout();
    } finally {
      this.closeMenus();
    }
  }

}