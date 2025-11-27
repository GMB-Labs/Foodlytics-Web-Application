import { Component, DestroyRef, OnInit, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatMenuModule } from "@angular/material/menu";
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { MatSnackBar } from "@angular/material/snack-bar";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { CustomizerSettingsService } from "../../../../core/customizer-settings/customizer-settings.service";
import { UserStore } from "../../../../core/user/user.store";
import { LoggerService } from "../../../../core/logger/logger.service";
import {
  KanbanTask,
  KanbanTaskStatus,
  CreateKanbanTaskPayload,
} from "../../domain/models";
import { KanbanTasksService } from "../../data-access/services/kanban-tasks.service";
import {
  AddTaskDialogComponent,
  AddTaskDialogFormValue,
} from "../components/add-task-dialog/add-task-dialog.component";

@Component({
  selector: "app-kanban-board",
  imports: [
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    CdkDropList,
    CdkDrag,
    CdkDropListGroup,
    AddTaskDialogComponent,
  ],
  templateUrl: "./kanban-board.component.html",
  styleUrl: "./kanban-board.component.scss",
})
export class KanbanBoardComponent implements OnInit {
  readonly themeService = inject(CustomizerSettingsService);
  private readonly tasksService = inject(KanbanTasksService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly userStore = inject(UserStore);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  toDo: KanbanTask[] = [];
  inProgress: KanbanTask[] = [];
  toReview: KanbanTask[] = [];
  toCompleted: KanbanTask[] = [];

  isLoading = false;
  creatingTask = false;
  isAddTaskDialogOpen = false;
  dialogStatus: KanbanTaskStatus = "backlog";

  private allTasks: KanbanTask[] = [];
  private nutritionistId: string | null = null;
  private readonly msInDay = 24 * 60 * 60 * 1000;
  private readonly dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  ngOnInit(): void {
    const userId = this.userStore.userId();
    if (!userId) {
      this.showUserMissingError();
      return;
    }

    this.nutritionistId = userId;
    this.isLoading = true;

    this.tasksService
      .getTasks(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tasks) => {
          this.isLoading = false;
          this.applyTasks(tasks);
        },
        error: (error) => {
          this.isLoading = false;
          this.logger.error(
            "[KanbanBoardComponent] Error loading tasks",
            error,
          );
          this.snackBar.open(
            "We couldn't load your tasks. Please try again.",
            "Close",
            {
              duration: 5000,
            },
          );
        },
      });
  }

  drop(event: CdkDragDrop<KanbanTask[]>, targetStatus: KanbanTaskStatus): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      this.syncAllTasksFromColumns();
      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );

    const movedTask = event.container.data[event.currentIndex];
    if (movedTask) {
      movedTask.status = targetStatus;
    }
    this.syncAllTasksFromColumns();
  }

  openAddTaskDialog(status: KanbanTaskStatus): void {
    this.dialogStatus = status;
    this.isAddTaskDialogOpen = true;
  }

  closeAddTaskDialog(): void {
    this.isAddTaskDialogOpen = false;
  }

  handleCreateTask(formValue: AddTaskDialogFormValue): void {
    if (!this.nutritionistId) {
      this.showUserMissingError();
      return;
    }

    const payload = this.buildCreatePayload(formValue);
    if (!payload) {
      this.snackBar.open("Please provide a valid deadline date.", "Close", {
        duration: 4000,
      });
      return;
    }

    this.creatingTask = true;
    this.tasksService
      .createTask(this.nutritionistId, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (task) => {
          this.creatingTask = false;
          this.addTaskToState(task);
          this.closeAddTaskDialog();
          this.snackBar.open("Task created successfully.", "Close", {
            duration: 3000,
          });
        },
        error: (error) => {
          this.creatingTask = false;
          this.logger.error(
            "[KanbanBoardComponent] Error creating task",
            error,
          );
          this.snackBar.open(
            "We couldn't create the task. Please try again.",
            "Close",
            {
              duration: 5000,
            },
          );
        },
      });
  }

  getDaysLeftLabel(task: KanbanTask): string {
    const diff = this.calculateDaysLeft(task.deadline_date);
    if (diff === null) {
      return "—";
    }
    if (diff > 1) {
      return `${diff} days left`;
    }
    if (diff === 1) {
      return "1 day left";
    }
    if (diff === 0) {
      return "Due today";
    }
    return `${Math.abs(diff)} days overdue`;
  }

  formatDeadlineDate(deadline: string): string {
    const date = this.parseDeadline(deadline);
    if (!date) {
      return "No deadline";
    }
    return this.dateFormatter.format(date);
  }

  formatColumnCount(count: number): string {
    return count.toString().padStart(2, "0");
  }

  getAddTaskButtonText(tasks: KanbanTask[]): string {
    return tasks.length === 0 ? "Add task" : "Add another task";
  }

  private applyTasks(tasks: KanbanTask[]): void {
    this.allTasks = [...tasks];
    this.groupTasksByStatus();
  }

  private groupTasksByStatus(): void {
    this.toDo = this.filterByStatus("backlog");
    this.inProgress = this.filterByStatus("in_progress");
    this.toReview = this.filterByStatus("review");
    this.toCompleted = this.filterByStatus("completed");
  }

  private filterByStatus(status: KanbanTaskStatus): KanbanTask[] {
    return this.allTasks
      .filter((task) => task.status === status)
      .sort(
        (a, b) =>
          this.getDeadlineTime(a.deadline_date) -
          this.getDeadlineTime(b.deadline_date),
      );
  }

  private addTaskToState(task: KanbanTask): void {
    this.allTasks = [...this.allTasks, task];
    this.groupTasksByStatus();
  }

  private buildCreatePayload(
    formValue: AddTaskDialogFormValue,
  ): CreateKanbanTaskPayload | null {
    const deadlineDate = formValue.deadlineDate;
    if (!deadlineDate) {
      return null;
    }

    const taskName = (formValue.taskName ?? "").trim();
    const taskDescription = (formValue.taskDescription ?? "").trim();

    return {
      task_name: taskName,
      task_description: taskDescription,
      status: this.dialogStatus,
      deadline_date: this.formatDateForApi(deadlineDate),
    };
  }

  private formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private parseDeadline(value: string): Date | null {
    if (!value) {
      return null;
    }
    const parts = value.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts.map((part) => Number.parseInt(part, 10));
      if (
        Number.isFinite(year) &&
        Number.isFinite(month) &&
        Number.isFinite(day)
      ) {
        return new Date(Date.UTC(year, month - 1, day));
      }
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private calculateDaysLeft(deadline: string): number | null {
    const deadlineDate = this.parseDeadline(deadline);
    if (!deadlineDate) {
      return null;
    }
    const today = new Date();
    const todayUtc = Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const deadlineUtc = Date.UTC(
      deadlineDate.getUTCFullYear(),
      deadlineDate.getUTCMonth(),
      deadlineDate.getUTCDate(),
    );
    return Math.floor((deadlineUtc - todayUtc) / this.msInDay);
  }

  private getDeadlineTime(deadline: string): number {
    const parsed = this.parseDeadline(deadline);
    return parsed ? parsed.getTime() : Number.MAX_SAFE_INTEGER;
  }

  private syncAllTasksFromColumns(): void {
    this.allTasks = [
      ...this.toDo,
      ...this.inProgress,
      ...this.toReview,
      ...this.toCompleted,
    ];
  }

  private showUserMissingError(): void {
    this.snackBar.open(
      "We couldn't find your user information. Please try again.",
      "Close",
      {
        duration: 5000,
      },
    );
  }
}
