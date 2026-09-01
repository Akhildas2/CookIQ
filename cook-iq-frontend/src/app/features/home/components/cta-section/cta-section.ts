import { Component } from '@angular/core';
import { CTA_CONTENT } from '../../data/home.data';
import { CTAContent } from '../../models/home.models';

@Component({
  selector: 'app-cta-section',
  imports: [],
  templateUrl: './cta-section.html',
  styleUrl: './cta-section.css'
})
export class CtaSection {
  readonly cta: CTAContent = CTA_CONTENT;

}