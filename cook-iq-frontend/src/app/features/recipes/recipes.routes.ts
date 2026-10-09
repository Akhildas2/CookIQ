import { Routes } from '@angular/router';

export const RECIPES_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/recipes/recipes').then((m) => m.Recipes),
    },
    {
        path: ':id',
        loadComponent: () =>
            import('./pages/recipe-detail/recipe-detail').then((m) => m.RecipeDetail),
    },
];