import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { MealdbService } from '../../../../core/services/mealdb/mealdb-service';
import { MealSummary } from '../../models/mealdb.models';
import { RecipeGrid } from '../../components/recipe-grid/recipe-grid';
import { RecipeFilters } from '../../components/recipe-filters/recipe-filters';
import { LucideIconsModule } from '../../../../shared/icons/lucide-icons.module';
import { SectionHeader } from '../../../../shared/ui/section-header/section-header';
import { AsyncState } from '../../../../shared/ui/async-state/async-state';

@Component({
  selector: 'app-recipes',
  imports: [RecipeFilters, RecipeGrid, LucideIconsModule, SectionHeader, AsyncState],
  templateUrl: './recipes.html',
  styleUrl: './recipes.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Recipes implements OnInit {
  private readonly mealdbService = inject(MealdbService);

  /* =========================================================
     RECIPE STATE
     ========================================================= */
  readonly meals = signal<MealSummary[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly visibleCount = signal(12);

  /* =========================================================
     FILTER STATE
     ========================================================= */
  readonly categories = signal<string[]>([]);
  readonly cuisines = signal<string[]>([]);
  readonly searchQuery = signal('');
  readonly selectedCategory = signal('');
  readonly selectedCuisine = signal('');

  /* =========================================================
     DERIVED STATE
     ========================================================= */
  readonly visibleMeals = computed(() =>
    this.meals().slice(0, this.visibleCount())
  );

  readonly hasMore = computed(() =>
    this.visibleCount() < this.meals().length
  );

  /* =========================================================
     LIFECYCLE
     ========================================================= */
  ngOnInit(): void {
    this.loadFilters();
    this.loadRecipes();
  }

  /* =========================================================
     INITIAL RECIPES
     ========================================================= */
  private loadRecipes(): void {
    this.loading.set(true);
    this.error.set(null);

    this.mealdbService
      .getAllMeals()
      .subscribe({
        next: (meals) => {
          this.meals.set(meals);

          this.visibleCount.set(12);
          this.loading.set(false);
        },

        error: () => {
          this.meals.set([]);
          this.loading.set(false);

          this.error.set(
            'We could not load recipes right now. Please try again.'
          );
        },
      });
  }

  /* =========================================================
     FILTER OPTIONS
     ========================================================= */
  private loadFilters(): void {
    this.mealdbService
      .getCategoryList()
      .subscribe({
        next: (response) => {
          this.categories.set(
            (response.meals ?? []).map(
              (category) => category.strCategory
            )
          );
        },

        error: () => {
          this.categories.set([]);
        },
      });

    this.mealdbService
      .getAreas()
      .subscribe({
        next: (response) => {
          this.cuisines.set(
            (response.meals ?? []).map(
              (area) => area.strArea
            )
          );
        },

        error: () => {
          this.cuisines.set([]);
        },
      });
  }

  /* =========================================================
     SEARCH
     ========================================================= */
  onSearch(query: string): void {
    const value = query.trim();

    if (!value) {
      this.clearFilters();
      return;
    }

    this.searchQuery.set(value);
    this.selectedCategory.set('');
    this.selectedCuisine.set('');

    this.loadSearchResults(value);
  }

  private loadSearchResults(query: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.visibleCount.set(12);

    this.mealdbService
      .searchMeals(query)
      .subscribe({
        next: (response) => {
          this.meals.set(
            response.meals ?? []
          );

          this.loading.set(false);
        },

        error: () => {
          this.meals.set([]);
          this.loading.set(false);

          this.error.set(
            'We could not search recipes right now. Please try again.'
          );
        },
      });
  }

  /* =========================================================
     CATEGORY
     ========================================================= */
  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
    this.selectedCuisine.set('');
    this.searchQuery.set('');

    if (!category) {
      this.clearFilters();
      return;
    }

    this.loadCategoryResults(category);
  }

  private loadCategoryResults(category: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.visibleCount.set(12);

    this.mealdbService
      .getMealsByCategory(category)
      .subscribe({
        next: (response) => {
          this.meals.set(
            response.meals ?? []
          );

          this.loading.set(false);
        },

        error: () => {
          this.meals.set([]);
          this.loading.set(false);

          this.error.set(
            'We could not load this category. Please try again.'
          );
        },
      });
  }

  /* =========================================================
     CUISINE
     ========================================================= */
  onCuisineChange(cuisine: string): void {
    this.selectedCuisine.set(cuisine);
    this.selectedCategory.set('');
    this.searchQuery.set('');

    if (!cuisine) {
      this.clearFilters();
      return;
    }

    this.loadCuisineResults(cuisine);
  }

  private loadCuisineResults(cuisine: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.visibleCount.set(12);

    this.mealdbService
      .getMealsByArea(cuisine)
      .subscribe({
        next: (response) => {
          this.meals.set(
            response.meals ?? []
          );

          this.loading.set(false);
        },

        error: () => {
          this.meals.set([]);
          this.loading.set(false);

          this.error.set(
            'We could not load this cuisine. Please try again.'
          );
        },
      });
  }

  /* =========================================================
     CLEAR FILTERS
     ========================================================= */
  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('');
    this.selectedCuisine.set('');

    this.loadRecipes();
  }

  /* =========================================================
     LOAD MORE
     ========================================================= */
  loadMore(): void {
    this.visibleCount.update((count) => count + 12);
  }

  /* =========================================================
     RETRY
     ========================================================= */
  retry(): void {
    if (this.searchQuery()) {
      this.loadSearchResults(this.searchQuery());
      return;
    }

    if (this.selectedCategory()) {
      this.loadCategoryResults(this.selectedCategory());
      return;
    }

    if (this.selectedCuisine()) {
      this.loadCuisineResults(this.selectedCuisine());
      return;
    }

    this.loadRecipes();
  }


  /* =========================================================
   EMPTY / NOT FOUND STATE
   ========================================================= */

  readonly emptyStateEyebrow = computed(() => {
    if (this.searchQuery()) {
      return 'Search results';
    }

    if (this.selectedCategory()) {
      return 'Category results';
    }

    if (this.selectedCuisine()) {
      return 'Cuisine results';
    }

    return 'Recipe collection';
  });


  readonly emptyStateTitle = computed(() => {
    if (this.searchQuery()) {
      return `No recipes found for "${this.searchQuery()}".`;
    }

    if (this.selectedCategory()) {
      return `No ${this.selectedCategory()} recipes found.`;
    }

    if (this.selectedCuisine()) {
      return `No ${this.selectedCuisine()} recipes found.`;
    }

    return 'No recipes found.';
  });


  readonly emptyStateDescription = computed(() => {
    if (this.searchQuery()) {
      return 'Try another ingredient, recipe name, or a broader search.';
    }

    if (this.selectedCategory()) {
      return 'Try another category or explore the full recipe collection.';
    }

    if (this.selectedCuisine()) {
      return 'Try another cuisine or explore the full recipe collection.';
    }

    return 'Try another ingredient, cuisine, or category.';
  });

}