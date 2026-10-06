export interface MyRecipe {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly imageUrl?: string;

    readonly category?: string;
    readonly cuisine?: string;

    readonly prepTime?: number;
    readonly cookTime?: number;
    readonly servings?: number;

    readonly ingredients: readonly MyRecipeIngredient[];
    readonly instructions: readonly string[];

    readonly createdAt: string;
    readonly updatedAt: string;
}

export interface MyRecipeIngredient {
    readonly name: string;
    readonly quantity?: string;
    readonly unit?: string;
}