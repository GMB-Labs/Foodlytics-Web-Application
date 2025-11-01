export type PlanId = 'starter' | 'advanced' | 'professional_plus';

export interface PlanLimits {
    /** Máximo de pacientes permitidos por plan */
    maxPatients: number;
    /** Exportaciones PDF por semana; Infinity = ilimitado */
    exportPdfPerWeek: number;
    /** Rutas/funcionalidades habilitadas por plan */
    features: {
        kanban: boolean;
        calendar: boolean;
        liveSupport: boolean;
    };
}

export interface PlanFeature {
    label: string;
    included: boolean;
}

export interface Plan {
    id: PlanId;
    name: string;
    priceCents: number;
    currency: 'PEN';
    tagline: string;
    features: PlanFeature[]; // “bullets”
    cta: string;
    recommended?: boolean;
    limits: PlanLimits;      // límites y rutas habilitadas
}