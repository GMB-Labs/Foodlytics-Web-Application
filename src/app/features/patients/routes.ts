import { Routes } from '@angular/router';
import { PatientsFeature } from './feature.component';
import {DetailPage} from "./ui/pages/overview/detail.page";

export const PATIENTS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./feature.component').then(m => m.PatientsFeature),
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'list'
            },
            { path: '',
                title: 'Pacientes',
                data: { breadcrumb: 'Pacientes' },
                loadComponent: () =>
                    import('./ui/pages/list/patients-list.component').then(m => m.PatientsListComponent)
            },
            { path: 'create',
                title: 'Crear Paciente',
                data: { breadcrumb: 'Crear Paciente' },
                loadComponent: () =>
                    import ('./ui/pages/create/create-patient.component').then(m => m.CreatePatientComponent)
            },
            { path: 'edit/:id',
                title: 'Editar Paciente',
                data: { breadcrumb: 'Editar Paciente' },
                loadComponent: () =>
                    import ('./ui/pages/edit/edit-patient.component').then(m => m.EditPatientComponent)
            },
            { path: 'overview/:id',
                title: 'Detalle Paciente',
                data: { breadcrumb: 'Detalle Paciente' },
                loadComponent: () =>
                    import ('./ui/pages/overview/detail.page').then(m => m.DetailPage)
            },
        ]
    }
];