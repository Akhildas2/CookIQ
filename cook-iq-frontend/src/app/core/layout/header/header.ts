import { Component, computed, effect, inject, signal } from '@angular/core';
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

@Component({
  selector: 'app-header',
  imports: [CommonModule, MaterialImportsModule, RouterModule, ClickOutside],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  auth = inject(AuthService);
  dialog = inject(MatDialog);
  billingService = inject(BillingService);
  menuOpen = signal<boolean>(false);
  mobileMenuOpen = signal<boolean>(false);
  plusVisible = signal(true);
  plan = this.auth.plan;
  subscriptionLoading = computed(() => this.billingService.subscriptionLoading());

  navItems: NavItem[] = [
    { label: 'Home', route: '/', icon: 'home', exact: true },
    { label: 'Recipes', route: '/recipes', icon: 'cookie' },
    { label: 'AI Cook', route: '/ai', icon: 'auto_awesome' },
  ];

  // show plus only if plan is free AND user didn't hide
  showPlus = computed(() => {
    return this.auth.plan() === 'free' && this.plusVisible();
  });

  planBadgeClass = computed(() =>
    getPlanBadgeClass(this.auth.plan())
  );

  planIcon = computed(() =>
    getPlanIcon(this.auth.plan())
  );

  // Computed avatar
  avatarUrl = computed(() => {
    const user = this.auth.user();
    if (!user) return '';

    const avatar = user?.user_metadata?.avatar_url;

    if (avatar && avatar.startsWith('http')) {
      return avatar;
    }

    const name =
      user?.user_metadata?.full_name ||
      user?.email ||
      'CookIQ';

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=22c55e&color=ffffff`;
  });

  // Handle avatar image error
  handleAvatarError(event: Event) {
    const img = event.target as HTMLImageElement;

    const user = this.auth.user();
    const name =
      user?.user_metadata?.full_name ||
      user?.email ||
      'CookIQ';

    img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=22c55e&color=ffffff`;
  }

  // Computed user name
  userName = computed(() => {
    const user = this.auth.user();
    if (!user) return 'User';

    let name =
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email ||
      'User';

    if (name.includes('@')) {
      name = name.split('@')[0];
    }

    if (name.length >= 10) {
      name = name.slice(0, 10) + '...';
    }

    return name;
  });

  constructor() {
    const hidden = localStorage.getItem('hidePlus');
    if (hidden === 'true') {
      this.plusVisible.set(false);
    }
  }

  // Auth dialog
  openAuth(mode: 'login' | 'register') {
    this.dialog.open(AuthDialog, {
      data: { mode },
      width: '420px',
      maxWidth: '90vw',
      panelClass: 'auth-dialog-panel',
      disableClose: true,
    });
  }

  // Pricing modal
  openPricingModal() {
    this.dialog.open(PricingModal, {
      width: '95vw',
      maxWidth: '1200px',
      panelClass: 'custom-pricing-dialog',
      autoFocus: false
    });
  }

  // Menu toggles
  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  // Toolbar menu toggle
  toggleMenu() {
    this.menuOpen.update(v => !v);
  }

  // Hide plus button
  hidePlus(event: Event) {
    event.stopPropagation(); // prevent button click
    this.plusVisible.set(false);

    // optional: remember in localStorage
    localStorage.setItem('hidePlus', 'true');
  }

  // logout
  async logout() {

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

    await this.auth.logout();
    this.menuOpen.set(false);
  }

}