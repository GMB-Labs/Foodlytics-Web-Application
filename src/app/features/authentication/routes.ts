import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./feature.component').then(m => m.AuthenticationFeature),
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'sign-in' },
            { path: 'test',
                title: 'Test',
                loadComponent: () =>
                    import('./ui/pages/auth/auth.component').then(m => m.AuthComponent)
            },
            { path: 'sign-in',
                title: 'Sign In',
                loadComponent: () =>
                    import('./ui/pages/sign-in/sign-in.component').then(m => m.SignInComponent) },

            { path: 'sign-up',
                title: 'Sign Up',
                loadComponent: () =>
                    import('./ui/pages/sign-up/sign-up.component').then(m => m.SignUpComponent) },

            { path: 'callback',
                loadComponent: () =>
                    import('./ui/pages/callback/callback.component').then(m => m.CallbackComponent) },

            { path: 'logout',
                title: 'Logout',
                loadComponent: () =>
                    import('./ui/pages/logout/logout.component').then(m => m.LogoutComponent) },
        ],
    },
];