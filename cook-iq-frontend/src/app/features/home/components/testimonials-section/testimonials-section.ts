import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { TESTIMONIALS } from '../../data/home.data';
import { ScrollReveal } from '../../../../shared/directives/scroll-reveal/scroll-reveal';
import { SectionHeader } from '../../../../shared/ui/section-header/section-header';
import { LucideIconsModule } from '../../../../shared/icons/lucide-icons.module';

@Component({
  selector: 'app-testimonials-section',
  imports: [ScrollReveal, SectionHeader, LucideIconsModule],
  templateUrl: './testimonials-section.html',
  styleUrl: './testimonials-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialsSection {
  private readonly destroyRef = inject(DestroyRef);
  protected readonly testimonials = TESTIMONIALS;
  protected readonly activeIndex = signal(0);

  /**
   * Number of testimonials visible according to viewport.
   */
  protected readonly visibleCount = signal(3);

  protected readonly visibleTestimonials = computed(() => {
    const start = this.activeIndex();
    const count = this.visibleCount();
    const total = this.testimonials.length;

    if (total === 0) {
      return [];
    }

    return Array.from(
      {
        length: Math.min(count, total),
      },
      (_, offset) =>
        this.testimonials[(start + offset) % total],
    );
  });

  /**
   * First visible testimonial number.
   */
  protected readonly firstVisibleNumber = computed(() => {
    const total = this.testimonials.length;

    if (total === 0) {
      return 0;
    }

    return this.activeIndex() + 1;
  });

  /**
   * Last visible testimonial number.
   */
  protected readonly lastVisibleNumber = computed(() => {
    const total = this.testimonials.length;
    const count = this.visibleCount();

    if (total === 0) {
      return 0;
    }

    return (
      (this.activeIndex() + count - 1) % total + 1
    );
  });

  constructor() {
    this.updateVisibleCount();

    const mediaQuery = window.matchMedia('(max-width: 900px)');
    const mobileQuery = window.matchMedia('(max-width: 600px)');

    const update = () => {
      this.updateVisibleCount();
    };

    mediaQuery.addEventListener('change', update);
    mobileQuery.addEventListener('change', update);

    this.destroyRef.onDestroy(() => {
      mediaQuery.removeEventListener('change', update);
      mobileQuery.removeEventListener('change', update);
    });
  }

  /**
   * Update number of visible testimonials.
   */
  private updateVisibleCount(): void {
    if (window.innerWidth <= 600) {
      this.visibleCount.set(1);
    } else if (window.innerWidth <= 900) {
      this.visibleCount.set(2);
    } else {
      this.visibleCount.set(3);
    }

    // Keep the active index valid after changing layout.
    const total = this.testimonials.length;

    if (total > 0) {
      this.activeIndex.update(
        (index) => index % total,
      );
    }
  }

  /**
   * Go to previous testimonial.
   */
  protected prevSlide(): void {
    const total = this.testimonials.length;

    if (total <= 1) {
      return;
    }

    this.activeIndex.update(
      (index) => (index - 1 + total) % total,
    );
  }

  /**
   * Go to next testimonial.
   */
  protected nextSlide(): void {
    const total = this.testimonials.length;

    if (total <= 1) {
      return;
    }

    this.activeIndex.update(
      (index) => (index + 1) % total,
    );
  }

}