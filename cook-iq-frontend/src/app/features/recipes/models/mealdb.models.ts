export interface Meal {
  readonly idMeal: string;
  readonly strMeal: string;
  readonly strDrinkAlternate: string | null;
  readonly strCategory: string | null;
  readonly strArea: string | null;
  readonly strInstructions: string | null;
  readonly strMealThumb: string;
  readonly strTags: string | null;
  readonly strYoutube: string | null;
  readonly strSource: string | null;
  readonly strImageSource: string | null;
  readonly strCreativeCommonsConfirmed: string | null;
  readonly dateModified: string | null;

  [key: `strIngredient${number}`]: string | null;
  [key: `strMeasure${number}`]: string | null;
}

export interface MealSummary {
  readonly idMeal: string;
  readonly strMeal: string;
  readonly strMealThumb: string;
}

export interface MealCategory {
  readonly idCategory: string;
  readonly strCategory: string;
  readonly strCategoryThumb: string;
  readonly strCategoryDescription: string;
}

export interface MealCategoryListItem {
  readonly strCategory: string;
}

export interface MealArea {
  readonly strArea: string;
}

export interface MealIngredient {
  readonly idIngredient: string;
  readonly strIngredient: string;
  readonly strDescription: string | null;
  readonly strType: string | null;
}

export interface MealResponse {
  readonly meals: Meal[] | null;
}

export interface MealSummaryResponse {
  readonly meals: MealSummary[] | null;
}

export interface MealCategoryResponse {
  readonly categories: MealCategory[] | null;
}

export interface MealCategoryListResponse {
  readonly meals: MealCategoryListItem[] | null;
}

export interface MealAreaResponse {
  readonly meals: MealArea[] | null;
}

export interface MealIngredientResponse {
  readonly meals: MealIngredient[] | null;
}

export interface RecipeIngredient {
  readonly name: string;
  readonly measure: string;
}