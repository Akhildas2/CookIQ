import { Component } from '@angular/core';
import { HeroSection } from '../../components/hero-section/hero-section';
import { StatsSection } from '../../components/stats-section/stats-section';
import { FeaturesSection } from '../../components/features-section/features-section';
import { HowItWorksSection } from '../../components/how-it-works-section/how-it-works-section';
import { TestimonialsSection } from '../../components/testimonials-section/testimonials-section';
import { CtaSection } from '../../components/cta-section/cta-section';

@Component({
  imports: [HeroSection, StatsSection, FeaturesSection, HowItWorksSection, TestimonialsSection, CtaSection],
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}