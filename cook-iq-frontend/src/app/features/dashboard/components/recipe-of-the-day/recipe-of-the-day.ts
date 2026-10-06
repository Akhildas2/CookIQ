import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Meal } from '../../../recipes/models/mealdb.models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recipe-of-the-day',
  imports: [RouterLink],
  templateUrl: './recipe-of-the-day.html',
  styleUrl: './recipe-of-the-day.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipeOfTheDay {
  readonly meal = input.required<Meal>();

}