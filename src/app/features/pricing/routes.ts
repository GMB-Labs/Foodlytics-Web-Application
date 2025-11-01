import {Routes} from "@angular/router";

export const PRICING_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./feature.component').then(m => m.PricingFeature),
        children: [
            {
                path: '',
                title: 'Suscripciones',
                data: { breadcrumb: 'Suscripciones' },
                loadComponent: () =>
                    import('./ui/pages/pricing-page.component').then(m => m.PricingPageComponent)
            }
        ]
    }
]