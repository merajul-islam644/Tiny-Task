import { blocksClient } from "../../lib/blocks/client";

// An audit entry for a Task: who did what, when, and which fields changed.
// Same Owner-scoped access as Task, so a user only sees history of their own.
export type TaskHistoryEntry = {
  ItemId: string;
  TaskId: string;
  TaskTitle?: string;
  Action: string;
  ChangedFields?: string;
  Actor: string;
  Owner: string;
  OccurredOn: string;
};

export type HistoryAction = "created" | "edited" | "completed" | "reopened" | "deleted";

const history = blocksClient.data.collection<TaskHistoryEntry>("TaskHistory", {
  fields: ["TaskId", "TaskTitle", "Action", "ChangedFields", "Actor", "Owner", "OccurredOn"]
});

export function recordHistory(entry: {
  taskId: string;
  taskTitle?: string;
  action: HistoryAction;
  changedFields?: string[];
  actor: string;
  owner: string;
}): Promise<unknown> {
  return history.create({
    TaskId: entry.taskId,
    TaskTitle: entry.taskTitle ?? null,
    Action: entry.action,
    ChangedFields: entry.changedFields?.length ? entry.changedFields.join(", ") : null,
    Actor: entry.actor,
    Owner: entry.owner,
    OccurredOn: new Date().toISOString()
  } as unknown as TaskHistoryEntry);
}
