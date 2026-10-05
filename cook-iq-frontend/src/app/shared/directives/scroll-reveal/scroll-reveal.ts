import { Directive, ElementRef, Injectable, OnDestroy, OnInit, PLATFORM_ID, inject, input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class RevealObserver {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly callbacks = new Map<Element, () => void>();
  private io?: IntersectionObserver;

  observe(el: Element, cb: () => void, threshold = 0.8): void {
    if (!this.isBrowser) return;
    this.io ??= new IntersectionObserver(entries => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        this.callbacks.get(e.target)?.();
        this.unobserve(e.target);
      }
    }, { threshold });
    this.callbacks.set(el, cb);
    this.io.observe(el);
  }

  unobserve(el: Element): void {
    this.io?.unobserve(el);
    this.callbacks.delete(el);
  }
}

export type RevealVariant = 'up' | 'left' | 'right' | 'scale' | 'flip';

@Directive({ selector: '[appReveal]' })
export class ScrollReveal implements OnInit, OnDestroy {
  /** Usage: <h2 appReveal> or <p appReveal="right" [revealDelay]="0.15"> */
  readonly appReveal = input<RevealVariant | ''>('');
  readonly revealDelay = input(0);

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly observer = inject(RevealObserver);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  ngOnInit(): void {
    if (!this.isBrowser) return; // SSR renders content visible
    const variant = this.appReveal() || 'up';
    this.el.setAttribute('data-reveal', variant);
    if (this.revealDelay()) this.el.style.setProperty('--reveal-delay', `${this.revealDelay()}s`);

    this.observer.observe(this.el, () => {
      this.el.classList.add('is-visible');
      // Remove delay after entrance so hover transitions stay instant
      this.el.addEventListener('transitionend', () => this.el.style.removeProperty('--reveal-delay'), { once: true });
    });
  }

  ngOnDestroy(): void { this.observer.unobserve(this.el); }
}