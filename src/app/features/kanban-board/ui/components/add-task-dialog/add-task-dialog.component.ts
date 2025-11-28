import { DOCUMENT } from "@angular/common";
import {
  Component,
  ElementRef,
  EnvironmentInjector,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  afterNextRender,
  inject,
  runInInjectionContext,
} from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { ErrorStateMatcher, MatNativeDateModule } from "@angular/material/core";
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormControl,
  FormGroupDirective,
  NgForm,
} from "@angular/forms";
import { CustomizerSettingsService } from "../../../../../core/customizer-settings/customizer-settings.service";
import { KanbanTaskStatus } from "../../../domain/models";

class TouchedErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null,
  ): boolean {
    return !!(control && control.invalid && control.touched);
  }
}

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
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(EnvironmentInjector);

  private readonly maxDescriptionLength = 160;

  readonly form = this.fb.group({
    taskName: ["", [Validators.required, Validators.maxLength(120)]],
    taskDescription: [
      "",
      [Validators.required, Validators.maxLength(this.maxDescriptionLength)],
    ],
    deadlineDate: [null as Date | null, Validators.required],
  });

  readonly errorMatcher = new TouchedErrorStateMatcher();

  @ViewChild("dialogRoot") private dialogRoot?: ElementRef<HTMLDivElement>;
  @ViewChild("taskNameInputElement")
  private taskNameInputElement?: ElementRef<HTMLInputElement>;

  private previouslyFocusedElement: HTMLElement | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["open"]) {
      const opened = changes["open"].currentValue === true;
      const wasOpen = changes["open"].previousValue === true;
      if (opened && !wasOpen) {
        this.form.reset();
        this.onDialogOpened();
      } else if (!opened && wasOpen) {
        this.onDialogClosed();
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

  private onDialogOpened(): void {
    this.storePreviouslyFocusedElement();
    this.scheduleFocus();
  }

  private onDialogClosed(): void {
    this.releaseDialogFocus();
    this.restorePreviousFocus();
  }

  private focusFirstField(): void {
    if (!this.open) {
      return;
    }
    const input = this.taskNameInputElement?.nativeElement;
    if (input) {
      input.focus();
      return;
    }
    this.dialogRoot?.nativeElement?.focus();
  }

  private releaseDialogFocus(): void {
    const activeElement = this.getActiveElement();
    if (
      activeElement &&
      this.dialogRoot?.nativeElement?.contains(activeElement)
    ) {
      activeElement.blur();
    }
  }

  private storePreviouslyFocusedElement(): void {
    this.previouslyFocusedElement = this.getActiveElement();
  }

  private restorePreviousFocus(): void {
    // Clear reference without restoring focus to avoid leaving buttons highlighted
    this.previouslyFocusedElement = null;
  }

  private getActiveElement(): HTMLElement | null {
    const activeElement = this.document.activeElement;
    return activeElement instanceof HTMLElement ? activeElement : null;
  }

  private scheduleFocus(): void {
    runInInjectionContext(this.injector, () => {
      afterNextRender(() => this.focusFirstField());
    });
  }
}
