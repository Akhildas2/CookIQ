import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CTA_CONTENT } from '../../data/home.data';
import { RouterLink } from '@angular/router';
import { LucideIconsModule } from '../../../../shared/icons/lucide-icons.module';
import { ScrollReveal } from '../../../../shared/directives/scroll-reveal/scroll-reveal';
import { PricingModal } from '../../../billing/components/pricing-modal/pricing-modal';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-cta-section',
  imports: [RouterLink, LucideIconsModule, ScrollReveal],
  templateUrl: './cta-section.html',
  styleUrl: './cta-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtaSection {
  dialog = inject(MatDialog);

  protected readonly cta = CTA_CONTENT;

  protected openPricing(): void {
    this.dialog.open(PricingModal, {
      width: '95vw',
      maxWidth: '1200px',
      panelClass: 'custom-pricing-dialog',
      autoFocus: false
    });
  }
}