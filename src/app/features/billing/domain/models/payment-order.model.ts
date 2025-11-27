import type { PlanId } from "./plan.model";

export interface BillingOrderMetadata {
  plan_id: PlanId;
  plan_name: string;
  plan_price_cents: number;
  user_id?: string | null;
  user_email?: string;
  source?: string;
  [key: string]: unknown;
}

export interface BillingClientDetails {
  first_name?: string;
  last_name?: string;
  email: string;
  phone_number?: string;
}

export interface CreatePaymentOrderRequest {
  amount: number;
  currency_code: "PEN";
  description: string;
  order_number: string;
  expiration_date: string;
  client_details: BillingClientDetails;
  confirm: boolean;
  metadata: BillingOrderMetadata;
}

export interface PaymentOrderResponse {
  id: string;
  amount: number;
  currency_code: string;
  description?: string;
  order_number?: string;
  state?: string;
  metadata?: BillingOrderMetadata;
  qr?: string;
  payment_code?: string;
  url_pe?: string;
  [key: string]: unknown;
}

