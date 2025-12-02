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
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { RouterLink } from "@angular/router";
import { SelectionModel } from "@angular/cdk/collections";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatTooltipModule } from "@angular/material/tooltip";
import { CustomizerSettingsService } from "../../../../../core/customizer-settings/customizer-settings.service";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { PatientInviteCodeApiService } from "../../../data-access/api/patient-invite-code.api";
import { PatientsApiService } from "../../../data-access/api/patients.api";
import { PatientPictureApiService } from "../../../data-access/api/patient-picture.api";
import { InviteCodeDialogComponent } from "../../components/invite-code-dialog/invite-code-dialog.component";
import { UserStore } from "../../../../../core/user/user.store";
import { LoggerService } from "../../../../../core/logger/logger.service";
import { firstValueFrom } from "rxjs";
import { finalize, take } from "rxjs/operators";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Patient } from "../../../domain/models";

@Component({
  selector: "app-list",
  imports: [
    MatCardModule,
    MatMenuModule,
    MatButtonModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: "./patients-list.component.html",
  styleUrl: "./patients-list.component.scss",
})
export class PatientsListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    "select",
    "fullName",
    "age",
    "height",
    "weight",
    "gender",
    "goalType",
    "status",
    "action",
  ];
  dataSource = new MatTableDataSource<PatientTableItem>([]);
  selection = new SelectionModel<PatientTableItem>(true, []);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly themeService = inject(CustomizerSettingsService);
  private readonly inviteCodeApi = inject(PatientInviteCodeApiService);
  private readonly patientsApi = inject(PatientsApiService);
  private readonly patientPictureApi = inject(PatientPictureApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly userStore = inject(UserStore);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  isGeneratingInviteCode = false;
  isLoadingPatients = false;
  private currentFilterValue = "";

  ngOnInit(): void {
    this.dataSource.filterPredicate = this.createFilterPredicate();
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
      this.snackBar.open(
        "We couldn't find your user information. Please try again.",
        "Close",
        { duration: 5000 },
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
          this.snackBar.open(
            "We couldn't load your patients. Please try again.",
            "Close",
            { duration: 5000 },
          );
        },
      });
  }

  private updateTableData(patients: Patient[]): void {
    const mapped = patients.map((patient) => this.mapPatientToRow(patient));
    this.selection.clear();
    this.dataSource.data = mapped;
    this.reapplyFilter();
    this.loadProfilePictures(mapped);
  }

  private mapPatientToRow(patient: Patient): PatientTableItem {
    return {
      ...patient,
      fullNameDisplay: this.buildFullName(
        patient.first_name,
        patient.last_name,
      ),
      avatarUrl: null,
      avatarInitials: this.buildInitials(
        patient.first_name,
        patient.last_name,
      ),
      genderLabel: this.getGenderLabel(patient.gender),
      goalTypeLabel: this.getGoalTypeLabel(patient.goal_type),
      status: patient.user_profile_completed
        ? { active: "Active" }
        : { deactive: "Incomplete" },
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

          queueMicrotask(() => {
            row.avatarUrl = pictureUrl;
            this.refreshRenderedRows();
          });
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

  private buildInitials(
    firstName?: string | null,
    lastName?: string | null,
  ): string {
    const initials = [firstName, lastName]
      .map((value) => (value ?? "").trim())
      .filter(Boolean)
      .map((value) => value[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2);

    return initials || "P";
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

  private getGoalTypeLabel(goal?: Patient["goal_type"] | null): string {
    switch (goal) {
      case "definition":
        return "Definition";
      case "maintenance":
        return "Maintenance";
      case "bulking":
        return "Bulking";
      default:
        return "Goal pending";
    }
  }

  private createFilterPredicate() {
    return (data: PatientTableItem, filter: string): boolean => {
      const normalizedFilter = filter.trim().toLowerCase();
      if (!normalizedFilter) {
        return true;
      }
      const fullName = data.fullNameDisplay?.toLowerCase() ?? "";
      const userId = data.user_id?.toLowerCase() ?? "";
      return (
        fullName.includes(normalizedFilter) || userId.includes(normalizedFilter)
      );
    };
  }

  private reapplyFilter(): void {
    this.dataSource.filter = this.currentFilterValue;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: PatientTableItem): string {
    if (!row) {
      return `${this.isAllSelected() ? "deselect" : "select"} all`;
    }
    const action = this.selection.isSelected(row) ? "deselect" : "select";
    return `${action} row ${row.fullNameDisplay}`;
  }

  // Search Filter
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.currentFilterValue = filterValue;
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  async onAddNewPatient(event?: Event): Promise<void> {
    event?.preventDefault();

    if (this.isGeneratingInviteCode) {
      return;
    }

    const userId = this.userStore.userId();
    if (!userId) {
      this.snackBar.open(
        "We couldn't find your user information. Please try again.",
        "Close",
        { duration: 5000 },
      );
      return;
    }

    this.isGeneratingInviteCode = true;
    try {
      const { code } = await firstValueFrom(
        this.inviteCodeApi.createInviteCode(userId),
      );
      this.dialog.open(InviteCodeDialogComponent, {
        width: "480px",
        data: { code },
        autoFocus: false,
      });
    } catch (error) {
      this.logger.error(
        "[PatientsListComponent] Error generating invite code",
        error,
      );
      this.snackBar.open(
        "We couldn't generate the invite code. Please try again.",
        "Close",
        { duration: 5000 },
      );
    } finally {
      this.isGeneratingInviteCode = false;
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
  avatarUrl: string | null;
  avatarInitials: string;
  genderLabel: string;
  goalTypeLabel: string;
  status: {
    active?: string;
    deactive?: string;
  };
  action: {
    view: string;
    delete: string;
  };
}
