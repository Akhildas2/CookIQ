import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Inject, OnDestroy, PLATFORM_ID, QueryList, ViewChildren } from '@angular/core';
import { SiteStat } from '../../models/home.models';
import { SITE_STATS } from '../../data/home.data';

@Component({
  selector: 'app-stats-section',
  imports: [CommonModule],
  templateUrl: './stats-section.html',
  styleUrl: './stats-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsSection implements AfterViewInit, OnDestroy {
  readonly stats: SiteStat[] = SITE_STATS;

  @ViewChildren('statValue')
  statEls!: QueryList<ElementRef<HTMLElement>>;

  private io?: IntersectionObserver;

  constructor(
    @Inject(PLATFORM_ID)
    private platformId: object
  ) { }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          const el = entry.target as HTMLElement;

          const idx = Number(el.dataset['idx']);

          const stat = this.stats[idx];

          if (stat) {
            this.animateCounter(el, stat);
          }

          this.io?.unobserve(el);
        });
      },
      {
        threshold: 0.5,
      }
    );

    this.statEls.forEach((elRef, index) => {
      const el = elRef.nativeElement;

      el.dataset['idx'] = index.toString();

      this.io?.observe(el);
    });
  }

  private animateCounter(
    el: HTMLElement,
    stat: SiteStat
  ): void {
    const duration = 1800;

    const start = performance.now();

    const update = (now: number) => {
      const progress = Math.min(
        (now - start) / duration,
        1
      );

      const eased =
        1 - Math.pow(1 - progress, 4);

      const currentValue = stat.isDecimal
        ? (eased * stat.value).toFixed(1)
        : Math.floor(eased * stat.value);

      el.textContent =
        `${stat.prefix ?? ''}${currentValue}${stat.suffix ?? ''}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }

  trackByLabel(
    index: number,
    item: SiteStat
  ): string {
    return item.label;
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }

}