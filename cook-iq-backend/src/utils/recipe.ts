
export const CUISINES = [
    'italian',
    'chinese',
    'mexican',
    'indian',
    'american',
    'thai',
    'japanese',
    'mediterranean',
    'french',
    'korean',
    'vietnamese',
    'spanish',
    'greek',
    'turkish',
    'moroccan',
    'brazilian',
    'caribbean',
    'middle-eastern',
    'british',
    'german',
    'portuguese',
    'other',
] as const;

export const CATEGORIES = [
    'breakfast',
    'lunch',
    'dinner',
    'snack',
    'dessert',
] as const;

export type Cuisine = (typeof CUISINES)[number];
export type RecipeCategory = (typeof CATEGORIES)[number];

export function normalizeTitle(title: string): string {
    return title
        .trim()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

export function pickEnum<T extends readonly string[]>(
    value: unknown,
    allowed: T,
    fallback: T[number],
): T[number] {
    const normalized = String(value ?? '').toLowerCase().trim();

    return allowed.find((item) => item === normalized) ?? fallback;
}

// Pro-only fields are removed on the server for free users.
export function recipeDto(r: any, isPro: boolean) {
    return {
        id: r.documentId,
        title: r.title,
        description: r.description,
        cuisine: r.cuisine,
        category: r.category,
        prepTime: r.prepTime,
        cookTime: r.cookTime,
        servings: r.servings,
        imageUrl: r.imageUrl || '',
        ingredients: r.ingredients ?? [],
        instructions: r.instructions ?? [],
        nutrition: isPro ? r.nutrition ?? null : null,
        tips: isPro ? r.tips ?? [] : [],
        substitutions: isPro ? r.substitutions ?? [] : [],
        lockedSections: isPro
            ? []
            : ['nutrition', 'tips', 'substitutions'],
    };
}
