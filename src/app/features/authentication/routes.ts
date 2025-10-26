import { Routes } from '@angular/router';
import { AuthenticationFeature } from './feature.component';

export const AUTH_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./feature.component').then(m => m.AuthenticationFeature),
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'sign-in' },

            { path: 'sign-in',
                loadComponent: () =>
                    import('./ui/sign-in/sign-in.component').then(m => m.SignInComponent) },

            { path: 'sign-up',
                loadComponent: () =>
                    import('./ui/sign-up/sign-up.component').then(m => m.SignUpComponent) },

            { path: 'forgot-password',
                loadComponent: () =>
                    import('./ui/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },

            { path: 'reset-password',
                loadComponent: () =>
                    import('./ui/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },

            { path: 'confirm-email',
                loadComponent: () =>
                    import('./ui/confirm-email/confirm-email.component').then(m => m.ConfirmEmailComponent) },

            { path: 'lock-screen',
                loadComponent: () =>
                    import('./ui/lock-screen/lock-screen.component').then(m => m.LockScreenComponent) },

            { path: 'logout',
                loadComponent: () =>
                    import('./ui/logout/logout.component').then(m => m.LogoutComponent) },
        ],
    },
];