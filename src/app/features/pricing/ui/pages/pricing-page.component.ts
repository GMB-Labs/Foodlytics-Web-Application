import {Component, inject} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { CustomizerSettingsService } from '../../../../core/customizer-settings/customizer-settings.service';
import type {Plan, PlanFeature} from "../../data-access/plans.model";
import {PlansService} from "../../data-access/plans.service";

@Component({
    selector: 'app-pricing-page',
    imports: [MatCardModule, MatButtonModule, MatMenuModule],
    templateUrl: './pricing-page.component.html',
    styleUrl: './pricing-page.component.scss'
})
export class PricingPageComponent {

    themeService = inject(CustomizerSettingsService);
    private readonly plansSvc = inject(PlansService);

    plans = this.plansSvc.plans;
    commons = this.plansSvc.commonBullets;
    priceLabel = this.plansSvc.formatPrice.bind(this.plansSvc);

    trackById = this.plansSvc.trackById;
    readonly INF = Infinity;
    getFeatures = (p: Plan): PlanFeature[] => p.features ?? [];

    selectPlan(plan: Plan) {
        console.log('[pricing] plan seleccionado:', plan.id);
    }
}