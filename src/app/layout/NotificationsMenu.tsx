import { Bell, CheckCheck } from "lucide-react";
import { useT } from "../../lib/i18n/LocalizationProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../../shared/ui/dropdown-menu";
import { useMarkAllRead, useNotifyInbox } from "../../features/notifications/useNotifyInbox";
import type { InboxNotification } from "../../features/notifications/useNotifyInbox";

function describe(notification: InboxNotification, completedLabel: string): string {
  const payload = notification.denormalizedPayload;
  if (!payload) return completedLabel;
  try {
    const parsed = JSON.parse(payload) as { title?: string };
    if (parsed.title) return completedLabel.replace("{title}", parsed.title);
  } catch {
    // Fall through to the generic label below.
  }
  return completedLabel;
}

export function NotificationsMenu() {
  const { t } = useT();
  const inbox = useNotifyInbox();
  const markAllRead = useMarkAllRead();
  const unread = inbox.data?.unReadNotificationsCount ?? 0;
  const items = inbox.data?.notifications ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="icon-button notification-trigger" aria-label={t("notifications.title")}>
        <Bell size={18} />
        {unread > 0 ? <span className="notification-badge">{unread > 9 ? "9+" : unread}</span> : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[320px]">
        <DropdownMenuLabel className="flex items-center justify-between gap-3">
          <span>{t("notifications.title")}</span>
          {unread > 0 ? (
            <button className="link-button" onClick={() => void markAllRead()}>{t("notifications.markAll")}</button>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
            <CheckCheck size={22} className="text-[hsl(var(--muted-foreground))]" />
            <p className="text-sm font-medium">{t("notifications.empty.title")}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{t("notifications.empty.description")}</p>
          </div>
        ) : (
          <ul className="notification-list">
            {items.map((item, index) => (
              <li className={`notification-item${item.isRead ? "" : " is-unread"}`} key={item.id ?? index}>
                {describe(item, t("notifications.completed"))}
              </li>
            ))}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
