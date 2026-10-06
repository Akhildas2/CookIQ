import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MealAreaResponse, MealCategoryResponse, MealIngredientResponse, MealResponse, MealSummaryResponse } from '../../../features/recipes/models/mealdb.models';

@Injectable({
  providedIn: 'root',
})
export class MealdbService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.mealDb.baseUrl;

  /**
 * Get a random meal.
 */
  getRandomMeal() {
    return this.http.get<MealResponse>(
      `${this.baseUrl}/random.php`,
    );
  }

  /**
   * Get meal by ID.
   */
  getMealById(id: string) {
    const params = new HttpParams().set('i', id);

    return this.http.get<MealResponse>(
      `${this.baseUrl}/lookup.php`,
      { params },
    );
  }

  /**
   * Search meals by name.
   */
  searchMeals(query: string) {
    const params = new HttpParams().set('s', query);

    return this.http.get<MealResponse>(
      `${this.baseUrl}/search.php`,
      { params },
    );
  }

  /**
   * Get meals starting with a specific letter.
   */
  getMealsByFirstLetter(letter: string) {
    const params = new HttpParams().set('f', letter);

    return this.http.get<MealResponse>(
      `${this.baseUrl}/search.php`,
      { params },
    );
  }

  /**
   * Get all categories.
   */
  getCategories() {
    return this.http.get<MealCategoryResponse>(
      `${this.baseUrl}/categories.php`,
    );
  }

  /**
   * Get category list.
   */
  getCategoryList() {
    const params = new HttpParams().set('c', 'list');

    return this.http.get<MealCategoryResponse>(
      `${this.baseUrl}/list.php`,
      { params },
    );
  }

  /**
   * Get all areas / cuisines.
   */
  getAreas() {
    const params = new HttpParams().set('a', 'list');

    return this.http.get<MealAreaResponse>(
      `${this.baseUrl}/list.php`,
      { params },
    );
  }

  /**
   * Get all ingredients.
   */
  getIngredients() {
    const params = new HttpParams().set('i', 'list');

    return this.http.get<MealIngredientResponse>(
      `${this.baseUrl}/list.php`,
      { params },
    );
  }

  /**
   * Get meals by category.
   */
  getMealsByCategory(category: string) {
    const params = new HttpParams().set('c', category);

    return this.http.get<MealSummaryResponse>(
      `${this.baseUrl}/filter.php`,
      { params },
    );
  }

  /**
   * Get meals by cuisine / area.
   */
  getMealsByArea(area: string) {
    const params = new HttpParams().set('a', area);

    return this.http.get<MealSummaryResponse>(
      `${this.baseUrl}/filter.php`,
      { params },
    );
  }

  /**
   * Get meals by main ingredient.
   */
  getMealsByIngredient(ingredient: string) {
    const params = new HttpParams().set('i', ingredient);

    return this.http.get<MealSummaryResponse>(
      `${this.baseUrl}/filter.php`,
      { params },
    );
  }

}