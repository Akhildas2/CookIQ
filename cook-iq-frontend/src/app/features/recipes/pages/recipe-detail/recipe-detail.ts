import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MealdbService } from '../../../../core/services/mealdb/mealdb-service';
import { Meal, RecipeIngredient } from '../../models/mealdb.models';
import { DecimalPipe } from '@angular/common';
import { LucideIconsModule } from '../../../../shared/icons/lucide-icons.module';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AsyncState } from '../../../../shared/ui/async-state/async-state';
import { extractIngredients, getYoutubeVideoId, splitInstructions } from '../../utils/recipe.utils';
import { handleAsyncRequest } from '../../../../shared/utils/async-request';

@Component({
  selector: 'app-recipe-detail',
  imports: [RouterLink, DecimalPipe, LucideIconsModule, AsyncState],
  templateUrl: './recipe-detail.html',
  styleUrl: './recipe-detail.css',
})
export class RecipeDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly mealdbService = inject(MealdbService);
  private readonly sanitizer = inject(DomSanitizer);

  // =========================================================
  // STATE
  // =========================================================

  readonly meal = signal<Meal | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly checkedIngredients = signal<Set<string>>(new Set());

  // =========================================================
  // DERIVED DATA
  // =========================================================

  readonly ingredients = computed<RecipeIngredient[]>(() => {
    const recipe = this.meal();
    return recipe ? extractIngredients(recipe) : [];
  });

  readonly tags = computed(() =>
    (this.meal()?.strTags ?? '').split(',')
      .map(tag => tag.trim())
      .filter(Boolean)
  );

  readonly instructions = computed<string[]>(() => {
    const raw = this.meal()?.strInstructions ?? '';
    return splitInstructions(raw);
  });

  readonly checkedCount = computed(
    () => this.checkedIngredients().size,
  );

  readonly ingredientProgress = computed(() => {
    const total = this.ingredients().length;

    return total ? Math.round((this.checkedCount() / total) * 100) : 0;
  });

  // =========================================================
  // LIFECYCLE
  // =========================================================

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadRecipe(id);
  }

  // =========================================================
  // LOAD RECIPE
  // =========================================================

  private loadRecipe(id: string | null): void {
    if (!id) {
      this.meal.set(null);
      this.error.set('We could not find this recipe.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.meal.set(null);
    this.checkedIngredients.set(new Set());

    handleAsyncRequest({
      request: this.mealdbService.getMealById(id),
      loading: this.loading,
      error: this.error,
      errorMessage: 'We could not load this recipe right now. Please try again.',
      onSuccess: response => {
        const recipe = response.meals?.[0] ?? null;

        if (!recipe) {
          this.error.set('This recipe could not be found.');
          return;
        }

        this.meal.set(recipe);
      },
    });
  }

  // =========================================================
  // INGREDIENT CHECKLIST
  // =========================================================

  isIngredientChecked(name: string): boolean {
    return this.checkedIngredients().has(name);
  }

  toggleIngredient(name: string, checked: boolean): void {
    this.checkedIngredients.update((current) => {
      const next = new Set(current);

      checked ? next.add(name) : next.delete(name);

      return next;
    });
  }

  resetIngredients(): void {
    this.checkedIngredients.set(new Set());
  }

  // =========================================================
  // RETRY
  // =========================================================

  retry(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadRecipe(id);
  }

  // =========================================================
  // SCROLL TO INGREDIENTS
  // =========================================================

  scrollToIngredients(): void {
    document.getElementById('ingredients')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }


  // =========================================================
  // SCROLL TO VIDEO
  // =========================================================

  scrollToVideo(): void {
    document.getElementById('recipe-video')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  // =========================================================
  // YOUTUBE VIDEO ID
  // =========================================================

  youtubeVideoId(url: string): string | null {
    return getYoutubeVideoId(url);
  }

  // =========================================================
  // YOUTUBE EMBED URL
  // =========================================================

  youtubeEmbedUrl(videoId: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${videoId}`,
    );
  }

}