import { Meal, RecipeIngredient } from '../models/mealdb.models';

/**
 * Extract available ingredients and measurements from a MealDB recipe.
 */
export function extractIngredients(recipe: Meal): RecipeIngredient[] {
    const ingredients: RecipeIngredient[] = [];

    for (let index = 1; index <= 20; index++) {
        const name = recipe[`strIngredient${index}`]?.trim() ?? '';
        const measure = recipe[`strMeasure${index}`]?.trim() ?? '';

        if (name) {
            ingredients.push({ name, measure });
        }
    }

    return ingredients;
}

/**
 * Convert MealDB instructions into readable individual steps.
 */
export function splitInstructions(raw: string): string[] {
    const normalized = raw.replace(/\r\n?/g, '\n')
        .replace(/\u00a0/g, ' ')
        .trim();

    if (!normalized) return [];

    const hasStepMarkers = /(?:^|\n)\s*step\s+\d+\s*:?\s*(?:\n|$)/i.test(normalized);

    const steps = hasStepMarkers
        ? normalized.split(/(?:^|\n)\s*step\s+\d+\s*:?\s*(?:\n|$)/gi)
        : normalized.split(/\n\s*\n+/);

    return steps
        .map((step) =>
            step.replace(/^\s*step\s+\d+\s*:?\s*/i, '')
                .replace(/\n+/g, ' ')
                .replace(/[ \t]+/g, ' ')
                .trim(),
        )
        .filter(Boolean);
}

/**
 * Return a valid YouTube video ID from supported URL formats.
 */
export function getYoutubeVideoId(url: string): string | null {
    try {
        const parsed = new URL(url);
        const host = parsed.hostname.toLowerCase();

        if (!['http:', 'https:'].includes(parsed.protocol)) return null;

        const youtubeHosts = [
            'youtube.com',
            'www.youtube.com',
            'm.youtube.com',
            'youtu.be',
            'youtube-nocookie.com',
            'www.youtube-nocookie.com',
        ];

        if (!youtubeHosts.includes(host)) return null;

        const id = host === 'youtu.be'
            ? parsed.pathname.split('/').filter(Boolean)[0]
            : parsed.searchParams.get('v') ??
            parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1];

        return id && /^[\w-]{11}$/.test(id) ? id : null;
    } catch {
        return null;
    }

}