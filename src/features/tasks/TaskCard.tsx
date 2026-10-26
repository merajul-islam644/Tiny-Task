import { CalendarDays, Check, Pencil, Trash2 } from "lucide-react";
import { useT } from "../../lib/i18n/LocalizationProvider";
import type { Task } from "./tasksApi";

function formatDue(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }).replace(",", "");
}

export function TaskCard({
  task,
  onDelete,
  onEdit,
  onToggle
}: {
  task: Task;
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onToggle: (task: Task) => void;
}) {
  const { t } = useT();
  const completed = Boolean(task.Completed);
  const due = formatDue(task.DueDate);

  return (
    <article className={`task-card${completed ? " is-completed" : ""}`}>
      <button
        aria-label={completed ? t("tasks.filter.active") : t("tasks.filter.completed")}
        aria-pressed={completed}
        className="task-check"
        onClick={() => onToggle(task)}
        type="button"
      >
        {completed ? <Check size={16} /> : null}
      </button>
      <div className="task-body">
        <p className="task-title">{task.Title}</p>
        {task.Notes ? <p className="task-notes">{task.Notes}</p> : null}
        {due ? (
          <span className="task-meta">
            <CalendarDays size={13} /> {t("tasks.due")} {due}
          </span>
        ) : null}
      </div>
      <div className="task-actions">
        <button aria-label={t("tasks.edit")} className="icon-button" onClick={() => onEdit(task)} title={t("tasks.edit")} type="button">
          <Pencil size={16} />
        </button>
        <button aria-label={t("tasks.delete")} className="icon-button" onClick={() => onDelete(task)} title={t("tasks.delete")} type="button">
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
}
