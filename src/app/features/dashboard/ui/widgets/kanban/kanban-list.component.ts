import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatTableModule } from "@angular/material/table";
import { CustomizerSettingsService } from "../../../../../core/customizer-settings/customizer-settings.service";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { KanbanTasksService } from "../../../../kanban-board/data-access/services/kanban-tasks.service";
import { UserStore } from "../../../../../core/user/user.store";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { KanbanTask } from "../../../../kanban-board/domain/models";
import { NgClass } from "@angular/common";
import {
  calculateDaysLeft,
  getDaysLeftLabel,
  getDaysLeftColorClass,
} from "../../../../kanban-board/utils/kanban.utils";

@Component({
  selector: "app-kanban-list:not(p)",
  imports: [
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    NgClass,
  ],
  templateUrl: "./kanban-list.component.html",
  styleUrl: "./kanban-list.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanListComponent {
  readonly themeService = inject(CustomizerSettingsService);
  private readonly tasksService = inject(KanbanTasksService);
  private readonly userStore = inject(UserStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly displayedColumns = ["task", "daysLeft", "status"] as const;

  readonly tasks = signal<KanbanTask[]>([]);
  readonly isLoading = signal(false);

  readonly formattedTasks = computed(() => {
    const tasksWithDiff = this.tasks().map((task) => {
      const daysLeft = calculateDaysLeft(task.deadline_date);
      return { task, daysLeft };
    });

    const filtered = tasksWithDiff.filter(({ daysLeft }) => {
      if (daysLeft === null) {
        return true;
      }
      if (daysLeft < 0) return true;
      if (daysLeft === 0) return true;
      return daysLeft <= 7;
    });

    const overdue = filtered
      .filter(({ daysLeft }) => daysLeft !== null && daysLeft < 0)
      .sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0));

    const dueToday = filtered.filter(({ daysLeft }) => daysLeft === 0);

    const upcoming = filtered
      .filter(({ daysLeft }) => daysLeft !== null && daysLeft > 0)
      .sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0));

    const ordered = [...overdue, ...dueToday, ...upcoming];

    return ordered.map(({ task, daysLeft }) => ({
      id: task.id,
      taskName: task.task_name || "Untitled task",
      daysLeftLabel: getDaysLeftLabel(task.deadline_date),
      daysLeftColorClass: getDaysLeftColorClass(task.deadline_date),
      statusLabel: this.getStatusLabel(task.status),
      statusClass: this.getStatusClass(task.status),
      daysLeft,
    }));
  });

  constructor() {
    this.loadTasks();
  }


  loadTasks(): void {
    const userId = this.userStore.userId();
    if (!userId) {
      return;
    }

    this.isLoading.set(true);
    this.tasksService
      .getTasks(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tasks) => {
          this.tasks.set(tasks);
          this.isLoading.set(false);
        },
        error: () => {
          this.tasks.set([]);
          this.isLoading.set(false);
        },
      });
  }


  private getStatusLabel(status: KanbanTask["status"]): string {
    switch (status) {
      case "backlog":
        return "To Do";
      case "in_progress":
        return "In Progress";
      case "review":
        return "To Review";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  }

  private getStatusClass(status: KanbanTask["status"]): string {
    switch (status) {
      case "backlog":
        return "status-backlog";
      case "in_progress":
        return "status-in-progress";
      case "review":
        return "status-review";
      case "completed":
        return "status-completed";
      default:
        return "";
    }
  }
}
