import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";
import type {
  CreatePaymentOrderRequest,
  PaymentOrderResponse,
} from "../../domain/models";

@Injectable({ providedIn: "root" })
export class BillingPaymentsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/payments`;

  createPaymentOrder(
    request: CreatePaymentOrderRequest,
  ): Observable<PaymentOrderResponse> {
    return this.http.post<PaymentOrderResponse>(
      `${this.apiUrl}/orders`,
      request,
    );
  }
}
