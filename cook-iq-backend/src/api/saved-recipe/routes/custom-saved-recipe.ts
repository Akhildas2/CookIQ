const protectedRoute = (method: string, path: string, handler: string) => ({
  method,
  path,
  handler,
  config: { auth: false, middlewares: ['global::supabase-auth'] },
});

export default {
  routes: [
    protectedRoute('GET', '/my-recipes', 'saved-recipe.list'),
    protectedRoute('POST', '/my-recipes/:recipeId', 'saved-recipe.save'),
    protectedRoute('DELETE', '/my-recipes/:recipeId', 'saved-recipe.unsave'),
  ],
};