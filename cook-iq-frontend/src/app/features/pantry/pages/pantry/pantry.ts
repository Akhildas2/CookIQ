import { Component, computed, inject, signal } from '@angular/core';
import { PantryFilter, PantryItem } from '../../models/pantry-item.model';
import { LucideIconsModule } from '../../../../shared/icons/lucide-icons.module';
import { PantryItemCard } from '../../components/pantry-item-card/pantry-item-card';
import { PantryService } from '../../service/pantry-service';
import { toApiError } from '../../../../core/services/api/api.models';
import { RouterLink } from '@angular/router';
import { PANTRY_FILTER_OPTIONS, PANTRY_SORT_OPTIONS } from '../../utils/pantry.constants';
import { compareOptionalText, compareText, matchesQuery } from '../../../../shared/utils/filter-sort.utils';
import { PantryItemEditor } from '../../components/pantry-item-editor/pantry-item-editor';
import { PantryScanDialog } from '../../components/pantry-scan-dialog/pantry-scan-dialog';
import { DataToolbar } from '../../../../shared/components/data-toolbar/data-toolbar';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { LoadingState } from '../../../../shared/components/loading-state/loading-state';

@Component({
  selector: 'app-pantry',
  imports: [LucideIconsModule, RouterLink, PantryItemCard, PantryItemEditor, PantryScanDialog, DataToolbar, StatCard, EmptyState, LoadingState,],
  templateUrl: './pantry.html',
  styleUrl: './pantry.css',
})
export class Pantry {
  private readonly pantryService = inject(PantryService);

  // Service state
  readonly items = this.pantryService.items;
  readonly loading = this.pantryService.loading;
  readonly loadError = this.pantryService.loadError;

  // Dialog state
  readonly isFormOpen = signal(false);
  readonly isScanOpen = signal(false);
  readonly editingItem = signal<PantryItem | null>(null);

  // Toolbar state
  readonly searchQuery = signal('');
  readonly selectedFilter = signal<PantryFilter>('All');
  readonly selectedSort = signal('name');

  readonly filterOptions = PANTRY_FILTER_OPTIONS;
  readonly sortOptions = PANTRY_SORT_OPTIONS;

  private readonly sorters: Record<string, (a: PantryItem, b: PantryItem) => number> = {
    name: (a, b) => compareText(a.name, b.name),
    expiry: (a, b) => compareOptionalText(a.expiryDate, b.expiryDate),
    quantity: (a, b) => b.quantity - a.quantity,
  };

  // Derived data
  readonly totalItems = computed(() => this.items().length);
  readonly categoryCount = computed(() => new Set(this.items().map((i) => i.category)).size);

  readonly expiringCount = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const limit = 3 * 86_400_000;

    return this.items().filter((item) => {
      if (!item.expiryDate) return false;
      const expiry = new Date(`${item.expiryDate}T00:00:00`);
      if (Number.isNaN(expiry.getTime())) return false;
      const diff = expiry.getTime() - today.getTime();
      return diff >= 0 && diff <= limit;
    }).length;
  });

  readonly filteredItems = computed(() => {
    const query = this.searchQuery();
    const category = this.selectedFilter();
    const sorter = this.sorters[this.selectedSort()] ?? this.sorters['name'];

    return this.items()
      .filter(
        (item) =>
          (category === 'All' || item.category === category) &&
          matchesQuery(query, item.name, item.category),
      )
      .sort(sorter);
  });

  constructor() {
    this.pantryService.load();
  }

  onFilterChange(value: string): void {
    this.selectedFilter.set(value as PantryFilter);
  }

  // Add / edit
  openAddForm(): void {
    this.editingItem.set(null);
    this.isFormOpen.set(true);
  }

  openEditForm(item: PantryItem): void {
    this.editingItem.set(item);
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.editingItem.set(null);
  }

  onItemSaved(): void {
    this.closeForm();
    this.resetFilters();
  }

  // Scan
  openScan(): void {
    this.isScanOpen.set(true);
  }

  closeScan(): void {
    this.isScanOpen.set(false);
  }

  onScanSaved(): void {
    this.closeScan();
    this.resetFilters();
  }

  // Delete: swap window.confirm / alert for your ConfirmService and toast
  async deleteItem(item: PantryItem): Promise<void> {
    if (!window.confirm(`Remove "${item.name}" from your pantry?`)) return;

    try {
      await this.pantryService.deleteItem(item.id);
    } catch (error: unknown) {
      window.alert(toApiError(error).message);
    }
  }

  private resetFilters(): void {
    this.searchQuery.set('');
    this.selectedFilter.set('All');
  }
}