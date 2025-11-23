import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";
import type { PlanId } from "../../domain/models";

@Injectable({ providedIn: "root" })
export class BillingPaymentsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/billing`;

  createSubscription(request: {
    planId: PlanId;
    tokenId: string;
  }): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/subscriptions`, request);
  }
}
