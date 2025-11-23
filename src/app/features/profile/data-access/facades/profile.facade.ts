import { Injectable, inject, signal, computed } from "@angular/core";
import { LoggerService } from "../../../../core/logger/logger.service";
import { UserStore } from "../../../../core/user/user.store";

/**
 * Profile Facade
 * Punto de entrada único para toda la lógica del perfil de usuario.
 */
@Injectable({ providedIn: "root" })
export class ProfileFacade {
  private readonly logger = inject(LoggerService);
  private readonly userStore = inject(UserStore);
  
  // Exponer datos del user store
  readonly profile = this.userStore.profile;
  readonly userId = this.userStore.userId;
  readonly photoUrl = this.userStore.photoUrl;
  readonly isProfileCompleted = this.userStore.isProfileCompleted;
  
  // TODO: Implementar métodos para:
  // - updateProfile()
  // - uploadPhoto()
  // - getActivityStats()
}

