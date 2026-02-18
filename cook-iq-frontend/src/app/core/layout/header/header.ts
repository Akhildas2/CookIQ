import { Component, effect, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth/auth-service';
import { MatDialog } from '@angular/material/dialog';
import { AuthDialog } from '../../../shared/dialogs/auth-dialog/auth-dialog';
import { CommonModule } from '@angular/common';
import { MaterialImportsModule } from '../../../shared/material/material.imports';
import { RouterModule } from '@angular/router';
import { ClickOutside } from '../../../shared/directives/click-outside/click-outside';

@Component({
  selector: 'app-header',
  imports: [CommonModule, MaterialImportsModule, RouterModule, ClickOutside],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  auth = inject(AuthService);
  dialog = inject(MatDialog);
  avatarUrl = signal<string>('');
  menuOpen = signal<boolean>(false);
  mobileMenuOpen = signal<boolean>(false);

  constructor() {
    effect(() => {
      const user = this.auth.user();

      this.avatarUrl.set(
        user?.user_metadata?.avatar_url ||
        `https://ui-avatars.com/api/?name=${user?.email || 'CookIQ'}`
      );
    });
  }

  navItems: NavItem[] = [
    { label: 'Home', route: '/', icon: 'home', exact: true },
    { label: 'Recipes', route: '/recipes', icon: 'cookie' },
    { label: 'AI Cook', route: '/ai', icon: 'auto_awesome' },
    { label: 'About', route: '/about', icon: 'info' },
  ];

  openAuth(mode: 'login' | 'register') {
    this.dialog.open(AuthDialog, {
      data: { mode },
      width: '420px',
      maxWidth: '90vw',
      panelClass: 'auth-dialog-panel',
      disableClose: true,
    });
  }

  get userName(): string {
    const user = this.auth.user();
    return (
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      'User'
    );
  }

  setFallbackAvatar() {
    const user = this.auth.user();
    const name = user?.user_metadata?.full_name || user?.email || 'CookIQ';

    this.avatarUrl.set(
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E0E0E0&color=22c55e`
    );
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }

  logout() {
    this.auth.logout();
    this.menuOpen.set(false);
  }

}