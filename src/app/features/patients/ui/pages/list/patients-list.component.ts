import { Component, ViewChild, AfterViewInit, inject } from "@angular/core";
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
import { InviteCodeDialogComponent } from "../../components/invite-code-dialog/invite-code-dialog.component";
import { UserStore } from "../../../../../core/user/user.store";
import { LoggerService } from "../../../../../core/logger/logger.service";
import { firstValueFrom } from "rxjs";

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
export class PatientsListComponent implements AfterViewInit {
  displayedColumns: string[] = [
    "select",
    "userID",
    "fullName",
    "email",
    "role",
    "projectAccess",
    "status",
    "action",
  ];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  selection = new SelectionModel<PeriodicElement>(true, []);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private readonly inviteCodeApi = inject(PatientInviteCodeApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly userStore = inject(UserStore);
  private readonly logger = inject(LoggerService);

  isGeneratingInviteCode = false;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
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
  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? "deselect" : "select"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.fullName + 1}`;
  }

  // Search Filter
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
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

  constructor(public themeService: CustomizerSettingsService) {}
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    userID: "#ARP-1217",
    fullName: {
      img: "assets/images/users/user15.webp",
      name: "Marcia Baker",
    },
    email: "marcia@example.com",
    role: "Project manager",
    projectAccess: "Hotel management system, Python upgrade",
    status: {
      active: "Active",
      // deactive: 'Deactive',
    },
    action: {
      view: "visibility",
      edit: "edit",
      delete: "delete",
    },
  },
  {
    userID: "#ARP-1364",
    fullName: {
      img: "assets/images/users/user7.webp",
      name: "Carolyn Barnes",
    },
    email: "barnes@example.com",
    role: "Developer",
    projectAccess: "Project monitoring, Project alpho ",
    status: {
      active: "Active",
      // deactive: 'Deactive',
    },
    action: {
      view: "visibility",
      edit: "edit",
      delete: "delete",
    },
  },
  {
    userID: "#ARP-2951",
    fullName: {
      img: "assets/images/users/user12.webp",
      name: "Donna Miller",
    },
    email: "donna@example.com",
    role: "Business analyst",
    projectAccess: "Aegis accounting service, Beja banking finance ",
    status: {
      // active: 'Active',
      deactive: "Deactive",
    },
    action: {
      view: "visibility",
      edit: "edit",
      delete: "delete",
    },
  },
  {
    userID: "#ARP-7342",
    fullName: {
      img: "assets/images/users/user5.webp",
      name: "Barbara Cross",
    },
    email: "cross@example.com",
    role: "UI/UX designer",
    projectAccess: "Aoriv ai design,  Vaxo app design",
    status: {
      active: "Active",
      // deactive: 'Deactive',
    },
    action: {
      view: "visibility",
      edit: "edit",
      delete: "delete",
    },
  },
  {
    userID: "#ARP-4619",
    fullName: {
      img: "assets/images/users/user16.webp",
      name: "Rebecca Block",
    },
    email: "block@example.com",
    role: "QA tester",
    projectAccess: "Product development, Daxa dashboard design",
    status: {
      // active: 'Active',
      deactive: "Deactive",
    },
    action: {
      view: "visibility",
      edit: "edit",
      delete: "delete",
    },
  },
  {
    userID: "#ARP-7346",
    fullName: {
      img: "assets/images/users/user9.webp",
      name: "Ramiro McCarty",
    },
    email: "ramiro@example.com",
    role: "Admin",
    projectAccess: "Hotel management system, Python upgrade",
    status: {
      active: "Active",
      // deactive: 'Deactive',
    },
    action: {
      view: "visibility",
      edit: "edit",
      delete: "delete",
    },
  },
  {
    userID: "#ARP-7612",
    fullName: {
      img: "assets/images/users/user1.webp",
      name: "Robert Fairweather",
    },
    email: "robert@example.com",
    role: "Editor",
    projectAccess: "Aegis accounting service, Beja banking finance ",
    status: {
      active: "Active",
      // deactive: 'Deactive',
    },
    action: {
      view: "visibility",
      edit: "edit",
      delete: "delete",
    },
  },
  {
    userID: "#ARP-7642",
    fullName: {
      img: "assets/images/users/user6.webp",
      name: "Marcelino Haddock",
    },
    email: "haddock@example.com",
    role: "Project manager",
    projectAccess: "Project monitoring, Project alpho ",
    status: {
      active: "Active",
      // deactive: 'Deactive',
    },
    action: {
      view: "visibility",
      edit: "edit",
      delete: "delete",
    },
  },
  {
    userID: "#ARP-4652",
    fullName: {
      img: "assets/images/users/user13.webp",
      name: "Thomas Wilson",
    },
    email: "wildon@example.com",
    role: "UI/UX designer",
    projectAccess: "Product development, Daxa dashboard design",
    status: {
      // active: 'Active',
      deactive: "Deactive",
    },
    action: {
      view: "visibility",
      edit: "edit",
      delete: "delete",
    },
  },
  {
    userID: "#ARP-7895",
    fullName: {
      img: "assets/images/users/user14.webp",
      name: "Nathaniel Hulsey",
    },
    email: "hulsey@example.com",
    role: "Web developer",
    projectAccess: "Aoriv ai design,  Vaxo app design",
    status: {
      active: "Active",
      // deactive: 'Deactive',
    },
    action: {
      view: "visibility",
      edit: "edit",
      delete: "delete",
    },
  },
  {
    userID: "#ARP-7895",
    fullName: {
      img: "assets/images/users/user14.webp",
      name: "Nathaniel Hulsey",
    },
    email: "hulsey@example.com",
    role: "Web developer",
    projectAccess: "Aoriv ai design,  Vaxo app design",
    status: {
      // active: 'Active',
      deactive: "Deactive",
    },
    action: {
      view: "visibility",
      edit: "edit",
      delete: "delete",
    },
  },
  {
    userID: "#ARP-4652",
    fullName: {
      img: "assets/images/users/user13.webp",
      name: "Thomas Wilson",
    },
    email: "wildon@example.com",
    role: "UI/UX designer",
    projectAccess: "Product development, Daxa dashboard design",
    status: {
      active: "Active",
      // deactive: 'Deactive',
    },
    action: {
      view: "visibility",
      edit: "edit",
      delete: "delete",
    },
  },
  {
    userID: "#ARP-7642",
    fullName: {
      img: "assets/images/users/user6.webp",
      name: "Marcelino Haddock",
    },
    email: "haddock@example.com",
    role: "Project manager",
    projectAccess: "Project monitoring, Project alpho ",
    status: {
      active: "Active",
      // deactive: 'Deactive',
    },
    action: {
      view: "visibility",
      edit: "edit",
      delete: "delete",
    },
  },
  {
    userID: "#ARP-7612",
    fullName: {
      img: "assets/images/users/user1.webp",
      name: "Robert Fairweather",
    },
    email: "robert@example.com",
    role: "Editor",
    projectAccess: "Aegis accounting service, Beja banking finance ",
    status: {
      // active: 'Active',
      deactive: "Deactive",
    },
    action: {
      view: "visibility",
      edit: "edit",
      delete: "delete",
    },
  },
  {
    userID: "#ARP-7346",
    fullName: {
      img: "assets/images/users/user9.webp",
      name: "Ramiro McCarty",
    },
    email: "ramiro@example.com",
    role: "Admin",
    projectAccess: "Hotel management system, Python upgrade",
    status: {
      active: "Active",
      // deactive: 'Deactive',
    },
    action: {
      view: "visibility",
      edit: "edit",
      delete: "delete",
    },
  },
  {
    userID: "#ARP-4619",
    fullName: {
      img: "assets/images/users/user16.webp",
      name: "Rebecca Block",
    },
    email: "block@example.com",
    role: "QA tester",
    projectAccess: "Product development, Daxa dashboard design",
    status: {
      active: "Active",
      // deactive: 'Deactive',
    },
    action: {
      view: "visibility",
      edit: "edit",
      delete: "delete",
    },
  },
  {
    userID: "#ARP-7342",
    fullName: {
      img: "assets/images/users/user5.webp",
      name: "Barbara Cross",
    },
    email: "cross@example.com",
    role: "UI/UX designer",
    projectAccess: "Aoriv ai design,  Vaxo app design",
    status: {
      // active: 'Active',
      deactive: "Deactive",
    },
    action: {
      view: "visibility",
      edit: "edit",
      delete: "delete",
    },
  },
  {
    userID: "#ARP-2951",
    fullName: {
      img: "assets/images/users/user12.webp",
      name: "Donna Miller",
    },
    email: "donna@example.com",
    role: "Business analyst",
    projectAccess: "Aegis accounting service, Beja banking finance ",
    status: {
      active: "Active",
      // deactive: 'Deactive',
    },
    action: {
      view: "visibility",
      edit: "edit",
      delete: "delete",
    },
  },
  {
    userID: "#ARP-1364",
    fullName: {
      img: "assets/images/users/user7.webp",
      name: "Carolyn Barnes",
    },
    email: "barnes@example.com",
    role: "Developer",
    projectAccess: "Project monitoring, Project alpho ",
    status: {
      active: "Active",
      // deactive: 'Deactive',
    },
    action: {
      view: "visibility",
      edit: "edit",
      delete: "delete",
    },
  },
  {
    userID: "#ARP-1217",
    fullName: {
      img: "assets/images/users/user15.webp",
      name: "Marcia Baker",
    },
    email: "marcia@example.com",
    role: "Project manager",
    projectAccess: "Hotel management system, Python upgrade",
    status: {
      active: "Active",
      // deactive: 'Deactive',
    },
    action: {
      view: "visibility",
      edit: "edit",
      delete: "delete",
    },
  },
];
export interface PeriodicElement {
  userID: string;
  fullName: any;
  email: string;
  role: string;
  projectAccess: string;
  status: any;
  action: any;
}
