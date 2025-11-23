import { Injectable, PLATFORM_ID, inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import type { Plan } from "../../domain/models";
import { environment } from "../../../../../environments/environment";

interface CulqiGlobal {
  token?: { id: string };
  order?: unknown;
  error?: unknown;
  culqi?: () => void;
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
  };
}

interface PendingCheckoutHandlers {
  onTokenReceived: (tokenId: string) => void;
  onError?: (error: unknown) => void;
}

@Injectable({ providedIn: "root" })
export class CulqiCheckoutService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private scriptLoadingPromise: Promise<void> | null = null;
  private pendingHandlers: PendingCheckoutHandlers | null = null;

  async openCheckout(params: {
    plan: Plan;
    email: string;
    onTokenReceived: (tokenId: string) => void;
    onError?: (error: unknown) => void;
    // TODO backend: orderId generado con la API de orders de Culqi
    orderId?: string;
  }): Promise<void> {
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
      onTokenReceived: params.onTokenReceived,
      onError: params.onError,
    };

    culqiWindow.Culqi = culqiWindow.Culqi ?? {};
    culqiWindow.Culqi.culqi = () => this.handleCheckoutResult();

    const checkout = new CulqiCheckoutCtor(environment.culqiPublicKey, {
      settings: {
        title: `Suscripción ${params.plan.name}`,
        currency: "PEN",
        amount: params.plan.priceCents,
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
        paymentMethods: {
          tarjeta: true,
          yape: true,
          billetera: true,
        },
        paymentMethodsSort: ["tarjeta", "yape", "billetera"],
      },
      appearance: {
        theme: "default",
        menuType: "sidebar",
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
        this.pendingHandlers.onTokenReceived(culqiGlobal.token.id);
      } else if (culqiGlobal.order) {
        this.pendingHandlers.onTokenReceived(
          (culqiGlobal.order as { id?: string })?.id ?? "",
        );
      } else if (culqiGlobal.error) {
        this.pendingHandlers.onError?.(culqiGlobal.error);
      } else {
        this.pendingHandlers.onError?.(
          new Error("No se recibió token ni orden desde Culqi."),
        );
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