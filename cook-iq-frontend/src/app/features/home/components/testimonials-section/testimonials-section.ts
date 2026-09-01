import { Component } from '@angular/core';
import { TESTIMONIALS } from '../../data/home.data';
import { CommonModule } from '@angular/common';
import { LucideIconsModule } from '../../../../shared/icons/lucide-icons.module';
import { Testimonial } from '../../models/home.models';

@Component({
  selector: 'app-testimonials-section',
  imports: [CommonModule, LucideIconsModule],
  templateUrl: './testimonials-section.html',
  styleUrl: './testimonials-section.css'
})
export class TestimonialsSection {
  readonly testimonials: Testimonial[] = TESTIMONIALS;

}