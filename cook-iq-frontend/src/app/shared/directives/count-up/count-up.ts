import { Directive, ElementRef, inject, input, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { RevealObserver } from '../scroll-reveal/scroll-reveal';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appCountUp]',
})
export class CountUp implements OnInit, OnDestroy {

  readonly appCountUp = input.required<number>();
  readonly prefix = input('');
  readonly suffix = input('');
  readonly decimals = input(0);
  readonly duration = input(1800);

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly observer = inject(RevealObserver);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private raf = 0;

  ngOnInit(): void {
    // Final value first: SSR, reduced motion and no-JS all see the truth.
    this.render(this.appCountUp());
    if (!this.isBrowser || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.render(0);
    this.observer.observe(this.el, () => this.run(), 0.5);
  }

  private run(): void {
    const target = this.appCountUp();
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / this.duration(), 1);
      this.render(target * (1 - Math.pow(1 - p, 4))); // easeOutQuart
      if (p < 1) this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  private render(n: number): void {
    this.el.textContent = `${this.prefix()}${n.toFixed(this.decimals())}${this.suffix()}`;
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    this.observer.unobserve(this.el);
  }

}
