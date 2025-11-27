import { Component, DestroyRef, OnInit, inject, signal } from "@angular/core";
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

interface ColumnsSnapshot {
  toDo: KanbanTask[];
  inProgress: KanbanTask[];
  toReview: KanbanTask[];
  toCompleted: KanbanTask[];
}

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

  readonly toDo = signal<KanbanTask[]>([]);
  readonly inProgress = signal<KanbanTask[]>([]);
  readonly toReview = signal<KanbanTask[]>([]);
  readonly toCompleted = signal<KanbanTask[]>([]);

  readonly isLoading = signal(false);
  readonly creatingTask = signal(false);
  readonly isAddTaskDialogOpen = signal(false);
  readonly dialogStatus = signal<KanbanTaskStatus>("backlog");
  readonly deletingTaskIds = signal<Set<string>>(new Set());

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
    this.isLoading.set(true);

    this.tasksService
      .getTasks(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tasks) => {
          this.isLoading.set(false);
          this.applyTasks(tasks);
        },
        error: (error) => {
          this.isLoading.set(false);
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

    if (!this.nutritionistId) {
      this.showUserMissingError();
      return;
    }

    const previousSnapshot = this.captureColumnsSnapshot();

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );

    const movedTask = event.container.data[event.currentIndex];
    if (!movedTask) {
      this.restoreColumnsSnapshot(previousSnapshot);
      return;
    }

    const previousStatus = movedTask.status;
    movedTask.status = targetStatus;
    this.syncAllTasksFromColumns();
    this.syncTaskMoveWithBackend(movedTask, previousStatus, previousSnapshot);
  }

  openAddTaskDialog(status: KanbanTaskStatus): void {
    this.dialogStatus.set(status);
    this.isAddTaskDialogOpen.set(true);
  }

  closeAddTaskDialog(): void {
    this.isAddTaskDialogOpen.set(false);
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

    this.creatingTask.set(true);
    this.tasksService
      .createTask(this.nutritionistId, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (task) => {
          this.creatingTask.set(false);
          this.addTaskToState(task);
          this.closeAddTaskDialog();
          this.snackBar.open("Task created successfully.", "Close", {
            duration: 3000,
          });
        },
        error: (error) => {
          this.creatingTask.set(false);
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

  isTaskDeleting(taskId: string | null | undefined): boolean {
    if (!taskId) {
      return false;
    }
    return this.deletingTaskIds().has(taskId);
  }

  handleDeleteTask(task: KanbanTask): void {
    if (!this.nutritionistId) {
      this.showUserMissingError();
      return;
    }
    if (this.isTaskDeleting(task.id)) {
      return;
    }

    this.updateDeletingTaskState(task.id, true);

    this.tasksService
      .deleteTask(this.nutritionistId, task.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.updateDeletingTaskState(task.id, false);
          this.removeTaskFromState(task.id);
          this.snackBar.open("Task deleted successfully.", "Close", {
            duration: 3000,
          });
        },
        error: (error) => {
          this.updateDeletingTaskState(task.id, false);
          this.logger.error(
            "[KanbanBoardComponent] Error deleting task",
            error,
          );
          this.snackBar.open(
            "We couldn't delete the task. Please try again.",
            "Close",
            {
              duration: 5000,
            },
          );
        },
      });
  }

  private applyTasks(tasks: KanbanTask[]): void {
    this.allTasks = [...tasks];
    this.groupTasksByStatus();
  }

  private groupTasksByStatus(): void {
    this.toDo.set(this.filterByStatus("backlog"));
    this.inProgress.set(this.filterByStatus("in_progress"));
    this.toReview.set(this.filterByStatus("review"));
    this.toCompleted.set(this.filterByStatus("completed"));
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

  private removeTaskFromState(taskId: string): void {
    this.allTasks = this.allTasks.filter((task) => task.id !== taskId);
    this.groupTasksByStatus();
  }

  private replaceTaskInState(task: KanbanTask): void {
    const idx = this.allTasks.findIndex((item) => item.id === task.id);
    if (idx >= 0) {
      const updatedTasks = [...this.allTasks];
      updatedTasks[idx] = task;
      this.allTasks = updatedTasks;
    } else {
      this.allTasks = [...this.allTasks, task];
    }
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
      status: this.dialogStatus(),
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
    // Forzar actualización de signals con nuevas referencias para que Angular detecte cambios
    const newToDo = [...this.toDo()];
    const newInProgress = [...this.inProgress()];
    const newToReview = [...this.toReview()];
    const newToCompleted = [...this.toCompleted()];

    this.toDo.set(newToDo);
    this.inProgress.set(newInProgress);
    this.toReview.set(newToReview);
    this.toCompleted.set(newToCompleted);

    this.allTasks = [
      ...newToDo,
      ...newInProgress,
      ...newToReview,
      ...newToCompleted,
    ];
  }

  private captureColumnsSnapshot(): ColumnsSnapshot {
    return {
      toDo: [...this.toDo()],
      inProgress: [...this.inProgress()],
      toReview: [...this.toReview()],
      toCompleted: [...this.toCompleted()],
    };
  }

  private restoreColumnsSnapshot(snapshot: ColumnsSnapshot): void {
    this.toDo.set([...snapshot.toDo]);
    this.inProgress.set([...snapshot.inProgress]);
    this.toReview.set([...snapshot.toReview]);
    this.toCompleted.set([...snapshot.toCompleted]);
    this.syncAllTasksFromColumns();
  }

  private syncTaskMoveWithBackend(
    task: KanbanTask,
    previousStatus: KanbanTaskStatus,
    snapshot: ColumnsSnapshot,
  ): void {
    if (!this.nutritionistId) {
      this.restoreColumnsSnapshot(snapshot);
      this.showUserMissingError();
      return;
    }

    this.tasksService
      .moveTask(this.nutritionistId, task.id, task.status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedTask) => {
          this.replaceTaskInState(updatedTask);
        },
        error: (error) => {
          task.status = previousStatus;
          this.restoreColumnsSnapshot(snapshot);
          this.logger.error(
            "[KanbanBoardComponent] Error updating task status",
            error,
          );
          this.snackBar.open(
            "We couldn't update the task status. Please try again.",
            "Close",
            {
              duration: 5000,
            },
          );
        },
      });
  }

  private updateDeletingTaskState(taskId: string, deleting: boolean): void {
    const nextState = new Set(this.deletingTaskIds());
    if (deleting) {
      nextState.add(taskId);
    } else {
      nextState.delete(taskId);
    }
    this.deletingTaskIds.set(nextState);
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
