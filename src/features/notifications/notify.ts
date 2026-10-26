import { blocksClient } from "../../lib/blocks/client";

// In-app alert pushed to the signed-in user's own notification inbox when
// they complete one of their tasks. Best-effort: a failure here must never
// block the task change the user actually asked for.
const CONTEXT = "tasks";

export async function notifyTaskCompleted(userId: string, taskId: string, title: string): Promise<void> {
  try {
    await blocksClient.notifier.notify({
      denormalizedPayload: JSON.stringify({ context: CONTEXT, actionName: "completed", taskId, title }),
      saveDenormalizedPayloadAsAnObject: true,
      subscriptionFilters: [{ actionName: "completed", context: CONTEXT, value: "*" }],
      userIds: [userId]
    });
  } catch {
    // Silently ignore -- the notification is a courtesy, not the action.
  }
}
