import { Routes } from '@angular/router';

export const RECIPES_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/recipes/recipes').then((m) => m.Recipes),
    },
];