import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import {
  CreateKanbanTaskPayload,
  KanbanTask,
  KanbanTaskStatus,
} from "../../domain/models/kanban-task.model";
import { KanbanTasksApiService } from "../api/kanban-tasks.api";

@Injectable({ providedIn: "root" })
export class KanbanTasksService {
  private readonly api = inject(KanbanTasksApiService);

  getTasks(nutritionistId: string): Observable<KanbanTask[]> {
    return this.api.getTasks(nutritionistId);
  }

  createTask(
    nutritionistId: string,
    payload: CreateKanbanTaskPayload,
  ): Observable<KanbanTask> {
    return this.api.createTask(nutritionistId, payload);
  }

  moveTask(
    nutritionistId: string,
    taskId: string,
    status: KanbanTaskStatus,
  ): Observable<KanbanTask> {
    return this.api.moveTask(nutritionistId, taskId, { status });
  }
}
