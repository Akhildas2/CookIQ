import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { MealdbService } from '../../../../core/services/mealdb/mealdb-service';
import { MealSummary } from '../../models/mealdb.models';
import { RecipeGrid } from '../../components/recipe-grid/recipe-grid';
import { RecipeFilters } from '../../components/recipe-filters/recipe-filters';
import { LucideIconsModule } from '../../../../shared/icons/lucide-icons.module';
import { SectionHeader } from '../../../../shared/ui/section-header/section-header';
import { AsyncState } from '../../../../shared/ui/async-state/async-state';
import { handleAsyncRequest } from '../../../../shared/utils/async-request';
import { map, Observable } from 'rxjs';

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
   EMPTY / NOT FOUND STATE
   ========================================================= */
  readonly emptyStateEyebrow = computed(() => {
    if (this.searchQuery()) return 'Search results';
    if (this.selectedCategory()) return 'Category results';
    if (this.selectedCuisine()) return 'Cuisine results';

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

  /* =========================================================
     LIFECYCLE
     ========================================================= */
  ngOnInit(): void {
    this.loadFilters();
    this.loadRecipes();
  }

  /* =========================================================
   LOAD RESULTS
   ========================================================= */
  private loadResults(request: Observable<MealSummary[]>, errorMessage: string): void {
    this.visibleCount.set(12);

    handleAsyncRequest({
      request,
      loading: this.loading,
      error: this.error,
      errorMessage,
      onSuccess: (meals) => this.meals.set(meals),
      onError: () => this.meals.set([]),
    });
  }

  /* =========================================================
     INITIAL RECIPES
     ========================================================= */
  private loadRecipes(): void {
    this.loadResults(
      this.mealdbService.getAllMeals(),
      'We could not load recipes right now. Please try again.',
    );
  }


  /* =========================================================
     FILTER OPTIONS
     ========================================================= */
  private loadFilters(): void {
    this.mealdbService.getCategoryList().subscribe({
      next: (response) => {
        this.categories.set(
          (response.meals ?? []).map(
            (item) => item.strCategory,
          ),
        );
      },
      error: () => this.categories.set([]),
    });

    this.mealdbService.getAreas().subscribe({
      next: (response) => {
        this.cuisines.set(
          (response.meals ?? []).map(
            (item) => item.strArea,
          ),
        );
      },
      error: () => this.cuisines.set([]),
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

    this.loadResults(
      this.mealdbService.searchMeals(value).pipe(
        map((response) => response.meals ?? []),
      ),
      'We could not search recipes right now. Please try again.',
    );
  }

  /* =========================================================
     CATEGORY
     ========================================================= */
  onCategoryChange(category: string): void {
    if (!category) {
      this.clearFilters();
      return;
    }

    this.selectedCategory.set(category);
    this.selectedCuisine.set('');
    this.searchQuery.set('');

    this.loadResults(
      this.mealdbService.getMealsByCategory(category).pipe(
        map((response) => response.meals ?? []),
      ),
      'We could not load this category. Please try again.',
    );
  }

  /* =========================================================
     CUISINE
     ========================================================= */
  onCuisineChange(cuisine: string): void {
    if (!cuisine) {
      this.clearFilters();
      return;
    }

    this.selectedCuisine.set(cuisine);
    this.selectedCategory.set('');
    this.searchQuery.set('');

    this.loadResults(
      this.mealdbService.getMealsByArea(cuisine).pipe(
        map((response) => response.meals ?? []),
      ),
      'We could not load this cuisine. Please try again.',
    );
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
      this.onSearch(this.searchQuery());
      return;
    }

    if (this.selectedCategory()) {
      this.onCategoryChange(this.selectedCategory());
      return;
    }

    if (this.selectedCuisine()) {
      this.onCuisineChange(this.selectedCuisine());
      return;
    }

    this.loadRecipes();
  }

}