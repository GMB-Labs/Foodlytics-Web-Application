import {
  Component,
  OnInit,
  effect,
  inject,
  computed,
  signal,
} from "@angular/core";
import { ChangeDetectionStrategy } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { firstValueFrom } from "rxjs";
import { PhysicalActivityApiService } from "../../../../../data-access/api/physical-activity.api";
import { UserStore } from "../../../../../../../core/user/user.store";
import { LoggerService } from "../../../../../../../core/logger/logger.service";

@Component({
  selector: "app-avg-exercise-time",
  imports: [MatCardModule],
  templateUrl: "./avg-exercise-time.component.html",
  styleUrl: "./avg-exercise-time.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvgExerciseTimeComponent implements OnInit {
  private readonly api = inject(PhysicalActivityApiService);
  private readonly userStore = inject(UserStore);
  private readonly logger = inject(LoggerService);

  // Signals para el estado del componente
  readonly stepsToday = signal<number>(0);
  readonly isLoading = signal<boolean>(false);

  // Computed para el userId
  readonly userId = computed(() => this.userStore.userId());

  // Computed para formatear los pasos con separador de miles
  readonly formattedSteps = computed(() => {
    const steps = this.stepsToday();
    return steps.toLocaleString("es-ES");
  });

  constructor() {
    // Effect para cargar los pasos cuando haya userId
    effect(() => {
      const userId = this.userId();
      if (userId) {
        this.loadDailySteps(userId);
      } else {
        this.stepsToday.set(0);
        this.isLoading.set(false);
      }
    });
  }

  ngOnInit(): void {
    // El effect manejará la carga automáticamente
  }

  private async loadDailySteps(userId: string): Promise<void> {
    this.isLoading.set(true);

    try {
      // Obtener la fecha de hoy en formato YYYY-MM-DD
      const today = this.getTodayDateString();

      const response = await firstValueFrom(
        this.api.getDailySteps(userId, today),
      );

      if (response && response.step_activity_count !== undefined) {
        this.stepsToday.set(response.step_activity_count);
      } else {
        this.stepsToday.set(0);
      }
    } catch (error) {
      this.logger.warn(
        "[AvgExerciseTimeComponent] Error loading daily steps",
        error,
      );
      // En caso de error, mostrar 0 sin romper el layout
      this.stepsToday.set(0);
    } finally {
      this.isLoading.set(false);
    }
  }

  private getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}
