import {Routes} from "@angular/router";

export const INVOICE_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./feature.component').then(m => m.InvoiceFeature),
        children: [
            {
                path: '',
                title: 'Invoice',
                data: { breadcrumb: 'Invoice' },
                loadComponent: () =>
                    import('./ui/pages/invoices/invoices.component').then(m => m.InvoicesComponent)
            },
            {
                path: 'details',
                title: 'Invoice Details',
                data: { breadcrumb: 'Invoice Details' },
                loadComponent: () =>
                    import('./ui/pages/invoice-details/invoice-details.component').then(m => m.InvoiceDetailsComponent)
            }
        ]
    }
]