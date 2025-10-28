import { Routes } from '@angular/router';
import { AuthenticationFeature } from './feature.component';

export const AUTH_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./feature.component').then(m => m.AuthenticationFeature),
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'sign-in' },
            { path: 'sign-in',
                title: 'Sign In',
                loadComponent: () =>
                    import('./ui/pages/sign-in/sign-in.component').then(m => m.SignInComponent) },

            { path: 'sign-up',
                title: 'Sign Up',
                loadComponent: () =>
                    import('./ui/pages/sign-up/sign-up.component').then(m => m.SignUpComponent) },

            { path: 'forgot-password',
                title: 'Forgot Password',
                loadComponent: () =>
                    import('./ui/pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },

            { path: 'reset-password', //nop
                loadComponent: () =>
                    import('./ui/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },

            { path: 'confirm-email', //nop
                loadComponent: () =>
                    import('./ui/confirm-email/confirm-email.component').then(m => m.ConfirmEmailComponent) },

            { path: 'lock-screen', //nop
                loadComponent: () =>
                    import('./ui/lock-screen/lock-screen.component').then(m => m.LockScreenComponent) },

            { path: 'logout',
                title: 'Logout',
                loadComponent: () =>
                    import('./ui/pages/logout/logout.component').then(m => m.LogoutComponent) },
        ],
    },
];