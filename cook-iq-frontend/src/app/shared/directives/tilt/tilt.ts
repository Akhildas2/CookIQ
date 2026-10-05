import { isPlatformBrowser } from '@angular/common';
import { Directive, ElementRef, inject, input, PLATFORM_ID } from '@angular/core';

@Directive({
  selector: '[appTilt]',
  host: { '(mousemove)': 'onMove($event)', '(mouseleave)': 'reset()' },
})
export class Tilt {

  readonly maxX = input(12); // degrees
  readonly maxY = input(8);

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly enabled =
    isPlatformBrowser(inject(PLATFORM_ID)) &&
    matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches;

  onMove(e: MouseEvent): void {
    if (!this.enabled) return;
    const r = this.el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    this.el.style.transform =
      `perspective(900px) translateY(-8px) scale(1.01) rotateY(${x * this.maxX()}deg) rotateX(${-y * this.maxY()}deg)`;
  }

  reset(): void { this.el.style.transform = ''; }

}