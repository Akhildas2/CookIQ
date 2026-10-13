
import { Routes } from '@angular/router';

export const PANTRY_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/pantry/pantry').then((m) => m.Pantry),
    },
];