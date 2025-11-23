import { Injectable, computed, signal } from "@angular/core";
import type { Plan, PlanId } from "../../domain/models";

@Injectable({ providedIn: "root" })
export class BillingPlansService {
  private readonly plansData = signal<readonly Plan[]>([
    {
      id: "starter",
      name: "Starter",
      tagline: "Empieza gratis y valida tu flujo",
      description: "Activa Foodlytics con tus primeros pacientes.",
      priceCents: 0,
      currency: "PEN",
      ctaLabel: "Empezar ahora",
      features: [
        { label: "Hasta 5 pacientes", included: true },
        { label: "Soporte por correo", included: true },
        { label: "Exportar PDF (1 semanal)", included: true },
      ],
      limits: {
        maxPatients: 5,
        exportPdfPerWeek: 1,
        features: { kanban: false, calendar: false, liveSupport: false },
      },
    },
    {
      id: "advanced",
      name: "Advanced",
      tagline: "Productividad para tu día a día",
      description: "Automatiza tareas clave y escala sin fricción.",
      priceCents: 2990,
      currency: "PEN",
      ctaLabel: "Suscribirme",
      features: [
        { label: "Hasta 25 pacientes", included: true },
        { label: "Exportar PDF ilimitados", included: true },
        { label: "Kanban board", included: true },
        { label: "Calendar con alertas", included: true },
        { label: "Soporte en vivo", included: true },
      ],
      limits: {
        maxPatients: 25,
        exportPdfPerWeek: Infinity,
        features: { kanban: true, calendar: true, liveSupport: true },
      },
      recommended: true,
    },
    {
      id: "professional_plus",
      name: "Professional+",
      tagline: "Escala con más pacientes y control",
      description: "Control total y soporte prioritario.",
      priceCents: 4990,
      currency: "PEN",
      ctaLabel: "Suscribirme",
      features: [
        { label: "Hasta 100 pacientes", included: true },
        { label: "Exportar PDF ilimitados", included: true },
        { label: "Kanban board", included: true },
        { label: "Calendar con alertas", included: true },
        { label: "Soporte en vivo", included: true },
      ],
      limits: {
        maxPatients: 100,
        exportPdfPerWeek: Infinity,
        features: { kanban: true, calendar: true, liveSupport: true },
      },
    },
  ] as const);

  readonly plans = computed(() => this.plansData());

  readonly commonBenefits = [
    "Conexión con pacientes vía app móvil",
    "Acceso completo al dashboard",
    "Detalles completos del paciente",
  ] as const;

  getPlanById(id: PlanId): Plan | undefined {
    return this.plans().find((plan) => plan.id === id);
  }

  formatPrice(cents: number): string {
    return (cents / 100).toLocaleString("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    });
  }

  trackById = (_: number, plan: Plan) => plan.id;
}
