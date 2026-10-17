import { Component, input } from '@angular/core';
import { LucideIconsModule } from '../../icons/lucide-icons.module';

@Component({
  selector: 'app-stat-card',
  imports: [LucideIconsModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
})
export class StatCard {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly value = input.required<number | string>();
  readonly unit = input('');
  readonly tone = input<'green' | 'gold' | 'spice'>('green');
  readonly badge = input('');

}