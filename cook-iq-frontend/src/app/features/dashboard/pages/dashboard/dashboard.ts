import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { DashboardHeader } from '../../components/dashboard-header/dashboard-header';
import { RecipeOfTheDay } from '../../components/recipe-of-the-day/recipe-of-the-day';
import { MealdbService } from '../../../../core/services/mealdb/mealdb-service';
import { map } from 'rxjs';
import { QuickActions } from '../../components/quick-actions/quick-actions';

@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe, DashboardHeader, RecipeOfTheDay, QuickActions],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard {
  private readonly mealDb = inject(MealdbService);


  readonly recipeOfTheDay$ = this.mealDb
    .getRandomMeal()
    .pipe(
      map((response) => response.meals?.[0] ?? null),
    );
}