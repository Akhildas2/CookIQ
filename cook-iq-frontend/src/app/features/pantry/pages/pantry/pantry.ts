import { Component, computed, inject, signal } from '@angular/core';
import { PantryCategory, PantryFilter, PantryItem, PantryItemForm, ScannedItem } from '../../models/pantry-item.model';
import { LucideIconsModule } from '../../../../shared/icons/lucide-icons.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PantryItemCard } from '../../components/pantry-item-card/pantry-item-card';
import { PantryService } from '../../service/pantry-service';
import { toApiError } from '../../../../core/services/api/api.models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pantry',
  imports: [LucideIconsModule, CommonModule, FormsModule, PantryItemCard,RouterLink],
  templateUrl: './pantry.html',
  styleUrl: './pantry.css',
})
export class Pantry {
  private readonly pantryService = inject(PantryService);

  // Dialog state
  readonly isFormOpen = signal(false);
  readonly isScanOpen = signal(false);

  // Saving and scanning state
  readonly isScanning = signal(false);
  readonly isSaving = signal(false);
  readonly isSavingScan = signal(false);

  // Scan state
  readonly scanCompleted = signal(false);
  readonly scanMessage = signal('');
  readonly scanPreview = signal<string | null>(null);
  readonly scanFile = signal<File | null>(null);
  readonly scanResults = signal<ScannedItem[]>([]);

  // Form state
  readonly editingId = signal<string | null>(null);
  readonly formError = signal('');

  // Service state
  readonly items = this.pantryService.items;
  readonly loading = this.pantryService.loading;
  readonly loadError = this.pantryService.loadError;

  // Search and filtering
  readonly searchQuery = signal('');
  readonly selectedFilter = signal<PantryFilter>('All');

  readonly categories: PantryFilter[] = [
    'All',
    'Vegetables',
    'Fruits',
    'Dairy',
    'Proteins',
    'Grains',
    'Spices',
    'Other',
  ];

  readonly categoryOptions: PantryCategory[] = [
    'Vegetables',
    'Fruits',
    'Dairy',
    'Proteins',
    'Grains',
    'Spices',
    'Other',
  ];

  readonly emojiOptions = [
    '🥦',
    '🥕',
    '🍅',
    '🥑',
    '🍎',
    '🍌',
    '🥛',
    '🧀',
    '🥚',
    '🍗',
    '🐟',
    '🍚',
    '🫘',
    '🌶️',
    '🧄',
    '🧅',
    '🍋',
    '🥣',
  ];

  readonly unitOptions = [
    'pieces',
    'kg',
    'g',
    'litre',
    'ml',
    'bunch',
    'pack',
    'bottle',
    'bulb',
  ];

  // Keep the object mutable because ngModel edits its properties.
  form: PantryItemForm = this.emptyForm();

  // Today's date in local YYYY-MM-DD format.
  readonly today = this.getLocalDateString(new Date());

  // Derived statistics
  readonly totalItems = computed(() => this.items().length);

  readonly categoryCount = computed(
    () => new Set(this.items().map((item) => item.category)).size,
  );

  readonly expiringCount = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTime = today.getTime();
    const threeDaysInMs = 3 * 86_400_000;

    return this.items().filter((item) => {
      if (!item.expiryDate) {
        return false;
      }

      const expiry = new Date(`${item.expiryDate}T00:00:00`);

      if (Number.isNaN(expiry.getTime())) {
        return false;
      }

      const difference = expiry.getTime() - todayTime;

      return difference >= 0 && difference <= threeDaysInMs;
    }).length;
  });

  readonly filteredItems = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const category = this.selectedFilter();

    return this.items().filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      const matchesCategory =
        category === 'All' || item.category === category;

      return matchesSearch && matchesCategory;
    });
  });

  // Load inventory when the component is created.
  constructor() {
    this.pantryService.load();
  }

  selectFilter(filter: PantryFilter): void {
    this.selectedFilter.set(filter);
  }

  // --------------------------------------------------
  // Add and edit ingredient
  // --------------------------------------------------

  openAddForm(): void {
    this.resetForm();
    this.editingId.set(null);
    this.formError.set('');
    this.isFormOpen.set(true);
  }

  openEditForm(item: PantryItem): void {
    this.resetForm();

    this.form.name = item.name;
    this.form.quantity = item.quantity;
    this.form.unit = item.unit;
    this.form.category = item.category;
    this.form.emoji = item.emoji;
    this.form.expiryDate = item.expiryDate ?? '';

    this.editingId.set(item.id);
    this.formError.set('');
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    if (this.isSaving()) {
      return;
    }

    this.isFormOpen.set(false);
    this.editingId.set(null);
    this.formError.set('');
    this.resetForm();
  }

  async saveItem(): Promise<void> {
    if (this.isSaving()) {
      return;
    }

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

    if (
      this.form.expiryDate &&
      this.form.expiryDate < this.today
    ) {
      this.formError.set('Expiry date cannot be in the past.');
      return;
    }

    const payload: PantryItemForm = {
      ...this.form,
      name,
      quantity,
    };

    const id = this.editingId();

    this.isSaving.set(true);
    this.formError.set('');

    try {
      if (id) {
        await this.pantryService.updateItem(id, payload);
      } else {
        await this.pantryService.addItem(payload);
      }


      this.isFormOpen.set(false);
      this.editingId.set(null);
      this.formError.set('');
      this.resetForm();
      this.searchQuery.set('');
      this.selectedFilter.set('All');
      this.closeForm();
    } catch (error: unknown) {
      this.formError.set(toApiError(error).message);
    } finally {
      this.isSaving.set(false);
    }
  }

  async deleteItem(item: PantryItem): Promise<void> {
    if (
      !window.confirm(
        `Remove "${item.name}" from your pantry?`,
      )
    ) {
      return;
    }

    try {
      await this.pantryService.deleteItem(item.id);
    } catch (error: unknown) {
      window.alert(toApiError(error).message);
    }
  }

  // --------------------------------------------------
  // Image scanning
  // --------------------------------------------------

  openScan(): void {
    if (this.isScanning() || this.isSavingScan()) {
      return;
    }

    this.clearScan();
    this.isScanOpen.set(true);
  }

  closeScan(): void {
    if (this.isScanning() || this.isSavingScan()) {
      return;
    }

    this.isScanOpen.set(false);
    this.clearScan();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      this.scanMessage.set(
        'Please choose a JPG, PNG or WebP image.',
      );
      input.value = '';
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      this.scanMessage.set(
        'Choose an image smaller than 10 MB.',
      );
      input.value = '';
      return;
    }

    this.scanMessage.set('');
    this.scanCompleted.set(false);
    this.scanResults.set([]);
    this.scanFile.set(file);
    this.scanPreview.set(null);

    const reader = new FileReader();

    reader.onload = () => {
      if (this.scanFile() === file) {
        this.scanPreview.set(
          typeof reader.result === 'string'
            ? reader.result
            : null,
        );
      }
    };

    reader.onerror = () => {
      if (this.scanFile() === file) {
        this.scanPreview.set(null);
        this.scanFile.set(null);
        this.scanMessage.set(
          'Unable to read this image. Please try another one.',
        );
      }
    };

    reader.readAsDataURL(file);

    // Allow selecting the same file again later.
    input.value = '';
  }

  async startScan(): Promise<void> {
    const file = this.scanFile();

    if (!file || this.isScanning() || this.isSavingScan()) {
      return;
    }

    this.isScanning.set(true);
    this.scanCompleted.set(false);
    this.scanMessage.set('');

    try {
      const response = await this.pantryService.scan(file);

      this.scanResults.set(response.ingredients);
      this.scanCompleted.set(true);

      if (response.ingredients.length === 0) {
        this.scanMessage.set(
          'No ingredients were detected. Try a clearer photo.',
        );
      } else {
        this.scanMessage.set(
          `Found ${response.ingredients.length} ingredients. Review the results before saving.`,
        );
      }
    } catch (error: unknown) {
      const apiError = toApiError(error);

      this.scanMessage.set(
        apiError.status === 429
          ? 'Scan limit reached. Upgrade to Pro for more scans.'
          : apiError.message,
      );
    } finally {
      this.isScanning.set(false);
    }
  }

  removeScanned(index: number): void {
    this.scanResults.update((results) =>
      results.filter((_, currentIndex) => currentIndex !== index),
    );
  }

  async saveScanned(): Promise<void> {
    const results = this.scanResults();

    if (
      !results.length ||
      !this.scanCompleted() ||
      this.isSavingScan() ||
      this.isScanning()
    ) {
      return;
    }

    this.isSavingScan.set(true);
    this.scanMessage.set('');

    try {
      await this.pantryService.saveScanned(results);

      this.isScanOpen.set(false);
      this.clearScan();
      this.searchQuery.set('');
      this.selectedFilter.set('All');
    } catch (error: unknown) {
      this.scanMessage.set(toApiError(error).message);
    } finally {
      this.isSavingScan.set(false);
    }
  }

  // --------------------------------------------------
  // Utilities
  // --------------------------------------------------

  trackByCategory(
    _index: number,
    category: PantryFilter,
  ): PantryFilter {
    return category;
  }

  private resetForm(): void {
    this.form = this.emptyForm();
  }

  private emptyForm(): PantryItemForm {
    return {
      name: '',
      quantity: 1,
      unit: 'pieces',
      category: 'Vegetables',
      emoji: '🥦',
      expiryDate: '',
    };
  }

  resetScanForRetry(): void {
    if (this.isScanning() || this.isSavingScan()) {
      return;
    }

    this.clearScan();
  }

  clearScan(): void {
    this.scanPreview.set(null);
    this.scanFile.set(null);
    this.scanResults.set([]);
    this.isScanning.set(false);
    this.scanCompleted.set(false);
    this.scanMessage.set('');
  }

  private getLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}