import {Routes} from "@angular/router";

export const SETTINGS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./feature.component').then(m => m.SettingsFeature),
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./ui/pages/settings.component').then(m => m.SettingsComponent),
                children: [
                    {
                        path: '',
                        title: 'Settings',
                        data: { breadcrumb: 'Configuración' },
                        loadComponent: () =>
                            import('./ui/components/account-settings/account-settings.component').then(m => m.AccountSettingsComponent)
                    },
                    {
                        path: 'change-password',
                        title: 'Change Password',
                        data: { breadcrumb: 'Cambiar Contraseña' },
                        loadComponent: () =>
                            import('./ui/components/change-password/change-password.component').then(m => m.ChangePasswordComponent)
                    },
                    {
                        path: 'privacy-policy',
                        title: 'Privacy Policy',
                        data: { breadcrumb: 'Políticas de Privacidad' },
                        loadComponent: () =>
                            import('./ui/components/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent)
                    },
                    {
                        path: 'terms-conditions',
                        title: 'Terms Conditions',
                        data: { breadcrumb: 'Términos y Condiciones' },
                        loadComponent: () =>
                            import('./ui/components/terms-conditions/terms-conditions.component').then(m => m.TermsConditionsComponent)
                    }
                ]
            }
        ]
    }
]