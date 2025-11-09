import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./feature.component').then(m => m.AuthenticationFeature),
        children: [
            { path: '',
                title: 'Auth',
                loadComponent: () =>
                    import('./ui/pages/auth/auth.component').then(m => m.AuthComponent)
            },
            { path: 'callback',
                title: 'Callback',
                loadComponent: () =>
                    import('./ui/pages/callback/callback.component').then(m => m.CallbackComponent) },

            { path: 'logout',
                title: 'Logout',
                loadComponent: () =>
                    import('./ui/pages/logout/logout.component').then(m => m.LogoutComponent) },
        ],
    },
];