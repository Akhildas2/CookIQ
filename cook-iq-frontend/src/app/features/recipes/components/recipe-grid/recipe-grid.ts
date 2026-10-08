import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MealSummary } from '../../models/mealdb.models';
import { RecipeCard } from '../recipe-card/recipe-card';

@Component({
  selector: 'app-recipe-grid',
  imports: [RecipeCard],
  templateUrl: './recipe-grid.html',
  styleUrl: './recipe-grid.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeGrid {
  readonly meals = input.required<readonly MealSummary[]>();
}