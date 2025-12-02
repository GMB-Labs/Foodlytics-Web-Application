import {
  Component,
  ViewChild,
  AfterViewInit,
  OnInit,
  DestroyRef,
  inject,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterLink } from "@angular/router";
import { CustomizerSettingsService } from "../../../../../core/customizer-settings/customizer-settings.service";
import { PatientsApiService } from "../../../../patients/data-access/api/patients.api";
import { PatientPictureApiService } from "../../../../patients/data-access/api/patient-picture.api";
import { UserStore } from "../../../../../core/user/user.store";
import { LoggerService } from "../../../../../core/logger/logger.service";
import { Patient } from "../../../../patients/domain/models";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize, take } from "rxjs/operators";

@Component({
  selector: "app-patients-list",
  imports: [
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    RouterLink,
  ],
  templateUrl: "./patients-list.component.html",
  styleUrl: "./patients-list.component.scss",
})
export class PatientsListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    "photo",
    "fullName",
    "age",
    "height",
    "weight",
    "gender",
    "goal",
    "status",
    "action",
  ];
  dataSource = new MatTableDataSource<PatientTableItem>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly themeService = inject(CustomizerSettingsService);
  private readonly patientsApi = inject(PatientsApiService);
  private readonly patientPictureApi = inject(PatientPictureApiService);
  private readonly userStore = inject(UserStore);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  isLoadingPatients = false;

  private readonly fallbackAvatars: string[] = [
    "assets/images/users/user1.webp",
  ];

  ngOnInit(): void {
    this.loadPatients();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  private loadPatients(): void {
    const userId = this.userStore.userId();
    if (!userId) {
      this.logger.error(
        "[PatientsListComponent] Missing nutritionist user id when loading patients",
      );
      return;
    }

    this.isLoadingPatients = true;
    this.patientsApi
      .getPatientsByNutritionist(userId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isLoadingPatients = false;
        }),
      )
      .subscribe({
        next: (patients) => {
          this.updateTableData(patients ?? []);
        },
        error: (error) => {
          this.logger.error(
            "[PatientsListComponent] Error loading patients",
            error,
          );
        },
      });
  }

  private updateTableData(patients: Patient[]): void {
    const mapped = patients.map((patient) => this.mapPatientToRow(patient));
    this.dataSource.data = mapped;
    this.loadProfilePictures(mapped);
  }

  private mapPatientToRow(patient: Patient): PatientTableItem {
    return {
      ...patient,
      fullNameDisplay: this.buildFullName(
        patient.first_name,
        patient.last_name,
      ),
      avatarUrl: this.resolveAvatarUrl(patient),
      genderLabel: this.getGenderLabel(patient.gender),
      goalTypeLabel: this.getGoalTypeLabel(patient.goal_type),
      status: patient.user_profile_completed
        ? { completed: "Completed" }
        : { incomplete: "Incomplete" },
      action: {
        view: "visibility",
        delete: "delete",
      },
    };
  }

  private loadProfilePictures(rows: PatientTableItem[]): void {
    rows.forEach((row) => {
      if (!row.has_profile_picture) {
        return;
      }

      this.patientPictureApi
        .getProfilePicture(row.user_id)
        .pipe(take(1), takeUntilDestroyed(this.destroyRef))
        .subscribe((pictureUrl) => {
          if (!pictureUrl) {
            return;
          }

          row.avatarUrl = pictureUrl;
          this.refreshRenderedRows();
        });
    });
  }

  private refreshRenderedRows(): void {
    this.dataSource.data = [...this.dataSource.data];
  }

  private buildFullName(
    firstName?: string | null,
    lastName?: string | null,
  ): string {
    const parts = [firstName, lastName]
      .map((value) => (value ?? "").trim())
      .filter((value) => !!value);
    return parts.length ? parts.join(" ") : "Unnamed Patient";
  }

  private resolveAvatarUrl(patient: Patient): string {
    const fallbackIndex =
      Math.abs(this.hashString(patient.user_id ?? "")) %
      this.fallbackAvatars.length;
    return this.fallbackAvatars[fallbackIndex];
  }

  private hashString(value: string): number {
    if (!value) return 0;
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  private getGenderLabel(gender?: Patient["gender"] | null): string {
    switch (gender) {
      case "male":
        return "Male";
      case "female":
        return "Female";
      case "other":
      default:
        return "Other";
    }
  }

  private getGoalTypeLabel(goal?: Patient["goal_type"] | null): string | null {
    switch (goal) {
      case "definition":
        return "Definition";
      case "maintenance":
        return "Maintenance";
      case "bulking":
        return "Bulking";
      default:
        return null;
    }
  }

  onDeletePatient(row: PatientTableItem): void {
    this.logger.log(
      "[PatientsListComponent] Delete patient requested",
      row.user_id,
    );
  }
}

interface PatientTableItem extends Patient {
  fullNameDisplay: string;
  avatarUrl: string;
  genderLabel: string;
  goalTypeLabel: string | null;
  status: {
    completed?: string;
    incomplete?: string;
  };
  action: {
    view: string;
    delete: string;
  };
}
