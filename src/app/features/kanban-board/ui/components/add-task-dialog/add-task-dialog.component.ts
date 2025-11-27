import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { CustomizerSettingsService } from "../../../../../core/customizer-settings/customizer-settings.service";
import { KanbanTaskStatus } from "../../../domain/models";

export interface AddTaskDialogFormValue {
  taskName: string;
  taskDescription: string;
  deadlineDate: Date | null;
}

@Component({
  selector: "app-add-task-dialog",
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./add-task-dialog.component.html",
  styleUrl: "./add-task-dialog.component.scss",
})
export class AddTaskDialogComponent implements OnChanges {
  @Input() open = false;
  @Input() status: KanbanTaskStatus = "backlog";
  @Input() loading = false;

  @Output() closed = new EventEmitter<void>();
  @Output() create = new EventEmitter<AddTaskDialogFormValue>();

  readonly themeService = inject(CustomizerSettingsService);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    taskName: ["", [Validators.required, Validators.maxLength(120)]],
    taskDescription: ["", [Validators.required, Validators.maxLength(1000)]],
    deadlineDate: [null as Date | null, Validators.required],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["open"]) {
      const opened = changes["open"].currentValue;
      const wasClosed = !changes["open"].previousValue;
      if (opened && wasClosed) {
        this.form.reset();
      }
    }
  }

  onCancel(): void {
    if (this.loading) {
      return;
    }
    this.form.reset();
    this.closed.emit();
  }

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }
    this.create.emit(this.form.getRawValue() as AddTaskDialogFormValue);
  }
}
