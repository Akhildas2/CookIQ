import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject, PLATFORM_ID, viewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HOW_IT_WORKS_STEPS } from '../../data/home.data';
import { RevealObserver, ScrollReveal } from '../../../../shared/directives/scroll-reveal/scroll-reveal';
import { SectionHeader } from '../../../../shared/ui/section-header/section-header';

@Component({
  selector: 'app-how-it-works-section',
  imports: [ScrollReveal, SectionHeader],
  templateUrl: './how-it-works-section.html',
  styleUrl: './how-it-works-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HowItWorksSection {
  protected readonly steps = HOW_IT_WORKS_STEPS;
  private readonly stepsList = viewChild.required<ElementRef<HTMLElement>>('stepsList');
  private readonly observer = inject(RevealObserver);

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    afterNextRender(() => {
      const el = this.stepsList().nativeElement;
      this.observer.observe(el, () => el.classList.add('draw'), 0.4);
    });
  }

}