import {computed, Injectable, signal} from '@angular/core';
import {Plan, PlanId} from './plans.model';

@Injectable({ providedIn: 'root' })
export class PlansService {
    private readonly data: Plan[] = [
        {
            id: 'starter',
            name: 'Starter',
            priceCents: 0,
            currency: 'PEN',
            tagline: 'Empieza gratis y valida tu flujo',
            cta: 'Empezar ahora',
            features: [
                { label: 'Hasta 5 pacientes', included: true },
                { label: 'Soporte por correo', included: true },
                { label: 'Exportar PDF (1 semanal)', included: true },
            ],
            limits: {
                maxPatients: 5,
                exportPdfPerWeek: 1,
                features: { kanban: false, calendar: false, liveSupport: false },
            },
        },
        {
            id: 'advanced',
            name: 'Advanced',
            priceCents: 2990,
            currency: 'PEN',
            tagline: 'Productividad para tu día a día',
            cta: 'Suscribirme',
            features: [
                { label: 'Hasta 25 pacientes', included: true },
                { label: 'Exportar PDF ilimitados', included: true },
                { label: 'Kanban board', included: true },
                { label: 'Calendar con alertas', included: true },
                { label: 'Soporte en vivo', included: true },
            ],
            limits: {
                maxPatients: 25,
                exportPdfPerWeek: Infinity,
                features: { kanban: true, calendar: true, liveSupport: true },
            },
            recommended: true,
        },
        {
            id: 'professional_plus',
            name: 'Professional+',
            priceCents: 4990,
            currency: 'PEN',
            tagline: 'Escala con más pacientes y control',
            cta: 'Suscribirme',
            features: [
                { label: 'Hasta 100 pacientes', included: true },
                { label: 'Exportar PDF ilimitados', included: true },
                { label: 'Kanban board', included: true },
                { label: 'Calendar con alertas', included: true },
                { label: 'Soporte en vivo', included: true },
            ],
            limits: {
                maxPatients: 100,
                exportPdfPerWeek: Infinity,
                features: { kanban: true, calendar: true, liveSupport: true },
            },
        },
    ] as const;

    readonly plans = signal<readonly Plan[]>(this.data);

    // 3) Selectores
    readonly recommended = computed(() => this.plans().find(p => p.recommended));

    // 4) Helpers
    getById(id: PlanId): Plan | undefined {
        return this.plans().find(p => p.id === id);
    }

    formatPrice(cents: number): string {
        return (cents / 100).toLocaleString('es-PE', {
            style: 'currency',
            currency: 'PEN',
        });
    }

    trackById = (_: number, p: Plan) => p.id;

    readonly commonBullets: readonly string[] = [
        'Conexión con pacientes vía app móvil',
        'Acceso completo al dashboard',
        'Detalles completos del paciente',
    ] as const;
}