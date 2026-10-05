import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RevealVariant, ScrollReveal } from '../../directives/scroll-reveal/scroll-reveal';
import { SectionHeaderVariant } from '../../../features/home/models/home.models';

@Component({
  selector: 'app-section-header',
  imports: [ScrollReveal],
  templateUrl: './section-header.html',
  styleUrl: './section-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionHeader {
  //Visual layout variant
  readonly variant = input<SectionHeaderVariant>('default');
  readonly eyebrow = input(''); // Small eyebrow / identity label
  readonly title = input('');// Main heading first part
  readonly highlight = input(''); // Highlighted / italic heading part
  readonly description = input(''); // Optional description
  readonly meta = input(''); // Optional meta / subheading
  readonly index = input(''); // Optional section index / system label

  readonly identity = input('');// Process-header identity label
  readonly showIdentity = input(false); // Whether the process identity should be displayed
  readonly showRule = input(true);//  Whether the decorative horizontal rule is displayed
  readonly reveal = input<RevealVariant>('up');// Reveal animation variant
  readonly revealDelay = input(0); // Reveal delay
}