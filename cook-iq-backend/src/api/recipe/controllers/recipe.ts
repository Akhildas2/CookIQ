/**
 * recipe controller
 */

import { factories } from '@strapi/strapi';
import { getCurrentUser, isProUser } from '../../../utils/user';
import { checkLimit } from '../../../utils/arcjet';
import { generateJson } from '../../../utils/gemini';
import { CUISINES, CATEGORIES, normalizeTitle, pickEnum, recipeDto } from '../../../utils/recipe';

const UID = 'api::recipe.recipe';

async function fetchRecipeImage(query: string): Promise<string> {
    const key = process.env.UNSPLASH_ACCESS_KEY;
    if (!key) return '';
    try {
        const res = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
            { headers: { Authorization: `Client-ID ${key}` } }
        );
        if (!res.ok) return '';
        const data: any = await res.json();
        return data?.results?.[0]?.urls?.regular ?? '';
    } catch {
        return '';
    }
}

const toList = (v: any) => (Array.isArray(v) ? v : []);

export default factories.createCoreController(UID, () => ({
    // GET /recipe-ai/detail?name=apple cake
    async detail(ctx) {
        const user = await getCurrentUser(ctx);
        if (!user) return ctx.unauthorized('Login required');

        const name = String(ctx.query.name ?? '').trim();
        if (!name || name.length > 100) return ctx.badRequest('Valid recipe name required');

        const title = normalizeTitle(name);
        const isPro = await isProUser(user.id);

        const isSavedFor = async (recipeDocId: string) => {
            const saved = await strapi.documents('api::saved-recipe.saved-recipe').findFirst({
                filters: { user: { id: user.id }, recipe: { documentId: recipeDocId } },
            });
            return !!saved;
        };

        // 1) Cache: already in DB? (no AI cost, no rate-limit token used)
        const existing = await strapi.documents(UID).findFirst({
            filters: { title: { $eqi: title } },
        });
        if (existing) {
            return {
                recipe: recipeDto(existing, isPro),
                isSaved: await isSavedFor(existing.documentId),
                isPro,
                fromCache: true,
            };
        }

        // 2) Not found → rate limit, then generate
        const limit = await checkLimit(ctx, 'recipe', user.id, isPro);
        if (!limit.allowed) {
            return ctx.tooManyRequests(
                isPro ? 'AI limit reached. Try again later.' : 'Monthly AI recipe limit reached. Upgrade to Pro!'
            );
        }

        const prompt = `You are a professional chef. Generate a detailed recipe for "${title}".
Return ONE JSON object with exactly these keys:
{
 "description": "2-3 sentences",
 "category": one of ${JSON.stringify(CATEGORIES)},
 "cuisine": one of ${JSON.stringify(CUISINES)},
 "prepTime": number (minutes), "cookTime": number (minutes), "servings": number,
 "ingredients": [{"item": string, "amount": string with unit, "category": "Protein|Vegetable|Spice|Dairy|Grain|Other"}],
 "instructions": [{"step": 1, "title": string, "instruction": string, "tip": string (optional)}],
 "nutrition": {"calories": string, "protein": string, "carbs": string, "fat": string},
 "tips": [3 short general tips],
 "substitutions": [{"original": string, "alternatives": [string, string]}]
}
Rules: realistic common ingredients, beginner friendly, 6-10 steps, lowercase cuisine, pick "other" if unsure.`;

        const ai = await generateJson<any>([{ text: prompt }]);

        const ingredients = toList(ai.ingredients);
        const instructions = toList(ai.instructions).map((s: any, i: number) => ({
            step: Number(s.step) || i + 1,
            title: String(s.title ?? `Step ${i + 1}`),
            instruction: String(s.instruction ?? ''),
            tip: s.tip ? String(s.tip) : '',
        }));
        if (!ingredients.length || !instructions.length) {
            return ctx.badRequest('AI could not generate a valid recipe. Please try again.');
        }

        const imageUrl = await fetchRecipeImage(title);

        const created = await strapi.documents(UID).create({
            data: {
                title,
                description: String(ai.description ?? ''),
                category: pickEnum(ai.category, CATEGORIES, 'dinner'),
                cuisine: pickEnum(ai.cuisine, CUISINES, 'other'),
                prepTime: Number(ai.prepTime) || 0,
                cookTime: Number(ai.cookTime) || 0,
                servings: Number(ai.servings) || 2,
                ingredients,
                instructions,
                nutrition: ai.nutrition ?? null,
                tips: toList(ai.tips),
                substitutions: toList(ai.substitutions),
                imageUrl,
                isPublic: true,
                author: user.documentId,
            },
        });

        return {
            recipe: recipeDto(created, isPro),
            isSaved: false,
            isPro,
            fromCache: false,
            recommendationsRemaining: isPro ? null : limit.remaining ?? null,
        };
    },

    // POST /recipe-ai/suggestions  → "What can I cook?" from pantry
    async suggestions(ctx) {
        const user = await getCurrentUser(ctx);
        if (!user) return ctx.unauthorized('Login required');

        const pantry = await strapi.documents('api::pantry-item.pantry-item').findMany({
            filters: { owner: { id: user.id } },
            limit: 100,
        });
        if (!pantry.length) return { empty: true, recipes: [], ingredientsUsed: '' };

        const isPro = await isProUser(user.id);
        const limit = await checkLimit(ctx, 'recipe', user.id, isPro);
        if (!limit.allowed) {
            return ctx.tooManyRequests(
                isPro ? 'AI limit reached. Try again later.' : 'Monthly AI recipe limit reached. Upgrade to Pro!'
            );
        }

        const ingredientsUsed = pantry.map((i: any) => i.name).join(', ');

        const prompt = `You are a professional chef. Available ingredients: ${ingredientsUsed}
Suggest 5 realistic, delicious recipes made primarily with these. 1-2 common staples (salt, oil, pepper) may be missing.
Return a JSON array, each item:
{"title": string, "description": "1-2 sentences", "matchPercentage": number 70-100, "missingIngredients": [string], "category": one of ${JSON.stringify(CATEGORIES)}, "cuisine": one of ${JSON.stringify(CUISINES)}, "prepTime": number, "cookTime": number, "servings": number}
Sort by matchPercentage descending.`;

        const result = await generateJson<any>([{ text: prompt }]);
        const arr = Array.isArray(result) ? result : result?.recipes;

        const recipes = toList(arr)
            .slice(0, 5)
            .map((r: any) => ({
                title: normalizeTitle(String(r.title ?? '')),
                description: String(r.description ?? ''),
                matchPercentage: Math.min(100, Math.max(0, Number(r.matchPercentage) || 70)),
                missingIngredients: toList(r.missingIngredients).map(String),
                category: pickEnum(r.category, CATEGORIES, 'dinner'),
                cuisine: pickEnum(r.cuisine, CUISINES, 'other'),
                prepTime: Number(r.prepTime) || 0,
                cookTime: Number(r.cookTime) || 0,
                servings: Number(r.servings) || 2,
            }))
            .filter((r: any) => r.title);

        return {
            empty: false,
            recipes,
            ingredientsUsed,
            recommendationsRemaining: isPro ? null : limit.remaining ?? null,
        };
    },
}));