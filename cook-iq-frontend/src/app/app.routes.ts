import { Routes } from '@angular/router';
import { AppLayout } from './core/layout/app-layout/app-layout';

export const routes: Routes = [
    // =========================================================
    // HOME
    // =========================================================

    {
        path: '',
        component: AppLayout,
        children: [
            {
                path: '',
                loadChildren: () =>
                    import('./features/home/home.routes').then(m => m.HOME_ROUTES)
            },
        ],
    },

    // =========================================================
    // APP
    // =========================================================
    {
        path: 'app',
        component: AppLayout,
        children: [
            // Dashboard
            {
                path: 'dashboard',
                loadChildren: () =>
                    import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
            },
            // My Recipes
            {
                path: 'my-recipes',
                loadChildren: () =>
                    import('./features/my-recipes/my-recipes.routes').then((m) => m.MY_RECIPES_ROUTES),
            },
        ],

    },

    // =========================================================
    // FALLBACK
    // =========================================================
    { path: '**', redirectTo: 'login' }
];