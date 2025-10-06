import { Routes } from '@angular/router';
import { PatientsFeature } from './feature.component';

export const PATIENTS_ROUTES: Routes = [
    {
        path: '',
        component: PatientsFeature,
        children: [
            { path: '', loadComponent: () => import('./ui/list/patients-list.component').then(m => m.PatientsListComponent) },
            { path: 'create', loadComponent: () => import ('./ui/create/create-patient.component').then(m => m.CreatePatientComponent) },
            { path: 'edit/:id', loadComponent: () => import ('./ui/edit/edit-patient.component').then(m => m.EditPatientComponent) }
        ]
    }
];