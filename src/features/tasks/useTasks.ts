import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BlocksUser } from "@seliseblocks/client";
import { useCurrentUser } from "../profile/useCurrentUser";
import { createTask, deleteTask, listTasks, updateTask } from "./tasksApi";
import type { Task, TaskInput } from "./tasksApi";
import { recordHistory } from "./historyApi";
import type { HistoryAction } from "./historyApi";

// The stable identifier a task's Owner field holds. iam.me() exposes it as
// itemId; fall back through the fields a Blocks user record may carry so an
// unexpected shape degrades to a still-stable key rather than an empty Owner.
export function useOwnerId(): { ownerId: string; isLoading: boolean } {
  const me = useCurrentUser();
  const profile = me.data?.data as BlocksUser | undefined;
  const ownerId = resolveOwnerId(profile);
  return { ownerId, isLoading: me.isLoading };
}

export function resolveOwnerId(profile?: BlocksUser): string {
  if (!profile) return "";
  const candidate = profile.itemId ?? (profile as Record<string, unknown>).userId ?? profile.email;
  return candidate ? String(candidate) : "";
}

export function useTasksQuery() {
  const { ownerId, isLoading: ownerLoading } = useOwnerId();
  const query = useQuery({
    enabled: Boolean(ownerId),
    queryFn: () => listTasks(ownerId),
    queryKey: ["tasks", ownerId]
  });
  return { ...query, ownerId, isOwnerLoading: ownerLoading };
}

export function useTaskMutations(ownerId: string) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["tasks", ownerId] });

  return {
    create: useMutation({
      mutationFn: async (input: TaskInput) => {
        const created = await createTask(input, ownerId);
        const itemId = extractItemId(created);
        if (itemId) {
          await recordHistory({ action: "created", actor: ownerId, owner: ownerId, taskId: itemId, taskTitle: input.Title });
        }
        return created;
      },
      onSuccess: invalidate
    }),
    update: useMutation({
      mutationFn: async (variables: { itemId: string; patch: Record<string, unknown>; action: HistoryAction; changedFields?: string[]; title?: string }) => {
        await updateTask(variables.itemId, variables.patch);
        await recordHistory({
          action: variables.action,
          actor: ownerId,
          changedFields: variables.changedFields,
          owner: ownerId,
          taskId: variables.itemId,
          taskTitle: variables.title
        });
      },
      onSuccess: invalidate
    }),
    remove: useMutation({
      mutationFn: async (task: Task) => {
        await deleteTask(task.ItemId);
        await recordHistory({ action: "deleted", actor: ownerId, owner: ownerId, taskId: task.ItemId, taskTitle: task.Title });
      },
      onSuccess: invalidate
    })
  };
}

export function extractItemId(response: unknown): string | undefined {
  const record = response as { data?: { itemId?: string; ItemId?: string }; itemId?: string };
  const id = record?.data?.itemId ?? record?.data?.ItemId ?? record?.itemId;
  return id ? String(id) : undefined;
}
