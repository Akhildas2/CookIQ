import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideIconsModule } from '../../../../shared/icons/lucide-icons.module';

@Component({
  selector: 'app-hero-section',
  imports: [CommonModule, RouterModule, LucideIconsModule],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSection implements OnInit, OnDestroy {
  readonly words = ['leftovers', 'pantry staples', 'random bits', 'anything'];
  currentWordIndex = 0;
  currentWord = this.words[0];
  isAnimating = false;

  private intervalId!: number;

  ngOnInit() {
    this.intervalId = window.setInterval(() => {
      this.isAnimating = true;

      setTimeout(() => {
        this.currentWordIndex =
          (this.currentWordIndex + 1) % this.words.length;

        this.currentWord = this.words[this.currentWordIndex];
        this.isAnimating = false;
      }, 400);
    }, 2800);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

}