import { Routes } from '@angular/router';
import { AuthLayout } from './core/layout/auth-layout/auth-layout';
import { AppLayout } from './core/layout/app-layout/app-layout';

export const routes: Routes = [
    // Home
    {
        path: '',
        component: AppLayout,
        children: [
            {
                path: '',
                loadChildren: () =>
                    import('./features/home/home.routes').then(m => m.homeRoutes)
            },
        ],
    },


    // Auth layout
    /* {
        path: '',
        component: AuthLayout,
        children: [
            {
                path: '',
                loadChildren: () =>
                    import('./features/auth/auth.routes').then(m => m.authRoutes),
            },
        ],
    },
 */
    // App layout 
    /* {
        path: 'app',
        component: AppLayout,
        children: [
            {
                path: 'dashboard',
                loadChildren: () =>
                    import('./features/dashboard/dashboard.routes').then(
                        m => m.DASHBOARD_ROUTES
                    ),
            },
        ],
    },
 */
    // fallback
    { path: '**', redirectTo: 'login' }
];