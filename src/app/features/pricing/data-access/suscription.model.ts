export type PlanId = 'starter' | 'advanced' | 'professional_plus';

export interface ActiveSubscription {
    planId: PlanId;
    currentPeriodEnd?: string;
}

export type CheckoutState =
    | { status: 'idle' }
    | { status: 'selecting'; planId: PlanId }
    | { status: 'paying'; planId: PlanId }
    | { status: 'success'; planId: PlanId; paymentId: string }
    | { status: 'error'; planId: PlanId; message: string };