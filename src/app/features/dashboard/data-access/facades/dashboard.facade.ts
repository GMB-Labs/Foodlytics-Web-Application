import { Injectable, inject, signal, computed } from "@angular/core";
import { LoggerService } from "../../../../core/logger/logger.service";

/**
 * Dashboard Facade
 * Punto de entrada único para toda la lógica del dashboard.
 */
@Injectable({ providedIn: "root" })
export class DashboardFacade {
  private readonly logger = inject(LoggerService);
  
  // TODO: Implementar estado y métodos según necesidades del dashboard
  // Ejemplo: stats, overview, widgets data, etc.
  
  private readonly loadingSignal = signal(false);
  readonly loading = computed(() => this.loadingSignal());
}

