import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { MealAreaResponse, MealCategoryListResponse, MealCategoryResponse, MealIngredientResponse, MealResponse, MealSummary, MealSummaryResponse } from '../../../features/recipes/models/mealdb.models';
import { forkJoin, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MealdbService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = environment.mealDb.baseUrl;

  /* =========================================================
     RANDOM
     ========================================================= */

  getRandomMeal(): Observable<MealResponse> {
    return this.http.get<MealResponse>(
      `${this.baseUrl}/random.php`
    );
  }

  /* =========================================================
     ALL MEALS
     ========================================================= */
  getAllMeals(): Observable<MealSummary[]> {
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

    return forkJoin(
      letters.map(letter =>
        this.getMealsByFirstLetter(letter)
      )
    ).pipe(
      map(responses => {
        const meals = responses.flatMap(
          response => response.meals ?? []
        );

        const uniqueMeals = new Map(
          meals.map(meal => [meal.idMeal, meal])
        );

        return Array.from(uniqueMeals.values());
      })
    );
  }

  /* =========================================================
     SINGLE MEAL
     ========================================================= */

  getMealById(id: string): Observable<MealResponse> {
    const params = new HttpParams().set('i', id);

    return this.http.get<MealResponse>(
      `${this.baseUrl}/lookup.php`,
      { params }
    );
  }

  /* =========================================================
     SEARCH
     ========================================================= */

  searchMeals(query: string): Observable<MealResponse> {
    const params = new HttpParams().set('s', query.trim());

    return this.http.get<MealResponse>(
      `${this.baseUrl}/search.php`,
      { params }
    );
  }

  /* =========================================================
     FIRST LETTER
     ========================================================= */

  getMealsByFirstLetter(letter: string): Observable<MealResponse> {
    const params = new HttpParams().set('f', letter.trim().charAt(0));

    return this.http.get<MealResponse>(
      `${this.baseUrl}/search.php`,
      { params }
    );
  }

  /* =========================================================
     CATEGORIES
     ========================================================= */

  getCategories(): Observable<MealCategoryResponse> {
    return this.http.get<MealCategoryResponse>(
      `${this.baseUrl}/categories.php`
    );
  }

  getCategoryList(): Observable<MealCategoryListResponse> {
    const params = new HttpParams().set('c', 'list');

    return this.http.get<MealCategoryListResponse>(
      `${this.baseUrl}/list.php`,
      { params }
    );
  }

  /* =========================================================
     AREAS / CUISINES
     ========================================================= */

  getAreas(): Observable<MealAreaResponse> {
    const params = new HttpParams().set('a', 'list');

    return this.http.get<MealAreaResponse>(
      `${this.baseUrl}/list.php`,
      { params }
    );
  }

  /* =========================================================
     INGREDIENTS
     ========================================================= */

  getIngredients(): Observable<MealIngredientResponse> {
    const params = new HttpParams().set('i', 'list');

    return this.http.get<MealIngredientResponse>(
      `${this.baseUrl}/list.php`,
      { params }
    );
  }

  /* =========================================================
     FILTER BY CATEGORY
     ========================================================= */

  getMealsByCategory(category: string): Observable<MealSummaryResponse> {
    const params = new HttpParams().set('c', category.trim());

    return this.http.get<MealSummaryResponse>(
      `${this.baseUrl}/filter.php`,
      { params }
    );
  }

  /* =========================================================
     FILTER BY AREA
     ========================================================= */

  getMealsByArea(area: string): Observable<MealSummaryResponse> {
    const params = new HttpParams().set('a', area.trim());

    return this.http.get<MealSummaryResponse>(
      `${this.baseUrl}/filter.php`,
      { params }
    );
  }

  /* =========================================================
     FILTER BY INGREDIENT
     ========================================================= */

  getMealsByIngredient(ingredient: string): Observable<MealSummaryResponse> {
    const params = new HttpParams().set('i', ingredient.trim());

    return this.http.get<MealSummaryResponse>(
      `${this.baseUrl}/filter.php`,
      { params }
    );
  }

}