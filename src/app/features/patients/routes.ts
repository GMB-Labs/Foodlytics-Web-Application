import { Routes } from '@angular/router';
import { PatientsFeature } from './feature.component';
import {DetailPage} from "./ui/pages/overview/detail.page";

export const PATIENTS_ROUTES: Routes = [
    {
        path: '',
        component: PatientsFeature,
        children: [
            { path: '', loadComponent: () => import('./ui/pages/list/patients-list.component').then(m => m.PatientsListComponent) },
            { path: 'create', loadComponent: () => import ('./ui/pages/create/create-patient.component').then(m => m.CreatePatientComponent) },
            { path: 'edit/:id', loadComponent: () => import ('./ui/pages/edit/edit-patient.component').then(m => m.EditPatientComponent) },
            { path: 'overview/:id', loadComponent: () => import ('./ui/pages/overview/detail.page').then(m => m.DetailPage)},
        ]
    }
];