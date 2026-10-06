import { Routes } from '@angular/router';

export const MY_RECIPES_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/my-recipes/my-recipes').then((m) => m.MyRecipes),
    },
];