import {
  Component,
  Inject,
  PLATFORM_ID,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatSelectModule } from "@angular/material/select";
import { FileUploadModule } from "@iplab/ngx-file-upload";
import { NgxEditorModule, Editor, Toolbar } from "ngx-editor";
import { CustomizerSettingsService } from "../../../../../core/customizer-settings/customizer-settings.service";

@Component({
  selector: "app-create-list",
  imports: [
    MatCardModule,
    MatMenuModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    FileUploadModule,
    NgxEditorModule,
  ],
  templateUrl: "./create-patient.component.html",
  styleUrl: "./create-patient.component.scss",
})
export class CreatePatientComponent implements OnInit, OnDestroy {
  // Text Editor
  editor!: Editor | null; // Make it nullable
  toolbar: Toolbar = [
    ["bold", "italic"],
    ["underline", "strike"],
    ["code", "blockquote"],
    ["ordered_list", "bullet_list"],
    [{ heading: ["h1", "h2", "h3", "h4", "h5", "h6"] }],
    ["link", "image"],
    ["text_color", "background_color"],
    ["align_left", "align_center", "align_right", "align_justify"],
  ];

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Initialize the editor only in the browser
      this.editor = new Editor();
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.editor) {
      this.editor.destroy();
    }
  }

  // File Uploader
  public multiple = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    public themeService: CustomizerSettingsService,
  ) {}
}
