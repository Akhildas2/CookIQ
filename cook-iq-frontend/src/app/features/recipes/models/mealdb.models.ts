export interface Meal {
    idMeal: string;
    strMeal: string;
    strDrinkAlternate: string | null;
    strCategory: string | null;
    strArea: string | null;
    strInstructions: string | null;
    strMealThumb: string;
    strTags: string | null;
    strYoutube: string | null;
    strSource: string | null;
    strImageSource: string | null;
    strCreativeCommonsConfirmed: string | null;
    dateModified: string | null;

    [key: `strIngredient${number}`]: string | null;
    [key: `strMeasure${number}`]: string | null;
}

export interface MealSummary {
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
}

export interface MealCategory {
    idCategory: string;
    strCategory: string;
    strCategoryThumb: string;
    strCategoryDescription: string;
}

export interface MealArea {
    strArea: string;
}

export interface MealIngredient {
    idIngredient: string;
    strIngredient: string;
    strDescription: string | null;
    strType: string | null;
}

export interface MealResponse {
    meals: Meal[] | null;
}

export interface MealSummaryResponse {
    meals: MealSummary[] | null;
}

export interface MealCategoryResponse {
    categories: MealCategory[] | null;
}

export interface MealAreaResponse {
    meals: MealArea[] | null;
}

export interface MealIngredientResponse {
    meals: MealIngredient[] | null;
}
