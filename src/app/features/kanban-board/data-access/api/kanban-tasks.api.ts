import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";
import {
  CreateKanbanTaskPayload,
  KanbanTask,
} from "../../domain/models/kanban-task.model";

@Injectable({ providedIn: "root" })
export class KanbanTasksApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/nutritionists`;

  getTasks(nutritionistId: string): Observable<KanbanTask[]> {
    const encodedId = encodeURIComponent(nutritionistId);
    return this.http.get<KanbanTask[]>(`${this.apiUrl}/${encodedId}/tasks`);
  }

  createTask(
    nutritionistId: string,
    payload: CreateKanbanTaskPayload,
  ): Observable<KanbanTask> {
    const encodedId = encodeURIComponent(nutritionistId);
    return this.http.post<KanbanTask>(
      `${this.apiUrl}/${encodedId}/tasks`,
      payload,
    );
  }
}
