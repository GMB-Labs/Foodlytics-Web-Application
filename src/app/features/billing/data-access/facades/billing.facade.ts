import { Injectable, computed, signal, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import type {
  BillingClientDetails,
  CreatePaymentOrderRequest,
  Plan,
  PlanId,
  PaymentOrderResponse,
} from "../../domain/models";
import { BillingPlansService } from "../services/billing-plans.service";
import {
  CulqiCheckoutResult,
  CulqiCheckoutService,
} from "../services/culqi-checkout.service";
import { BillingPaymentsApiService } from "../api/billing-payments.api";
import { AuthFacade } from "../../../../core/auth/auth.facade";
import { LoggerService } from "../../../../core/logger/logger.service";
import { UserProfile, UserStore } from "../../../../core/user/user.store";

type CheckoutStatus = "idle" | "processing" | "success" | "error";

@Injectable({ providedIn: "root" })
export class BillingFacade {
  private static readonly DEFAULT_PHONE_NUMBER = "999999999";
  private static readonly EXPIRATION_OFFSET_SECONDS = 24 * 60 * 60;

  private readonly plansService = inject(BillingPlansService);
  private readonly culqiCheckout = inject(CulqiCheckoutService);
  private readonly paymentsApi = inject(BillingPaymentsApiService);
  private readonly authFacade = inject(AuthFacade);
  private readonly logger = inject(LoggerService);
  private readonly userStore = inject(UserStore);

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

    if (plan.id === "starter") {
      this.logger.log(
        "[billing] Plan Starter seleccionado, no se requiere pago.",
      );
      this.checkoutStatusSig.set("success");
      this.checkoutErrorSig.set(null);
      return;
    }

    this.checkoutStatusSig.set("processing");
    this.checkoutErrorSig.set(null);

    try {
      const orderPayload = this.buildPaymentOrderPayload(plan, emailToUse);
      const order = await firstValueFrom(
        this.paymentsApi.createPaymentOrder(orderPayload),
      );

      if (!order?.id) {
        throw new Error("La orden no devolvió un identificador válido.");
      }

      const amountToCharge =
        typeof order.amount === "number" ? order.amount : plan.priceCents;

      await this.culqiCheckout.openCheckout({
        amount: amountToCharge,
        orderId: order.id,
        email: emailToUse,
        currency: plan.currency,
        onAction: (result) => this.handleCulqiAction(plan, order, result),
      });
    } catch (error) {
      this.logger.error("[billing] No se pudo iniciar el checkout", error);
      this.checkoutStatusSig.set("error");
      this.checkoutErrorSig.set(this.stringifyError(error));
    }
  }

  private resolvePlan(planId?: PlanId): Plan | undefined {
    const idToUse = planId ?? this.selectedPlanIdSig();
    return idToUse ? this.plansService.getPlanById(idToUse) : undefined;
  }

  private buildPaymentOrderPayload(
    plan: Plan,
    email: string,
  ): CreatePaymentOrderRequest {
    return {
      amount: plan.priceCents,
      currency_code: plan.currency,
      description: this.buildPlanDescription(plan),
      order_number: this.buildOrderNumber(plan.id),
      expiration_date: this.buildExpirationDate(),
      client_details: this.buildClientDetails(email),
      confirm: false,
      metadata: {
        plan_id: plan.id,
        plan_name: plan.name,
        plan_price_cents: plan.priceCents,
        user_id: this.userStore.userId(),
        user_email: email,
        source: "subscriptions_screen",
      },
    };
  }

  private buildPlanDescription(plan: Plan): string {
    return `Plan ${plan.name} - Foodlytics`;
  }

  private buildOrderNumber(planId: PlanId): string {
    const planSegment = planId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 3);
    const timestampSegment = Date.now().toString(36).toUpperCase();
    const randomSegment = Math.random().toString(36).substring(2, 6).toUpperCase();
    const raw = `FL${planSegment}${timestampSegment}${randomSegment}`;
    const sanitized = raw.replace(/[^A-Z0-9]/g, "");
    const padded = (sanitized + timestampSegment).slice(0, 16);
    return padded.length >= 8 ? padded : (padded + "FLX2024").slice(0, 16);
  }

  private buildExpirationDate(): string {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const expiresAtSeconds =
      nowSeconds + BillingFacade.EXPIRATION_OFFSET_SECONDS;

    if (expiresAtSeconds <= nowSeconds) {
      throw new Error(
        "No se pudo calcular una fecha de expiración válida para el pago.",
      );
    }

    return expiresAtSeconds.toString();
  }

  private buildClientDetails(email: string): BillingClientDetails {
    const profile = this.getProfile();
    const phoneNumber = this.resolvePhoneNumber(profile);
    const details: BillingClientDetails = {
      email,
      phone_number: phoneNumber,
    };

    if (!profile) {
      return details;
    }

    if (profile.first_name) {
      details.first_name = profile.first_name;
    }
    if (profile.last_name) {
      details.last_name = profile.last_name;
    }

    return details;
  }

  private handleCulqiAction(
    plan: Plan,
    order: PaymentOrderResponse,
    result: CulqiCheckoutResult,
  ): void {
    if (result.type === "token") {
      this.logger.log("[billing] Token generado para orden", {
        planId: plan.id,
        orderId: order.id,
        tokenId: result.payload.id,
      });
      this.checkoutStatusSig.set("success");
      this.checkoutErrorSig.set(null);
      return;
    }

    if (result.type === "order") {
      this.logger.log("[billing] Orden alternativa generada", {
        planId: plan.id,
        orderId: order.id,
        payment_code: result.payload.payment_code,
        qr: result.payload.qr,
        url_pe: result.payload.url_pe,
      });
      this.checkoutStatusSig.set("success");
      this.checkoutErrorSig.set(null);
      return;
    }

    this.logger.error("[billing] Error desde Culqi", result.error);
    this.checkoutStatusSig.set("error");
    this.checkoutErrorSig.set(this.stringifyError(result.error));
  }

  private getProfile(): UserProfile | null {
    const profile = this.userStore.profile();
    if (!profile || typeof profile !== "object") {
      return null;
    }
    return profile as UserProfile;
  }

  private resolvePhoneNumber(profile: UserProfile | null): string {
    if (!profile || !profile.phone_number) {
      return BillingFacade.DEFAULT_PHONE_NUMBER;
    }

    const sanitized = this.normalizePhoneNumber(profile.phone_number);
    if (!sanitized) {
      throw new Error(
        "Tu número de teléfono es inválido. Debe tener solo dígitos y entre 6 y 15 caracteres.",
      );
    }

    return sanitized;
  }

  private normalizePhoneNumber(value?: string | null): string | null {
    if (!value || typeof value !== "string") return null;
    const digitsOnly = value.replace(/\D/g, "");
    if (!digitsOnly) return null;
    if (digitsOnly.length < 6 || digitsOnly.length > 15) return null;
    return digitsOnly;
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
