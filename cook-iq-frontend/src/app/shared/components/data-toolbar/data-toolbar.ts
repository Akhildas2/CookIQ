import { Component, input, output } from '@angular/core';
import { ToolbarFilterOption, ToolbarSortOption } from './data-toolbar.models';
import { LucideIconsModule } from '../../icons/lucide-icons.module';

@Component({
  selector: 'app-data-toolbar',
  imports: [LucideIconsModule],
  templateUrl: './data-toolbar.html',
  styleUrl: './data-toolbar.css',
})
export class DataToolbar {
  readonly searchValue = input('');
  readonly searchPlaceholder = input('Search...');
  readonly searchLabel = input('Search');

  readonly filters = input<ToolbarFilterOption[]>([]);
  readonly selectedFilter = input('');
  readonly filtersLabel = input('Filter');

  readonly sortOptions = input<ToolbarSortOption[]>([]);
  readonly selectedSort = input('');

  readonly actionLabel = input('');
  readonly actionIcon = input('plus');

  readonly searchChange = output<string>();
  readonly filterChange = output<string>();
  readonly sortChange = output<string>();
  readonly action = output<void>();

  protected onSearch(event: Event): void {
    this.searchChange.emit((event.target as HTMLInputElement).value);
  }

  protected onSort(event: Event): void {
    this.sortChange.emit((event.target as HTMLSelectElement).value);
  }

}