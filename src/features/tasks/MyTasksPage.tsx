import { ListTodo, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useT } from "../../lib/i18n/LocalizationProvider";
import { EmptyState } from "../../shared/ui/EmptyState";
import { PageHeader } from "../../shared/ui/PageHeader";
import { ConfirmDialog } from "../../shared/ui/ConfirmDialog";
import { ErrorState } from "../../shared/ui/ErrorState";
import { Skeleton } from "../../shared/ui/Skeleton";
import { AddTaskRow } from "./AddTaskRow";
import { TaskCard } from "./TaskCard";
import { TaskControls } from "./TaskControls";
import type { TaskFilter } from "./TaskControls";
import { TaskEditor } from "./TaskEditor";
import type { TaskEditorValues } from "./TaskEditor";
import { useTaskMutations, useTasksQuery } from "./useTasks";
import type { Task } from "./tasksApi";
import { notifyTaskCompleted } from "../notifications/notify";
import { useNotifyInbox } from "../notifications/useNotifyInbox";

export function MyTasksPage() {
  const { t } = useT();
  const tasksQuery = useTasksQuery();
  const ownerId = tasksQuery.ownerId;
  const mutations = useTaskMutations(ownerId);
  const notifyInbox = useNotifyInbox();

  const [filter, setFilter] = useState<TaskFilter>("all");
  const [editorTask, setEditorTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [notice, setNotice] = useState<string | undefined>();

  const tasks = useMemo(() => tasksQuery.data ?? [], [tasksQuery.data]);
  const total = tasks.length;
  const remaining = useMemo(() => tasks.filter((task) => !task.Completed).length, [tasks]);
  const visible = useMemo(() => {
    if (filter === "active") return tasks.filter((task) => !task.Completed);
    if (filter === "completed") return tasks.filter((task) => task.Completed);
    return tasks;
  }, [tasks, filter]);

  async function handleAdd(title: string) {
    setNotice(undefined);
    try {
      await mutations.create.mutateAsync({ Title: title });
    } catch (error) {
      setNotice((error as Error).message);
    }
  }

  async function handleToggle(task: Task) {
    const nextCompleted = !task.Completed;
    const patch: Record<string, unknown> = nextCompleted
      ? { Completed: true, CompletedOn: new Date().toISOString(), CompletedBy: ownerId }
      : { Completed: false, CompletedOn: null, CompletedBy: null };
    const action = nextCompleted ? "completed" : "reopened";
    setNotice(undefined);
    try {
      await mutations.update.mutateAsync({ action, changedFields: ["Completed"], itemId: task.ItemId, patch, title: task.Title });
      if (nextCompleted) {
        await notifyTaskCompleted(ownerId, task.ItemId, task.Title ?? "");
        notifyInbox.refetch();
      }
    } catch (error) {
      handleMutationError(error);
    }
  }

  // A task the user still has on screen may already be gone (deleted from
  // another tab or device). Blocks reports the missing row as a failed
  // mutation; surface the PRD's wording and reload the list either way.
  function handleMutationError(error: unknown) {
    const message = (error as Error).message ?? "";
    if (/not\s*found|no\s*record|does not exist|missing|already deleted|ItemId/i.test(message)) {
      setNotice(t("tasks.deleted.title"));
      void tasksQuery.refetch();
      return;
    }
    setNotice(message || t("common.error"));
  }

  async function handleSave(values: TaskEditorValues) {
    const task = editorTask;
    if (!task) return;
    const changed: string[] = [];
    if ((task.Title ?? "") !== values.Title) changed.push("Title");
    if ((task.Notes ?? "") !== (values.Notes ?? "")) changed.push("Notes");
    const prevDue = task.DueDate ? new Date(task.DueDate).toISOString().slice(0, 10) : "";
    const nextDue = values.DueDate ? values.DueDate.slice(0, 10) : "";
    if (prevDue !== nextDue) changed.push("Due Date");

    setEditorTask(null);
    setNotice(undefined);
    try {
      await mutations.update.mutateAsync({
        action: "edited",
        changedFields: changed,
        itemId: task.ItemId,
        patch: { Title: values.Title, Notes: values.Notes ?? null, DueDate: values.DueDate ?? null },
        title: values.Title
      });
    } catch (error) {
      handleMutationError(error);
    }
  }

  async function handleDelete() {
    const task = deleteTask;
    if (!task) return;
    setDeleteTask(null);
    setNotice(undefined);
    try {
      await mutations.remove.mutateAsync(task);
    } catch (error) {
      handleMutationError(error);
    }
  }

  if (tasksQuery.isError) {
    return (
      <section>
        <PageHeader title={t("tasks.title")} subtitle={t("tasks.subtitle")} />
        <ErrorState message={t("common.error")} onRetry={() => tasksQuery.refetch()} />
      </section>
    );
  }

  return (
    <section>
      <PageHeader title={t("tasks.title")} subtitle={t("tasks.subtitle")} />
      <AddTaskRow disabled={mutations.create.isPending} onAdd={handleAdd} />
      <TaskControls filter={filter} onFilterChange={setFilter} remaining={remaining} total={total} />

      {notice ? <p className="task-notice" role="alert">{notice}</p> : null}

      {tasksQuery.isLoading ? (
        <div className="task-list">
          <Skeleton className="task-skeleton" />
          <Skeleton className="task-skeleton" />
          <Skeleton className="task-skeleton" />
        </div>
      ) : visible.length === 0 ? (
        <EmptyTasksState filter={filter} total={total} />
      ) : (
        <div className="task-list">
          {visible.map((task) => (
            <TaskCard key={task.ItemId} onDelete={setDeleteTask} onEdit={setEditorTask} onToggle={handleToggle} task={task} />
          ))}
        </div>
      )}

      {editorTask ? (
        <TaskEditor onCancel={() => setEditorTask(null)} onSave={handleSave} task={editorTask} />
      ) : null}

      {deleteTask ? (
        <ConfirmDialog
          confirmLabel={t("tasks.delete")}
          message={t("tasks.delete.message")}
          onCancel={() => setDeleteTask(null)}
          onConfirm={handleDelete}
          title={t("tasks.delete.title")}
        />
      ) : null}
    </section>
  );
}

function EmptyTasksState({ filter, total }: { filter: TaskFilter; total: number }) {
  const { t } = useT();

  if (total === 0) {
    return <EmptyState icon={<ListTodo size={40} />} title={t("tasks.empty.title")} description={t("tasks.empty.description")} />;
  }
  if (filter === "active") {
    return <EmptyState icon={<CheckCircle2 size={40} />} title={t("tasks.empty.active.title")} description={t("tasks.empty.active.description")} />;
  }
  if (filter === "completed") {
    return <EmptyState icon={<ListTodo size={40} />} title={t("tasks.empty.completed.title")} description={t("tasks.empty.completed.description")} />;
  }
  return null;
}
