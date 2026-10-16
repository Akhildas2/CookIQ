/**
 * saved-recipe controller
 */

import { factories } from '@strapi/strapi';
import { getCurrentUser, isProUser } from '../../../utils/user';
import { recipeDto } from '../../../utils/recipe';

const UID = 'api::saved-recipe.saved-recipe';

const findSaved = (userId: number, recipeDocId: string) =>
  strapi.documents(UID).findFirst({
    filters: { user: { id: userId }, recipe: { documentId: recipeDocId } },
  });

export default factories.createCoreController(UID, () => ({
  // GET /my-recipes
  async list(ctx) {
    const user = await getCurrentUser(ctx);
    if (!user) return ctx.unauthorized('Login required');

    const isPro = await isProUser(user.id);
    const saved = await strapi.documents(UID).findMany({
      filters: { user: { id: user.id } },
      populate: { recipe: true },
      sort: 'savedAt:desc',
      limit: 200,
    });

    const recipes = saved
      .filter((s: any) => s.recipe)
      .map((s: any) => ({ ...recipeDto(s.recipe, isPro), savedAt: s.savedAt }));

    return { recipes, count: recipes.length };
  },

  // POST /my-recipes/:recipeId
  async save(ctx) {
    const user = await getCurrentUser(ctx);
    if (!user) return ctx.unauthorized('Login required');

    const recipeId = ctx.params.recipeId;
    const recipe = await strapi.documents('api::recipe.recipe').findOne({ documentId: recipeId });
    if (!recipe) return ctx.notFound('Recipe not found');

    if (await findSaved(user.id, recipeId)) return { saved: true, alreadySaved: true };

    await strapi.documents(UID).create({
      data: { user: user.documentId, recipe: recipeId, savedAt: new Date().toISOString() },
    });
    return { saved: true, alreadySaved: false };
  },

  // DELETE /my-recipes/:recipeId
  async unsave(ctx) {
    const user = await getCurrentUser(ctx);
    if (!user) return ctx.unauthorized('Login required');

    const existing = await findSaved(user.id, ctx.params.recipeId);
    if (existing) await strapi.documents(UID).delete({ documentId: existing.documentId });
    return { saved: false };
  },
}));