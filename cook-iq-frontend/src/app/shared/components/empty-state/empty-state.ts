import { Component, input } from '@angular/core';
import { LucideIconsModule } from '../../icons/lucide-icons.module';

@Component({
  selector: 'app-empty-state',
  imports: [LucideIconsModule],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
})
export class EmptyState {
  readonly icon = input('search-x');
  readonly title = input.required<string>();
  readonly description = input<string | null>('');
  readonly variant = input<'default' | 'error'>('default');
  readonly compact = input(false);

}