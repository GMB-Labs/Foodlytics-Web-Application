import { Injectable, computed, signal, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import type { Plan, PlanId } from "../../domain/models";
import { BillingPlansService } from "../services/billing-plans.service";
import { CulqiCheckoutService } from "../services/culqi-checkout.service";
import { BillingPaymentsApiService } from "../api/billing-payments.api";
import { AuthFacade } from "../../../../core/auth/auth.facade";
import { LoggerService } from "../../../../core/logger/logger.service";

type CheckoutStatus = "idle" | "processing" | "success" | "error";

@Injectable({ providedIn: "root" })
export class BillingFacade {
  private readonly plansService = inject(BillingPlansService);
  private readonly culqiCheckout = inject(CulqiCheckoutService);
  private readonly paymentsApi = inject(BillingPaymentsApiService);
  private readonly authFacade = inject(AuthFacade);
  private readonly logger = inject(LoggerService);

  private readonly selectedPlanIdSig = signal<PlanId | null>(null);
  private readonly checkoutStatusSig = signal<CheckoutStatus>("idle");
  private readonly checkoutErrorSig = signal<string | null>(null);

  readonly plans = this.plansService.plans;
  readonly commonBenefits = this.plansService.commonBenefits;
  readonly selectedPlanId = computed(() => this.selectedPlanIdSig());
  readonly checkoutStatus = computed(() => this.checkoutStatusSig());
  readonly checkoutError = computed(() => this.checkoutErrorSig());

  readonly formatPrice = this.plansService.formatPrice.bind(this.plansService);
  readonly trackById = this.plansService.trackById;

  selectPlan(planId: PlanId): void {
    this.selectedPlanIdSig.set(planId);
  }

  async startCheckout(planId?: PlanId, email?: string): Promise<void> {
    const plan = this.resolvePlan(planId);
    if (!plan) {
      this.checkoutStatusSig.set("error");
      this.checkoutErrorSig.set("Selecciona un plan válido.");
      return;
    }

    const emailToUse = email || this.authFacade.email();
    if (!emailToUse) {
      this.checkoutStatusSig.set("error");
      this.checkoutErrorSig.set(
        "Necesitamos un correo electrónico para continuar con el pago.",
      );
      return;
    }

    this.checkoutStatusSig.set("processing");
    this.checkoutErrorSig.set(null);

    try {
      await this.culqiCheckout.openCheckout({
        plan,
        email: emailToUse,
        onTokenReceived: (tokenId) => {
          this.logger.log("[billing] Token recibido desde Culqi", { tokenId });
          void this.handleToken(plan.id, tokenId);
        },
        onError: (error) => {
          this.logger.error("[billing] Error desde Culqi", error);
          this.checkoutStatusSig.set("error");
          this.checkoutErrorSig.set(this.stringifyError(error));
        },
      });
    } catch (error) {
      this.logger.error("[billing] No se pudo abrir Culqi", error);
      this.checkoutStatusSig.set("error");
      this.checkoutErrorSig.set(this.stringifyError(error));
    }
  }

  private resolvePlan(planId?: PlanId): Plan | undefined {
    const idToUse = planId ?? this.selectedPlanIdSig();
    return idToUse ? this.plansService.getPlanById(idToUse) : undefined;
  }

  private async handleToken(planId: PlanId, tokenId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.paymentsApi.createSubscription({ planId, tokenId }),
      );
      this.checkoutStatusSig.set("success");
    } catch (error) {
      this.logger.error("[billing] Error al crear la suscripción", error);
      this.checkoutStatusSig.set("error");
      this.checkoutErrorSig.set(this.stringifyError(error));
    }
  }

  private stringifyError(error: unknown): string {
    if (!error) return "Ocurrió un error inesperado.";
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    try {
      return JSON.stringify(error);
    } catch {
      return "Ocurrió un error inesperado.";
    }
  }
}
