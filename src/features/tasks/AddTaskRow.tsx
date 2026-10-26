import { Plus } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { useT } from "../../lib/i18n/LocalizationProvider";

const MAX_TITLE = 200;

export function AddTaskRow({ disabled, onAdd }: { disabled?: boolean; onAdd: (title: string) => void }) {
  const { t } = useT();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | undefined>();

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
    setError(undefined);
    onAdd(trimmed);
    setTitle("");
  }

  return (
    <form className="task-add" onSubmit={submit}>
      <div className="task-add-row">
        <input
          aria-label={t("tasks.addPlaceholder")}
          className="task-add-input"
          disabled={disabled}
          onChange={(event) => {
            setTitle(event.target.value);
            if (error) setError(undefined);
          }}
          placeholder={t("tasks.addPlaceholder")}
          value={title}
        />
        <button className="primary-button" disabled={disabled} type="submit">
          <Plus size={18} /> {t("tasks.add")}
        </button>
      </div>
      {error ? <p className="task-field-error" role="alert">{error}</p> : null}
    </form>
  );
}
