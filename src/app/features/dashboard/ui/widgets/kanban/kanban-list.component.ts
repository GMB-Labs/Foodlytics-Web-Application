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
import { NgClass, NgIf } from "@angular/common";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
  selector: "app-kanban-list:not(p)",
  imports: [
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    NgClass,
    NgIf,
    MatTooltipModule,
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

  readonly displayedColumns = ["task", "description", "daysLeft", "status"] as const;

  readonly tasks = signal<KanbanTask[]>([]);
  readonly isLoading = signal(false);

  readonly formattedTasks = computed(() => {
    const tasksWithDiff = this.tasks().map((task) => {
      const daysLeft = this.calculateDaysLeft(task.deadline_date);
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
      ...this.formatDescription(task.task_description),
      daysLeftLabel: this.getDaysLeftLabel(task.deadline_date),
      statusLabel: this.getStatusLabel(task.status),
      statusClass: this.getStatusClass(task.status),
      daysLeft,
    }));
  });

  constructor() {
    this.loadTasks();
  }

  private formatDescription(description?: string | null): {
    description: string;
    fullDescription: string | null;
    hasDescription: boolean;
    isTruncated: boolean;
  } {
    if (!description) {
      return {
        description: "—",
        fullDescription: null,
        hasDescription: false,
        isTruncated: false,
      };
    }
    const trimmed = description.trim();
    if (!trimmed) {
      return {
        description: "—",
        fullDescription: null,
        hasDescription: false,
        isTruncated: false,
      };
    }
    const limit = 60;
    const isTruncated = trimmed.length > limit;
    const truncated = isTruncated ? `${trimmed.slice(0, limit - 3)}...` : trimmed;
    return {
      description: truncated,
      fullDescription: trimmed,
      hasDescription: true,
      isTruncated,
    };
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

  private getDaysLeftLabel(deadline: string): string {
    const diff = this.calculateDaysLeft(deadline);
    if (diff === null) {
      return "—";
    }
    if (diff > 0) {
      return diff === 1 ? "1 day left" : `${diff} days left`;
    }
    if (diff === 0) {
      return "Due Today";
    }
    const overdue = Math.abs(diff);
    return overdue === 1
      ? "Overdue by 1 day"
      : `Overdue by ${overdue} days`;
  }

  private calculateDaysLeft(deadline: string): number | null {
    if (!deadline) {
      return null;
    }
    const deadlineDate = new Date(deadline);
    if (Number.isNaN(deadlineDate.getTime())) {
      return null;
    }
    const today = new Date();
    const todayUtc = Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const deadlineUtc = Date.UTC(
      deadlineDate.getFullYear(),
      deadlineDate.getMonth(),
      deadlineDate.getDate(),
    );
    return Math.floor((deadlineUtc - todayUtc) / (24 * 60 * 60 * 1000));
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
