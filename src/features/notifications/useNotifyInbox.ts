import { useQuery, useQueryClient } from "@tanstack/react-query";
import { blocksClient } from "../../lib/blocks/client";
import { useAuth } from "../../app/providers/AuthProvider";

export type InboxNotification = {
  id?: string;
  isRead?: boolean;
  createdTime?: string;
  denormalizedPayload?: string;
};

type InboxResult = {
  notifications: InboxNotification[];
  totalNotificationsCount: number;
  unReadNotificationsCount: number;
};

// The signed-in user's own notification inbox, backed by Blocks Notifier.
// Only fetches once the session is authenticated; unread count drives the
// bell badge in the top bar.
export function useNotifyInbox() {
  const { status } = useAuth();
  return useQuery<InboxResult>({
    enabled: status === "authenticated",
    queryFn: async () => {
      const result = await blocksClient.notifier.getNotifications({ page: 1, pageSize: 20 });
      return {
        notifications: (result.notifications ?? []) as InboxNotification[],
        totalNotificationsCount: result.totalNotificationsCount ?? 0,
        unReadNotificationsCount: result.unReadNotificationsCount ?? 0
      };
    },
    queryKey: ["notifications", "inbox"],
    refetchInterval: 60_000
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return async () => {
    await blocksClient.notifier.markAllNotificationAsRead();
    await queryClient.invalidateQueries({ queryKey: ["notifications", "inbox"] });
  };
}
