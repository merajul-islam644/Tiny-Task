import { useT } from "../../lib/i18n/LocalizationProvider";

export type TaskFilter = "all" | "active" | "completed";

const FILTERS: { key: TaskFilter; labelKey: "tasks.filter.all" | "tasks.filter.active" | "tasks.filter.completed" }[] = [
  { key: "all", labelKey: "tasks.filter.all" },
  { key: "active", labelKey: "tasks.filter.active" },
  { key: "completed", labelKey: "tasks.filter.completed" }
];

export function TaskControls({
  filter,
  onFilterChange,
  remaining,
  total
}: {
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  remaining: number;
  total: number;
}) {
  const { t } = useT();

  return (
    <div className="task-controls">
      <div className="task-counts">
        <span className="task-count-strong">{t("tasks.count.all").replace("{count}", String(total))}</span>
        <span className="task-count-muted">{t("tasks.count.remaining").replace("{count}", String(remaining))}</span>
      </div>
      <div aria-label="Filters" className="task-filters" role="tablist">
        {FILTERS.map((entry) => (
          <button
            aria-selected={filter === entry.key}
            className={`task-filter${filter === entry.key ? " is-active" : ""}`}
            key={entry.key}
            onClick={() => onFilterChange(entry.key)}
            role="tab"
            type="button"
          >
            {t(entry.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}
