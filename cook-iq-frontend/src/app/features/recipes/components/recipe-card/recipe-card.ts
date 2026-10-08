import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MealSummary } from '../../models/mealdb.models';
import { RouterLink } from '@angular/router';
import { LucideIconsModule } from '../../../../shared/icons/lucide-icons.module';

@Component({
  selector: 'app-recipe-card',
  imports: [RouterLink, LucideIconsModule],
  templateUrl: './recipe-card.html',
  styleUrl: './recipe-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeCard {
  readonly meal = input.required<MealSummary>();
}