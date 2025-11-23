import { Injectable, inject, signal, computed } from "@angular/core";
import { LoggerService } from "../../../../core/logger/logger.service";
import type { Patient, NutritionStats } from "../../domain/models";

/**
 * Patients Facade
 * Punto de entrada único para toda la lógica de pacientes.
 */
@Injectable({ providedIn: "root" })
export class PatientsFacade {
  private readonly logger = inject(LoggerService);
  
  // State
  private readonly patientsSignal = signal<Patient[]>([]);
  private readonly selectedPatientSignal = signal<Patient | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  // Selectors
  readonly patients = computed(() => this.patientsSignal());
  readonly selectedPatient = computed(() => this.selectedPatientSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());

  // Actions
  selectPatient(patient: Patient): void {
    this.logger.log("[PatientsFacade] Patient selected:", patient.id);
    this.selectedPatientSignal.set(patient);
  }

  clearSelection(): void {
    this.selectedPatientSignal.set(null);
  }

  // TODO: Implementar métodos para:
  // - loadPatients()
  // - createPatient()
  // - updatePatient()
  // - deletePatient()
  // - getNutritionStats()
}

