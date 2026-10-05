import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideIconsModule } from '../../../../shared/icons/lucide-icons.module';
import { HERO_CALLOUTS, HERO_MATCH, HERO_REASONING, HERO_TRUST, HERO_WORDS } from '../../data/home.data';
import { Callout } from '../../models/home.models';
import { ScrollReveal } from '../../../../shared/directives/scroll-reveal/scroll-reveal';

@Component({
  selector: 'app-hero-section',
  imports: [RouterModule, LucideIconsModule, ScrollReveal],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSection {
  protected readonly callouts = HERO_CALLOUTS;
  protected readonly match = HERO_MATCH;
  protected readonly trust = HERO_TRUST;
  protected readonly reasoning = HERO_REASONING;
  private readonly index = signal(0);
  protected readonly currentWord = computed(() => HERO_WORDS[this.index()]);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      const id = setInterval(() => {
        this.index.update((i) => (i + 1) % HERO_WORDS.length);
      }, 2800);
      destroyRef.onDestroy(() => clearInterval(id));
    });
  }

  protected getMidX(c: Callout): number {
    return c.pin.x + (c.anchor.x - c.pin.x) * 0.5;
  }

  // Generates smooth orthogonal paths with rounded corners
  protected getPath(c: Callout): string {
    const startX = c.pin.x;
    const startY = c.pin.y;
    const endX = c.anchor.x;
    const endY = c.anchor.y;

    const midX = this.getMidX(c);
    const r = 4; // Corner radius

    const dirX = endX > startX ? 1 : -1;
    const dirY = endY > startY ? 1 : -1;

    // Direct horizontal or vertical fallbacks
    if (Math.abs(startX - endX) < 1 || Math.abs(startY - endY) < 1) {
      return `M ${startX} ${startY} L ${endX} ${endY}`;
    }

    return `M ${startX} ${startY} 
            L ${midX - dirX * r} ${startY} 
            Q ${midX} ${startY}, ${midX} ${startY + dirY * r} 
            L ${midX} ${endY - dirY * r} 
            Q ${midX} ${endY}, ${midX + dirX * r} ${endY} 
            L ${endX} ${endY}`;
  }

}