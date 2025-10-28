import {Routes} from "@angular/router";

export const SETTINGS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./feature.component').then(m => m.SettingsFeature),
        children: [
            {
                path: '',
                title: 'Settings',
                data: { breadcrumb: 'Settings' },
                loadComponent: () =>
                    import('./ui/pages/settings.component').then(m => m.SettingsComponent)
            }
        ]
    }
]