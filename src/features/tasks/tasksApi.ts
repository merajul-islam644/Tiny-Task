import { blocksClient } from "../../lib/blocks/client";

// One record of a user's own task, backed by the Blocks Data "Task" schema.
// Every read filters by Owner so a signed-in user only ever sees their own
// rows (the schema's row-level policies enforce the same server-side).
export type Task = {
  ItemId: string;
  Title?: string;
  Notes?: string;
  DueDate?: string;
  Completed?: boolean;
  CompletedOn?: string;
  CompletedBy?: string;
  Owner?: string;
  CreatedDate?: string;
};

export type TaskInput = {
  Title: string;
  Notes?: string;
  DueDate?: string;
};

const TASK_FIELDS = ["Title", "Notes", "DueDate", "Completed", "CompletedOn", "CompletedBy", "Owner", "CreatedDate"];

const tasks = blocksClient.data.collection<Task>("Task", { fields: TASK_FIELDS });

type ListResponse = {
  data?: { getTasks?: { items?: Task[]; totalCount?: number } };
};

export async function listTasks(owner: string): Promise<Task[]> {
  const response = (await tasks.list({
    pageNo: 1,
    pageSize: 200,
    filter: { Owner: owner },
    sort: { CreatedDate: -1 }
  })) as unknown as ListResponse;

  const items = response.data?.getTasks?.items ?? [];
  return items;
}

export function createTask(input: TaskInput, owner: string): Promise<unknown> {
  return tasks.create({
    Title: input.Title,
    Notes: input.Notes ?? null,
    DueDate: input.DueDate ?? null,
    Completed: false,
    Owner: owner
  } as unknown as Task);
}

export function updateTask(itemId: string, patch: Record<string, unknown>): Promise<unknown> {
  return tasks.update(itemId, patch as Partial<Task>);
}

export function deleteTask(itemId: string): Promise<unknown> {
  return tasks.delete(itemId);
}
