export type PlanId = "starter" | "advanced" | "professional_plus";

export interface PlanFeature {
  label: string;
  included: boolean;
}

export interface PlanLimits {
  maxPatients: number;
  exportPdfPerWeek: number;
  features: {
    kanban: boolean;
    calendar: boolean;
    liveSupport: boolean;
  };
}

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  description: string;
  priceCents: number;
  currency: "PEN";
  ctaLabel: string;
  recommended?: boolean;
  features: PlanFeature[];
  limits: PlanLimits;
}
