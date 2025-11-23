import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatMenuModule } from "@angular/material/menu";
import { CustomizerSettingsService } from "../../../../../core/customizer-settings/customizer-settings.service";
import type { Plan } from "../../../domain/models";
import { BillingFacade } from "../../../data-access/facades/billing.facade";

@Component({
  selector: "app-pricing-page",
  imports: [MatCardModule, MatButtonModule, MatMenuModule],
  templateUrl: "./pricing-page.component.html",
  styleUrl: "./pricing-page.component.scss",
})
export class PricingPageComponent {
  readonly themeService = inject(CustomizerSettingsService);
  private readonly billingFacade = inject(BillingFacade);

  readonly plans = this.billingFacade.plans;
  readonly commons = this.billingFacade.commonBenefits;
  readonly selectedPlanId = this.billingFacade.selectedPlanId;
  readonly priceLabel = this.billingFacade.formatPrice;
  readonly trackById = this.billingFacade.trackById;

  getFeatures = (plan: Plan) => plan.features ?? [];

  onSubscribe(plan: Plan): void {
    this.billingFacade.selectPlan(plan.id);
    void this.billingFacade.startCheckout(plan.id);
  }
}
