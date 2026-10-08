import { Component, input, output } from '@angular/core';
import { LucideIconsModule } from '../../icons/lucide-icons.module';

export type AsyncStateType = 'loading' | 'error' | 'empty' | 'not-found';

@Component({
  selector: 'app-async-state',
  imports: [LucideIconsModule],
  templateUrl: './async-state.html',
  styleUrl: './async-state.css',
})
export class AsyncState {

  /* =========================================================
     STATE
     ========================================================= */
  readonly state = input<AsyncStateType>('loading');


  /* =========================================================
     CONTENT
     ========================================================= */

  readonly eyebrow = input('');
  readonly title = input('');
  readonly description = input('');


  /* =========================================================
     ACTION
     ========================================================= */

  readonly actionLabel = input('');
  readonly actionIcon = input('arrow-up-right');
  readonly actionDisabled = input(false);
  readonly action = output<void>();


  /* =========================================================
     EVENTS
     ========================================================= */

  onAction(): void {
    if (this.actionDisabled()) {
      return;
    }

    this.action.emit();
  }

}