import { Component, computed, inject, signal } from '@angular/core';
import { PantryService } from '../../pantry.service';
import { PantryCategory, PantryFilter, PantryItem, PantryItemForm } from '../../models/pantry-item.model';
import { LucideIconsModule } from '../../../../shared/icons/lucide-icons.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PantryItemCard } from '../../components/pantry-item-card/pantry-item-card';

@Component({
  selector: 'app-pantry',
  imports: [LucideIconsModule, CommonModule, FormsModule, PantryItemCard],
  templateUrl: './pantry.html',
  styleUrl: './pantry.css',
})
export class Pantry {
  private readonly pantryService = inject(PantryService);

  readonly items = this.pantryService.items;

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

  readonly searchQuery = signal('');
  readonly selectedFilter = signal<PantryFilter>('All');

  readonly isFormOpen = signal(false);
  readonly isScanOpen = signal(false);
  readonly isScanning = signal(false);
  readonly scanCompleted = signal(false);
  readonly scanMessage = signal('');
  readonly scanPreview = signal<string | null>(null);
  readonly editingId = signal<string | null>(null);

  readonly totalItems = computed(() => this.items().length);

  readonly categoryCount = computed(
    () => new Set(this.items().map((item) => item.category)).size,
  );

  readonly expiringCount = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.items().filter((item) => {
      if (!item.expiryDate) return false;

      const expiry = new Date(`${item.expiryDate}T00:00:00`);
      const days = Math.ceil(
        (expiry.getTime() - today.getTime()) / 86_400_000,
      );

      return days >= 0 && days <= 3;
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

  readonly form: PantryItemForm = this.emptyForm();

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
    '🥦', '🥕', '🍅', '🥑', '🍎', '🍌',
    '🥛', '🧀', '🥚', '🍗', '🐟', '🍚',
    '🫘', '🌶️', '🧄', '🧅', '🍋', '🥣',
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

  selectFilter(filter: PantryFilter): void {
    this.selectedFilter.set(filter);
  }

  openAddForm(): void {
    this.resetForm();
    this.editingId.set(null);
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
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.editingId.set(null);
  }

  saveItem(): void {
    const name = this.form.name.trim();
    const quantity = Number(this.form.quantity);

    if (!name || !Number.isFinite(quantity) || quantity <= 0) {
      return;
    }

    const payload: PantryItemForm = {
      ...this.form,
      name,
      quantity,
    };

    const editingId = this.editingId();

    if (editingId) {
      this.pantryService.updateItem(editingId, payload);
    } else {
      this.pantryService.addItem(payload);
    }

    this.closeForm();
    this.searchQuery.set('');
    this.selectedFilter.set('All');
  }

  deleteItem(item: PantryItem): void {
    const confirmed = window.confirm(
      `Remove "${item.name}" from your pantry?`,
    );

    if (confirmed) {
      this.pantryService.deleteItem(item.id);
    }
  }

  openScan(): void {
    this.clearScan();
    this.isScanOpen.set(true);
  }

  closeScan(): void {
    if (this.isScanning()) return;

    this.isScanOpen.set(false);
    this.clearScan();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.scanMessage.set('Please choose an image file.');
      input.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.scanMessage.set('Choose an image smaller than 10 MB.');
      input.value = '';
      return;
    }

    this.scanMessage.set('');
    this.scanCompleted.set(false);

    const reader = new FileReader();

    reader.onload = () => {
      this.scanPreview.set(String(reader.result));
    };

    reader.onerror = () => {
      this.scanMessage.set('Unable to read this image. Try another one.');
    };

    reader.readAsDataURL(file);
    input.value = '';
  }

  startMockScan(): void {
    if (!this.scanPreview() || this.isScanning()) return;

    this.isScanning.set(true);
    this.scanCompleted.set(false);
    this.scanMessage.set('');

    // Demo only: no image recognition or AI request is made here.
    window.setTimeout(() => {
      const addedCount = this.pantryService.addScannedItems();

      this.isScanning.set(false);
      this.scanCompleted.set(true);
      this.scanMessage.set(
        addedCount > 0
          ? `${addedCount} demo ingredients added to your pantry.`
          : 'Those demo ingredients are already in your pantry.',
      );

      this.searchQuery.set('');
      this.selectedFilter.set('All');
    }, 1200);
  }

  trackByCategory(
    _index: number,
    category: PantryFilter,
  ): PantryFilter {
    return category;
  }

  private clearScan(): void {
    this.scanPreview.set(null);
    this.isScanning.set(false);
    this.scanCompleted.set(false);
    this.scanMessage.set('');
  }

  private resetForm(): void {
    Object.assign(this.form, this.emptyForm());
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

}