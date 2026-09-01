import { AfterViewInit, Component, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HOW_IT_WORKS_STEPS } from '../../data/home.data';
import { Step } from '../../models/home.models';

@Component({
  selector: 'app-how-it-works-section',
  imports: [CommonModule],
  templateUrl: './how-it-works-section.html',
  styleUrl: './how-it-works-section.css'
})
export class HowItWorksSection implements AfterViewInit, OnDestroy {
  readonly steps: Step[] = HOW_IT_WORKS_STEPS;
  private io!: IntersectionObserver;

  constructor(@Inject(PLATFORM_ID) private platformId: object) { }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const connector = document.getElementById('hiw-connector');
    const stepsEl = document.querySelector('.hiw-steps');

    if (!connector || !stepsEl) return;

    this.io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            connector.classList.add('draw');
            this.io?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    this.io.observe(stepsEl);
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }

}