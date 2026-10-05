import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject, OnDestroy, PLATFORM_ID, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-cursor',
  imports: [],
  templateUrl: './cursor.html',
  styleUrl: './cursor.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.hovering]': 'hovering()', '[class.active]': 'active()' },
})
export class Cursor implements OnDestroy {
  private readonly dot = viewChild.required<ElementRef<HTMLElement>>('dot');
  private readonly ring = viewChild.required<ElementRef<HTMLElement>>('ring');

  readonly hovering = signal(false);
  readonly active = signal(false);

  private mx = 0; private my = 0; private rx = 0; private ry = 0;
  private raf = 0;
  private readonly cleanup: Array<() => void> = [];

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    afterNextRender(() => {
      const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
      const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!fine || calm) return;

      const on = <K extends keyof DocumentEventMap>(t: K, fn: (e: DocumentEventMap[K]) => void) => {
        document.addEventListener(t, fn as EventListener);
        this.cleanup.push(() => document.removeEventListener(t, fn as EventListener));
      };

      on('mousemove', e => {
        this.mx = e.clientX; this.my = e.clientY;
        this.active.set(true);
        const d = this.dot().nativeElement;
        d.style.left = `${this.mx}px`; d.style.top = `${this.my}px`;
      });
      on('mouseover', e => this.hovering.set(!!(e.target as Element).closest('a, button, [data-cursor]')));
      on('mouseleave', () => this.active.set(false));

      const loop = () => {
        this.rx += (this.mx - this.rx) * 0.12;
        this.ry += (this.my - this.ry) * 0.12;
        const r = this.ring().nativeElement;
        r.style.left = `${this.rx}px`; r.style.top = `${this.ry}px`;
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    this.cleanup.forEach(fn => fn());
  }
}