import { Component, input, output, signal } from '@angular/core';
import { LucideIconsModule } from '../../../../shared/icons/lucide-icons.module';

@Component({
  selector: 'app-recipe-filters',
  imports: [LucideIconsModule],
  templateUrl: './recipe-filters.html',
  styleUrl: './recipe-filters.css',
})
export class RecipeFilters {
  /* =========================================================
    INPUTS
    ========================================================= */
  readonly categories = input<string[]>([]);
  readonly cuisines = input<string[]>([]);
  readonly searchQuery = input('');
  readonly selectedCategory = input('');
  readonly selectedCuisine = input('');


  /* =========================================================
     OUTPUTS
     ========================================================= */
  readonly search = output<string>();
  readonly categoryChange = output<string>();
  readonly cuisineChange = output<string>();
  readonly clear = output<void>();


  /* =========================================================
     DROPDOWN STATE
     ========================================================= */
  readonly categoryOpen = signal(false);
  readonly cuisineOpen = signal(false);


  /* =========================================================
     SEARCH
     ========================================================= */
  onSearch(value: string): void {
    this.search.emit(value.trim());
  }


  /* =========================================================
     CATEGORY
     ========================================================= */
  toggleCategoryDropdown(): void {
    this.categoryOpen.update(open => !open);
    this.cuisineOpen.set(false);
  }


  selectCategory(category: string): void {
    this.categoryOpen.set(false);
    this.categoryChange.emit(category);
  }


  /* =========================================================
     CUISINE
     ========================================================= */
  toggleCuisineDropdown(): void {
    this.cuisineOpen.update(open => !open);
    this.categoryOpen.set(false);
  }


  selectCuisine(cuisine: string): void {
    this.cuisineOpen.set(false);
    this.cuisineChange.emit(cuisine);
  }


  /* =========================================================
     CLEAR
     ========================================================= */
  onClear(): void {
    this.closeDropdowns();
    this.clear.emit();
  }


  /* =========================================================
     CLOSE
     ========================================================= */
  private closeDropdowns(): void {
    this.categoryOpen.set(false);
    this.cuisineOpen.set(false);
  }
  
}