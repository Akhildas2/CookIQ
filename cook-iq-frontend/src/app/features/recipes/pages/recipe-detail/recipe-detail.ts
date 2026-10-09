import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MealdbService } from '../../../../core/services/mealdb/mealdb-service';
import { Meal, RecipeIngredient } from '../../models/mealdb.models';
import { DecimalPipe } from '@angular/common';
import { LucideIconsModule } from '../../../../shared/icons/lucide-icons.module';

@Component({
  selector: 'app-recipe-detail',
  imports: [RouterLink, DecimalPipe, LucideIconsModule],
  templateUrl: './recipe-detail.html',
  styleUrl: './recipe-detail.css',
})
export class RecipeDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly mealdbService = inject(MealdbService);

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

    if (!recipe) {
      return [];
    }

    return this.extractIngredients(recipe);
  });

  readonly tags = computed<string[]>(() => {
    const rawTags = this.meal()?.strTags;

    if (!rawTags?.trim()) {
      return [];
    }

    return rawTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  });

  readonly instructions = computed<string[]>(() => {
    const rawInstructions = this.meal()?.strInstructions;

    if (!rawInstructions?.trim()) {
      return [];
    }

    return this.splitInstructions(rawInstructions);
  });

  readonly checkedCount = computed(
    () => this.checkedIngredients().size,
  );

  readonly ingredientProgress = computed(() => {
    const total = this.ingredients().length;

    if (total === 0) {
      return 0;
    }

    return Math.round((this.checkedCount() / total) * 100);
  });

  // =========================================================
  // LIFECYCLE
  // =========================================================

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('We could not find this recipe.');
      return;
    }

    this.loadRecipe(id);
  }

  // =========================================================
  // LOAD RECIPE
  // =========================================================

  private loadRecipe(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.meal.set(null);
    this.checkedIngredients.set(new Set());

    this.mealdbService.getMealById(id).subscribe({
      next: (response) => {
        const recipe = response.meals?.[0] ?? null;

        if (!recipe) {
          this.error.set('This recipe could not be found.');
          this.loading.set(false);
          return;
        }

        this.meal.set(recipe);
        this.loading.set(false);
      },

      error: () => {
        this.meal.set(null);
        this.error.set(
          'We could not load this recipe right now. Please try again.',
        );
        this.loading.set(false);
      },
    });
  }

  // =========================================================
  // INGREDIENT EXTRACTION
  // =========================================================

  private extractIngredients(recipe: Meal): RecipeIngredient[] {
    const result: RecipeIngredient[] = [];

    for (let index = 1; index <= 20; index++) {
      const ingredient = recipe[`strIngredient${index}`];
      const measure = recipe[`strMeasure${index}`];

      const name = ingredient?.trim() ?? '';
      const amount = measure?.trim() ?? '';

      if (!name) {
        continue;
      }

      result.push({
        name,
        measure: amount,
      });
    }

    return result;
  }

  // =========================================================
  // INSTRUCTION PARSING
  // =========================================================

  private splitInstructions(raw: string): string[] {
    const normalized = raw
      .replace(/\r\n?/g, '\n')
      .replace(/\u00a0/g, ' ')
      .trim();

    if (!normalized) {
      return [];
    }

    // TheMealDB can return explicit markers such as:
    // step 1
    // Instructions...
    //
    // step 2
    // Instructions...

    const hasStepMarkers =
      /(?:^|\n)\s*step\s+\d+\s*:?\s*(?:\n|$)/i.test(normalized);

    if (hasStepMarkers) {
      return normalized
        .split(/(?:^|\n)\s*step\s+\d+\s*:?\s*(?:\n|$)/gi)
        .map((step) => this.cleanInstruction(step))
        .filter(Boolean);
    }

    // Some recipes use blank lines rather than step markers.
    return normalized
      .split(/\n\s*\n+/)
      .map((step) => this.cleanInstruction(step))
      .filter(Boolean);
  }

  private cleanInstruction(step: string): string {
    return step
      .replace(/^\s*step\s+\d+\s*:?\s*/i, '')
      .replace(/\n+/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .trim();
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

      if (checked) {
        next.add(name);
      } else {
        next.delete(name);
      }

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

    if (!id) {
      this.error.set('We could not find this recipe.');
      return;
    }

    this.loadRecipe(id);
  }

}