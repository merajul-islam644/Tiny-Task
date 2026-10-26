import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { History } from "lucide-react";
import { useT } from "../../lib/i18n/LocalizationProvider";
import { Modal } from "../../shared/ui/Modal";
import type { Task } from "./tasksApi";
import { useTaskHistory } from "./useTaskHistory";
import type { TaskHistoryRecord } from "./useTaskHistory";

const MAX_TITLE = 200;
const MAX_NOTES = 1000;

export type TaskEditorValues = { Title: string; Notes?: string; DueDate?: string };

function toDateInput(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function TaskEditor({ onCancel, onSave, task }: { onCancel: () => void; onSave: (values: TaskEditorValues) => void; task: Task }) {
  const { t } = useT();
  const [title, setTitle] = useState(task.Title ?? "");
  const [notes, setNotes] = useState(task.Notes ?? "");
  const [dueDate, setDueDate] = useState(toDateInput(task.DueDate));
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    setTitle(task.Title ?? "");
    setNotes(task.Notes ?? "");
    setDueDate(toDateInput(task.DueDate));
  }, [task]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError(t("tasks.error.title"));
      return;
    }
    if (trimmed.length > MAX_TITLE) {
      setError(t("tasks.error.tooLong"));
      return;
    }
    const trimmedNotes = notes.trim();
    if (trimmedNotes.length > MAX_NOTES) {
      setError(t("tasks.notes.tooLong"));
      return;
    }
    onSave({
      Title: trimmed,
      Notes: trimmedNotes || undefined,
      DueDate: dueDate ? new Date(dueDate).toISOString() : undefined
    });
  }

  return (
    <Modal onClose={onCancel} title={t("tasks.editor.title")}>
      <form className="task-editor" onSubmit={submit}>
        <label className="form-field">
          <span>{t("tasks.editor.nameLabel")}</span>
          <input autoFocus maxLength={MAX_TITLE} onChange={(event) => { setTitle(event.target.value); setError(undefined); }} value={title} />
        </label>
        <label className="form-field">
          <span>{t("tasks.editor.notesLabel")}</span>
          <textarea
            className="task-textarea"
            onChange={(event) => { setNotes(event.target.value); setError(undefined); }}
            placeholder={t("tasks.editor.notesPlaceholder")}
            rows={3}
            value={notes}
          />
        </label>
        <label className="form-field">
          <span>{t("tasks.editor.dueLabel")}</span>
          <input onChange={(event) => setDueDate(event.target.value)} type="date" value={dueDate} />
        </label>
        {error ? <p className="task-field-error" role="alert">{error}</p> : null}
        <TaskHistoryList taskId={task.ItemId} />
        <div className="modal-actions">
          <button className="icon-button" onClick={onCancel} type="button">{t("common.cancel")}</button>
          <button className="primary-button" type="submit">{t("common.save")}</button>
        </div>
      </form>
    </Modal>
  );
}

function TaskHistoryList({ taskId }: { taskId: string }) {
  const { t } = useT();
  const history = useTaskHistory(taskId);
  const entries = history.data ?? [];

  const labels: Record<string, string> = {
    created: t("tasks.history.created"),
    edited: t("tasks.history.edited"),
    completed: t("tasks.history.completed"),
    reopened: t("tasks.history.reopened"),
    deleted: t("tasks.history.deleted")
  };

  return (
    <details className="task-history">
      <summary>
        <History size={14} /> {t("tasks.history.title")}
      </summary>
      {history.isLoading ? (
        <p className="muted">{t("common.loading")}</p>
      ) : entries.length === 0 ? (
        <p className="muted">{t("tasks.history.empty")}</p>
      ) : (
        <ul className="task-history-list">
          {entries.map((entry) => (
            <li key={entry.ItemId}>
              <span className="task-history-action">{labels[entry.Action] ?? entry.Action}</span>
              <span className="task-history-time">{formatWhen(entry)}</span>
              {entry.ChangedFields ? (
                <span className="task-history-fields">{t("tasks.history.changed").replace("{fields}", entry.ChangedFields)}</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}

function formatWhen(entry: TaskHistoryRecord): string {
  if (!entry.OccurredOn) return "";
  const date = new Date(entry.OccurredOn);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
