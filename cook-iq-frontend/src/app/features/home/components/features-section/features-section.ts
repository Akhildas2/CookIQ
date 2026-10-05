import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideIconsModule } from '../../../../shared/icons/lucide-icons.module';
import { FEATURES } from '../../data/home.data';
import { Tilt } from '../../../../shared/directives/tilt/tilt';
import { ScrollReveal } from '../../../../shared/directives/scroll-reveal/scroll-reveal';
import { SectionHeader } from '../../../../shared/ui/section-header/section-header';

@Component({
  selector: 'app-features-section',
  imports: [LucideIconsModule, Tilt, ScrollReveal, SectionHeader],
  templateUrl: './features-section.html',
  styleUrl: './features-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturesSection {
  protected readonly features = FEATURES;

}