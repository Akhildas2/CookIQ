export default {
  routes: [
    {
      method: 'GET',
      path: '/recipe-ai/detail',
      handler: 'recipe.detail',
      config: { auth: false, middlewares: ['global::supabase-auth'] },
    },
    {
      method: 'POST',
      path: '/recipe-ai/suggestions',
      handler: 'recipe.suggestions',
      config: { auth: false, middlewares: ['global::supabase-auth'] },
    },
  ],
};