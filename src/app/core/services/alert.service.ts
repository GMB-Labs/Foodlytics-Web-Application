import { Injectable, signal, computed } from "@angular/core";

export type AlertType = "success" | "danger" | "warning" | "info" | "primary" | "secondary" | "daxa";

export interface AlertOptions {
  autoClose?: boolean;
  duration?: number; // en milisegundos
  dismissible?: boolean;
}

export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  options: Required<AlertOptions>;
  createdAt: number;
}

@Injectable({ providedIn: "root" })
export class AlertService {
  private readonly _alerts = signal<Alert[]>([]);
  readonly alerts = this._alerts.asReadonly();

  readonly hasAlerts = computed(() => this._alerts().length > 0);

  private defaultOptions: Required<AlertOptions> = {
    autoClose: true,
    duration: 5000,
    dismissible: true,
  };

  private generateId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private show(type: AlertType, message: string, options?: AlertOptions): string {
    const alertOptions: Required<AlertOptions> = {
      ...this.defaultOptions,
      ...options,
    };

    const alert: Alert = {
      id: this.generateId(),
      type,
      message,
      options: alertOptions,
      createdAt: Date.now(),
    };

    this._alerts.update((alerts) => [...alerts, alert]);

    if (alertOptions.autoClose) {
      setTimeout(() => {
        this.dismiss(alert.id);
      }, alertOptions.duration);
    }

    return alert.id;
  }

  success(message: string, options?: AlertOptions): string {
    return this.show("success", message, options);
  }

  error(message: string, options?: AlertOptions): string {
    return this.show("danger", message, options);
  }

  warning(message: string, options?: AlertOptions): string {
    return this.show("warning", message, options);
  }

  info(message: string, options?: AlertOptions): string {
    return this.show("info", message, options);
  }

  primary(message: string, options?: AlertOptions): string {
    return this.show("primary", message, options);
  }

  secondary(message: string, options?: AlertOptions): string {
    return this.show("secondary", message, options);
  }

  daxa(message: string, options?: AlertOptions): string {
    return this.show("daxa", message, options);
  }

  dismiss(id: string): void {
    this._alerts.update((alerts) => alerts.filter((alert) => alert.id !== id));
  }

  dismissAll(): void {
    this._alerts.set([]);
  }
}
