import { Injectable, PLATFORM_ID, inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { environment } from "../../../../../environments/environment";

export interface CulqiPaymentToken {
  id: string;
  email?: string;
  card_number?: string;
  [key: string]: unknown;
}

export interface CulqiAlternativeOrder {
  id: string;
  payment_code?: string;
  qr?: string;
  url_pe?: string;
  [key: string]: unknown;
}

export type CulqiCheckoutResult =
  | { type: "token"; payload: CulqiPaymentToken }
  | { type: "order"; payload: CulqiAlternativeOrder }
  | { type: "error"; error: unknown };

interface CulqiCheckoutParams {
  amount: number;
  orderId: string;
  email: string;
  currency?: "PEN";
  onAction: (result: CulqiCheckoutResult) => void;
}

interface CulqiGlobal {
  token?: CulqiPaymentToken;
  order?: CulqiAlternativeOrder;
  error?: unknown;
  culqi?: () => void;
  close?: () => void;
}

interface CulqiWindow extends Window {
  CulqiCheckout?: CulqiCheckoutConstructor;
  Culqi?: CulqiGlobal;
}

type CulqiCheckoutConstructor = new (
  publicKey: string,
  options: CulqiCheckoutOptions,
) => { open(): void };

interface CulqiCheckoutOptions {
  settings: {
    title: string;
    currency: "PEN";
    amount: number;
    order?: string;
    xculqirsaid: string;
    rsapublickey: string;
  };
  client: {
    email: string;
  };
  options: {
    lang: "auto" | "es";
    installments: boolean;
    modal: boolean;
    paymentMethods: {
      tarjeta: boolean;
      yape?: boolean;
      billetera?: boolean;
      bancaMovil?: boolean;
      agente?: boolean;
      cuotealo?: boolean;
    };
    paymentMethodsSort: string[];
  };
  appearance: {
    theme: string;
    menuType: "sidebar" | "sliderTop" | "select";
    colors?: {
      primary?: string;
      buttonText?: string;
    };
  };
}

interface PendingCheckoutHandlers {
  onAction: (result: CulqiCheckoutResult) => void;
}

@Injectable({ providedIn: "root" })
export class CulqiCheckoutService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private scriptLoadingPromise: Promise<void> | null = null;
  private pendingHandlers: PendingCheckoutHandlers | null = null;

  async openCheckout(params: CulqiCheckoutParams): Promise<void> {
    if (!this.isBrowser) {
      throw new Error("Culqi checkout solo está disponible en el navegador.");
    }

    await this.ensureScriptLoaded();

    const culqiWindow = window as CulqiWindow;
    const CulqiCheckoutCtor = culqiWindow.CulqiCheckout;

    if (!CulqiCheckoutCtor) {
      throw new Error("CulqiCheckout SDK no disponible.");
    }

    this.pendingHandlers = {
      onAction: params.onAction,
    };

    culqiWindow.Culqi = culqiWindow.Culqi ?? {};
    culqiWindow.Culqi.culqi = () => this.handleCheckoutResult();

    const paymentMethods: CulqiCheckoutOptions["options"]["paymentMethods"] = {
      tarjeta: true,
      yape: true,
      billetera: true,
      bancaMovil: true,
      agente: true,
      cuotealo: true,
    };

    const checkout = new CulqiCheckoutCtor(environment.culqiPublicKey, {
      settings: {
        title: "Foodlytics",
        currency: params.currency ?? "PEN",
        amount: params.amount,
        order: params.orderId,
        xculqirsaid: environment.culqiRsaId,
        rsapublickey: environment.culqiRsaPublicKey,
      },
      client: {
        email: params.email,
      },
      options: {
        lang: "auto",
        installments: true,
        modal: true,
        paymentMethods,
        paymentMethodsSort: Object.keys(paymentMethods),
      },
      appearance: {
        theme: "default",
        menuType: "sidebar",
        colors: {
          primary: "#1d4ed8",
          buttonText: "#ffffff",
        },
      },
    });

    checkout.open();
  }

  private handleCheckoutResult(): void {
    if (!this.pendingHandlers) return;

    const culqiGlobal = (window as CulqiWindow).Culqi;
    if (!culqiGlobal) return;

    try {
      if (culqiGlobal.token) {
        culqiGlobal.close?.();
        this.pendingHandlers.onAction({
          type: "token",
          payload: culqiGlobal.token,
        });
        return;
      } else if (culqiGlobal.order) {
        culqiGlobal.close?.();
        this.pendingHandlers.onAction({
          type: "order",
          payload: culqiGlobal.order,
        });
        return;
      } else if (culqiGlobal.error) {
        culqiGlobal.close?.();
        this.pendingHandlers.onAction({
          type: "error",
          error: culqiGlobal.error,
        });
        return;
      } else {
        this.pendingHandlers.onAction({
          type: "error",
          error: new Error("No se recibió token ni orden desde Culqi."),
        });
      }
    } finally {
      this.pendingHandlers = null;
    }
  }

  private ensureScriptLoaded(): Promise<void> {
    if (!this.isBrowser) {
      return Promise.reject(
        new Error("El SDK de Culqi solo se carga en el navegador."),
      );
    }

    if (this.scriptLoadingPromise) return this.scriptLoadingPromise;

    const culqiWindow = window as CulqiWindow;
    if (typeof culqiWindow.CulqiCheckout !== "undefined") {
      this.scriptLoadingPromise = Promise.resolve();
      return this.scriptLoadingPromise;
    }

    this.scriptLoadingPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://js.culqi.com/checkout-js";
      script.async = true;

      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("No se pudo cargar el SDK de Culqi."));

      document.body.appendChild(script);
    });

    return this.scriptLoadingPromise;
  }
}