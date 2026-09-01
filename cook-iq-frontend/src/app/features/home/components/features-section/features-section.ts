import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Inject, OnDestroy, PLATFORM_ID, QueryList, ViewChildren } from '@angular/core';
import { LucideIconsModule } from '../../../../shared/icons/lucide-icons.module';
import { FEATURES } from '../../data/home.data';
import { Feature } from '../../models/home.models';

@Component({
  selector: 'app-features-section',
  imports: [CommonModule, LucideIconsModule],
  templateUrl: './features-section.html',
  styleUrl: './features-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturesSection implements AfterViewInit, OnDestroy {
  readonly features: Feature[] = FEATURES;

  @ViewChildren('featureCard')
  featureCards!: QueryList<ElementRef<HTMLElement>>;

  private tiltHandlers = new Map<HTMLElement, {
    move: (event: MouseEvent) => void;
    leave: () => void;
  }>();

  constructor(@Inject(PLATFORM_ID) private platformId: object) { }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.featureCards.forEach(cardRef => {
      const card = cardRef.nativeElement;

      const onMove = (event: MouseEvent): void => {
        const rect = card.getBoundingClientRect();

        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        card.style.transform = `translateY(-8px) scale(1.01)
          rotateY(${x * 12}deg) rotateX(${-y * 8}deg)`;
      };

      const onLeave = (): void => { card.style.transform = ''; };

      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);

      this.tiltHandlers.set(card, { move: onMove, leave: onLeave });
    });
  }

  trackByFeature(index: number, item: Feature): string {
    return item.title;
  }

  ngOnDestroy(): void {
    this.tiltHandlers.forEach(
      ({ move, leave }, card) => {
        card.removeEventListener('mousemove', move);
        card.removeEventListener('mouseleave', leave);
      }
    );

    this.tiltHandlers.clear();
  }

}