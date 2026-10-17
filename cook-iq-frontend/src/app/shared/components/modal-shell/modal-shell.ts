import { afterNextRender, Component, ElementRef, HostListener, input, OnDestroy, output, viewChild } from '@angular/core';
import { LucideIconsModule } from '../../icons/lucide-icons.module';

let nextModalId = 0;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

@Component({
  selector: 'app-modal-shell',
  imports: [LucideIconsModule],
  templateUrl: './modal-shell.html',
  styleUrl: './modal-shell.css',
})
export class ModalShell implements OnDestroy {
  readonly title = input.required<string>();
  readonly eyebrow = input('');
  readonly subtitle = input('');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  /** Set true while saving/scanning so the user cannot dismiss the dialog. */
  readonly closeDisabled = input(false);

  readonly closed = output<void>();

  protected readonly titleId = `modal-title-${nextModalId++}`;

  private readonly dialog = viewChild.required<ElementRef<HTMLElement>>('dialog');
  private previouslyFocused: HTMLElement | null = null;

  constructor() {
    afterNextRender(() => {
      this.previouslyFocused = document.activeElement as HTMLElement | null;
      document.body.style.overflow = 'hidden';
      this.dialog().nativeElement.focus();
    });
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
    this.previouslyFocused?.focus?.();
  }

  requestClose(): void {
    if (!this.closeDisabled()) {
      this.closed.emit();
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.requestClose();
  }

  // Keep Tab focus inside the dialog.
  @HostListener('keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;

    const root = this.dialog().nativeElement;
    const focusable = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));

    if (focusable.length === 0) {
      event.preventDefault();
      root.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === root)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

}