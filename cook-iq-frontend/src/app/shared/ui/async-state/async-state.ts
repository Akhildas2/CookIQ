import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideIconsModule } from '../../icons/lucide-icons.module';
import { ScrollReveal } from '../../directives/scroll-reveal/scroll-reveal';

export type AsyncStateType = 'loading' | 'error' | 'empty' | 'not-found';

interface AsyncStateConfig {
  icon: string;
  defaultTitle: string;
  defaultDescription: string;
}

@Component({
  selector: 'app-async-state',
  imports: [LucideIconsModule, ScrollReveal],
  templateUrl: './async-state.html',
  styleUrl: './async-state.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsyncState {
  /** Determines the current UI state. */
  readonly state = input<AsyncStateType>('loading');

  /** Optional small heading above the icon. */
  readonly eyebrow = input<string>('');

  /** Optional custom title. */
  readonly title = input<string>('');

  /** Optional custom description. */
  readonly description = input<string>('');

  /** Reduces the component's height and spacing. */
  readonly compact = input<boolean>(false);

  /** Optional action button label. */
  readonly actionLabel = input<string>('');

  /** Optional Lucide action icon. */
  readonly actionIcon = input<string>('');

  /** Disables the action button when true. */
  readonly actionDisabled = input<boolean>(false);

  /** Emitted when the action button is clicked. */
  readonly action = output<void>();

  protected readonly stateConfig: Record<
    AsyncStateType,
    AsyncStateConfig
  > = {
      loading: {
        icon: 'loader-circle',
        defaultTitle: 'Preparing something good',
        defaultDescription:
          'We are getting everything ready for you. This will only take a moment.',
      },

      error: {
        icon: 'alert-circle',
        defaultTitle: 'Something went wrong',
        defaultDescription:
          'We could not load this content. Please try again in a moment.',
      },

      empty: {
        icon: 'package-open',
        defaultTitle: 'A little room for something good',
        defaultDescription:
          'Nothing has been added here just yet. Your next great idea can start here.',
      },

      'not-found': {
        icon: 'search-x',
        defaultTitle: 'Nothing on the menu',
        defaultDescription:
          'We could not find a match. Try changing your search or adjusting your filters.',
      },
    };

  protected get currentConfig(): AsyncStateConfig {
    return this.stateConfig[this.state()];
  }

  protected get displayTitle(): string {
    return (
      this.title().trim() ||
      this.currentConfig.defaultTitle
    );
  }

  protected get displayDescription(): string {
    return (
      this.description().trim() ||
      this.currentConfig.defaultDescription
    );
  }

  protected get displayActionIcon(): string {
    const customIcon = this.actionIcon().trim();

    if (customIcon) {
      return customIcon;
    }

    return this.state() === 'error'
      ? 'refresh-cw'
      : 'arrow-right';
  }

  protected onAction(): void {
    if (
      !this.actionDisabled() &&
      this.state() !== 'loading'
    ) {
      this.action.emit();
    }
  }

}