import { Component, computed, inject, output, signal } from '@angular/core';
import { PantryService } from '../../service/pantry-service';
import { ScannedItem } from '../../models/pantry-item.model';
import { toApiError } from '../../../../core/services/api/api.models';
import { LucideIconsModule } from '../../../../shared/icons/lucide-icons.module';
import { ModalShell } from '../../../../shared/components/modal-shell/modal-shell';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024;

@Component({
  selector: 'app-pantry-scan-dialog',
  imports: [LucideIconsModule, ModalShell, EmptyState],
  templateUrl: './pantry-scan-dialog.html',
  styleUrl: './pantry-scan-dialog.css',
})
export class PantryScanDialog {
  private readonly pantryService = inject(PantryService);

  readonly saved = output<void>();
  readonly closed = output<void>();

  readonly file = signal<File | null>(null);
  readonly preview = signal<string | null>(null);
  readonly results = signal<ScannedItem[]>([]);
  readonly message = signal('');
  readonly completed = signal(false);
  readonly isScanning = signal(false);
  readonly isSaving = signal(false);

  readonly isBusy = computed(() => this.isScanning() || this.isSaving());
  readonly hasResults = computed(() => this.completed() && this.results().length > 0);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      this.message.set('Please choose a JPG, PNG or WebP image.');
      input.value = '';
      return;
    }

    if (file.size > MAX_SIZE) {
      this.message.set('Choose an image smaller than 10 MB.');
      input.value = '';
      return;
    }

    this.message.set('');
    this.completed.set(false);
    this.results.set([]);
    this.file.set(file);
    this.preview.set(null);

    const reader = new FileReader();

    reader.onload = () => {
      if (this.file() === file) {
        this.preview.set(typeof reader.result === 'string' ? reader.result : null);
      }
    };

    reader.onerror = () => {
      if (this.file() === file) {
        this.preview.set(null);
        this.file.set(null);
        this.message.set('Unable to read this image. Please try another one.');
      }
    };

    reader.readAsDataURL(file);
    input.value = ''; // allow choosing the same file again
  }

  async startScan(): Promise<void> {
    const file = this.file();
    if (!file || this.isBusy()) return;

    this.isScanning.set(true);
    this.completed.set(false);
    this.message.set('');

    try {
      const response = await this.pantryService.scan(file);
      this.results.set(response.ingredients);
      this.completed.set(true);

      this.message.set(
        response.ingredients.length === 0
          ? 'No ingredients were detected. Try a clearer photo.'
          : `Found ${response.ingredients.length} ingredients. Review the results before saving.`,
      );
    } catch (error: unknown) {
      const apiError = toApiError(error);
      this.message.set(
        apiError.status === 429
          ? 'Scan limit reached. Upgrade to Pro for more scans.'
          : apiError.message,
      );
    } finally {
      this.isScanning.set(false);
    }
  }

  removeScanned(index: number): void {
    this.results.update((list) => list.filter((_, i) => i !== index));
  }

  scanAgain(): void {
    if (this.isBusy()) return;
    this.file.set(null);
    this.preview.set(null);
    this.results.set([]);
    this.completed.set(false);
    this.message.set('');
  }

  async saveScanned(): Promise<void> {
    const results = this.results();
    if (!results.length || !this.completed() || this.isBusy()) return;

    this.isSaving.set(true);
    this.message.set('');

    try {
      await this.pantryService.saveScanned(results);
      this.saved.emit();
    } catch (error: unknown) {
      this.message.set(toApiError(error).message);
    } finally {
      this.isSaving.set(false);
    }
  }

}