import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RevealVariant, ScrollReveal } from '../../directives/scroll-reveal/scroll-reveal';
import { SectionHeaderVariant } from '../../../features/home/models/home.models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-section-header',
  imports: [ScrollReveal, RouterLink],
  templateUrl: './section-header.html',
  styleUrl: './section-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionHeader {
  // =========================================================
  // VISUAL
  // =========================================================

  readonly variant = input<SectionHeaderVariant>('default');

  // =========================================================
  // CONTENT
  // =========================================================

  readonly eyebrow = input('');
  readonly title = input('');
  readonly highlight = input('');
  readonly description = input('');

  readonly meta = input('');
  readonly index = input('');

  // =========================================================
  // PROCESS VARIANT
  // =========================================================

  readonly identity = input('');
  readonly showIdentity = input(false);
  readonly showRule = input(true);

  // =========================================================
  // ACTION
  // =========================================================

  readonly actionLabel = input('');
  readonly actionNote = input('');
  readonly actionLink = input('');

  // =========================================================
  // REVEAL
  // =========================================================

  readonly reveal = input<RevealVariant>('up');
  readonly revealDelay = input(0);

}