import { Component, inject, input, output, signal } from '@angular/core';
import { emptyPantryForm, PANTRY_CATEGORY_OPTIONS, PANTRY_EMOJI_OPTIONS, PANTRY_UNIT_OPTIONS } from '../../utils/pantry.constants';
import { PantryItem, PantryItemForm } from '../../models/pantry-item.model';
import { toLocalDateString } from '../../../../shared/utils/date.utils';
import { PantryService } from '../../service/pantry-service';
import { toApiError } from '../../../../core/services/api/api.models';
import { LucideIconsModule } from '../../../../shared/icons/lucide-icons.module';
import { FormsModule } from '@angular/forms';
import { ModalShell } from '../../../../shared/components/modal-shell/modal-shell';

@Component({
  selector: 'app-pantry-item-editor',
  imports: [LucideIconsModule, FormsModule, ModalShell],
  templateUrl: './pantry-item-editor.html',
  styleUrl: './pantry-item-editor.css',
})
export class PantryItemEditor {
  private readonly pantryService = inject(PantryService);

  /** Pass an item to edit it; leave null to add a new one. */
  readonly item = input<PantryItem | null>(null);

  readonly saved = output<void>();
  readonly closed = output<void>();

  readonly isSaving = signal(false);
  readonly formError = signal('');

  readonly categoryOptions = PANTRY_CATEGORY_OPTIONS;
  readonly emojiOptions = PANTRY_EMOJI_OPTIONS;
  readonly unitOptions = PANTRY_UNIT_OPTIONS;
  readonly today = toLocalDateString(new Date());

  // Mutable on purpose: ngModel edits its properties.
  form: PantryItemForm = emptyPantryForm();

  get isEdit(): boolean {
    return this.item() !== null;
  }

  ngOnInit(): void {
    const item = this.item();

    if (item) {
      this.form = {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        emoji: item.emoji,
        expiryDate: item.expiryDate ?? '',
      };
    }
  }

  async save(): Promise<void> {
    if (this.isSaving()) return;

    const name = this.form.name.trim();
    const quantity = Number(this.form.quantity);

    if (!name) {
      this.formError.set('Please enter an ingredient name.');
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      this.formError.set('Quantity must be greater than zero.');
      return;
    }

    if (this.form.expiryDate && this.form.expiryDate < this.today) {
      this.formError.set('Expiry date cannot be in the past.');
      return;
    }

    const payload: PantryItemForm = { ...this.form, name, quantity };
    const existing = this.item();

    this.isSaving.set(true);
    this.formError.set('');

    try {
      if (existing) {
        await this.pantryService.updateItem(existing.id, payload);
      } else {
        await this.pantryService.addItem(payload);
      }

      this.saved.emit(); // single success path; the parent closes the dialog
    } catch (error: unknown) {
      this.formError.set(toApiError(error).message);
    } finally {
      this.isSaving.set(false);
    }
  }

}