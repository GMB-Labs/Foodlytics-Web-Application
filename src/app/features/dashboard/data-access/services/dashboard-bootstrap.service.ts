import { Injectable, inject, effect } from "@angular/core";
import { AuthFacade } from "../../../../core/auth/auth.facade";
import { UserStore } from "../../../../core/user/user.store";
import { CalendarService } from "../../../calendar/data-access/services/calendar.service";
import { LoggerService } from "../../../../core/logger/logger.service";

/**
 * Servicio que coordina la carga inicial de datos del dashboard
 * cuando el usuario queda autenticado.
 * 
 * Observa el estado de autenticación y el userId, y dispara las cargas
 * necesarias cuando ambos están disponibles.
 */
@Injectable({ providedIn: "root" })
export class DashboardBootstrapService {
  private readonly authFacade = inject(AuthFacade);
  private readonly userStore = inject(UserStore);
  private readonly calendarService = inject(CalendarService);
  private readonly logger = inject(LoggerService);

  private hasBootstrapped = false;
  private lastBootstrappedUserId: string | null = null;

  constructor() {
    // Effect que observa cambios en autenticación y userId
    effect(() => {
      const isAuthenticated = this.authFacade.isAuthenticated();
      const isLoading = this.authFacade.isLoading();
      const userId = this.userStore.userId();

      // Esperar a que Auth0 termine de cargar
      if (isLoading) {
        return;
      }

      // Solo proceder si el usuario está autenticado y tiene userId
      if (!isAuthenticated || !userId) {
        // Resetear el flag si el usuario se desautenticó
        if (!isAuthenticated) {
          this.hasBootstrapped = false;
          this.lastBootstrappedUserId = null;
        }
        return;
      }

      // Si ya se hizo bootstrap para este userId, no hacer nada
      if (this.hasBootstrapped && this.lastBootstrappedUserId === userId) {
        return;
      }

      // Disparar bootstrap
      this.bootstrap(userId);
    });
  }

  /**
   * Dispara la carga de datos del dashboard.
   * Este método se llama automáticamente cuando el usuario queda autenticado.
   */
  private bootstrap(userId: string): void {
    this.logger.log(
      "[DashboardBootstrapService] Bootstrap iniciado para userId:",
      userId,
    );

    this.hasBootstrapped = true;
    this.lastBootstrappedUserId = userId;

    // Cargar eventos del calendario
    // El CalendarService tiene su propia lógica de cache, así que es seguro llamarlo
    this.calendarService.loadEvents({ force: false }).subscribe({
      next: () => {
        this.logger.log(
          "[DashboardBootstrapService] Eventos del calendario cargados",
        );
      },
      error: (error) => {
        this.logger.error(
          "[DashboardBootstrapService] Error cargando eventos del calendario",
          error,
        );
      },
    });

    // Nota: Los componentes de pacientes y kanban se cargan automáticamente
    // cuando detectan cambios en userId gracias a los effects que agregaremos.
  }

  /**
   * Fuerza un re-bootstrap (útil para testing o casos especiales).
   */
  forceBootstrap(): void {
    const userId = this.userStore.userId();
    if (userId) {
      this.hasBootstrapped = false;
      this.bootstrap(userId);
    }
  }
}

