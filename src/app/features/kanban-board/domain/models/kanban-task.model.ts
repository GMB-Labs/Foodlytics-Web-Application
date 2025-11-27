export type KanbanTaskStatus =
  | "backlog"
  | "in_progress"
  | "review"
  | "completed";

export interface KanbanTask {
  id: string;
  nutritionist_id: string;
  task_name: string;
  task_description: string;
  status: KanbanTaskStatus;
  deadline_date: string;
}

export interface CreateKanbanTaskPayload {
  task_name: string;
  task_description: string;
  status: KanbanTaskStatus;
  deadline_date: string;
}
