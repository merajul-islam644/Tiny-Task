import { RefreshCw, ShieldCheck, ShieldOff, UserPlus } from "lucide-react";
import { useState } from "react";
import { useT } from "../../lib/i18n/LocalizationProvider";
import { ActionButton } from "../../shared/ui/ActionButton";
import { ConfirmDialog } from "../../shared/ui/ConfirmDialog";
import { DataTable } from "../../shared/ui/DataTable";
import type { Column } from "../../shared/ui/DataTable";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { PageHeader } from "../../shared/ui/PageHeader";
import { StatusPill } from "../../shared/ui/StatusPill";
import { InviteUserDialog } from "./InviteUserDialog";
import { isActive, isAdminRole } from "./staffApi";
import type { StaffUser } from "./staffApi";
import { useIsAdmin, useStaffMutations, useStaffQuery } from "./useStaff";

type PendingAction =
  | { kind: "invite" }
  | { kind: "setActive"; user: StaffUser; active: boolean }
  | { kind: "setAdmin"; user: StaffUser; makeAdmin: boolean }
  | null;

export function AdminUsersPage() {
  const { t } = useT();
  const isAdmin = useIsAdmin();
  const [search, setSearch] = useState("");
  const staff = useStaffQuery(search);
  const mutations = useStaffMutations();
  const [pending, setPending] = useState<PendingAction>(null);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | undefined>();
  const [inviteError, setInviteError] = useState<string | undefined>();

  if (!isAdmin) {
    return (
      <section>
        <PageHeader title={t("admin.title")} subtitle={t("admin.subtitle")} />
        <EmptyState icon={<ShieldOff size={40} />} title={t("admin.noAccess.title")} description={t("admin.noAccess.message")} />
      </section>
    );
  }

  function displayName(user: StaffUser): string {
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    return name || user.email || String(user.itemId);
  }

  const columns: Column<StaffUser>[] = [
    {
      key: "name",
      header: t("admin.column.name"),
      render: (user) => (
        <div className="admin-name">
          <strong>{displayName(user)}</strong>
        </div>
      )
    },
    { key: "email", header: t("admin.column.email"), render: (user) => <span className="muted">{user.email ?? "\u2014"}</span> },
    {
      key: "role",
      header: t("admin.column.role"),
      render: (user) => (isAdminRole(user.roles) ? t("admin.role.admin") : t("admin.role.user"))
    },
    {
      key: "status",
      header: t("admin.column.status"),
      render: (user) => (
        <StatusPill tone={isActive(user) ? "good" : "neutral"}>
          {isActive(user) ? t("admin.status.active") : t("admin.status.inactive")}
        </StatusPill>
      )
    },
    {
      key: "actions",
      header: t("admin.column.actions"),
      render: (user) => {
        const active = isActive(user);
        const admin = isAdminRole(user.roles);
        return (
          <div className="admin-actions">
            <ActionButton
              onClick={() => setPending({ active: !active, kind: "setActive", user })}
              variant="icon"
              title={active ? t("admin.deactivate") : t("admin.reactivate")}
              icon={active ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
            />
            <ActionButton
              onClick={() => setPending({ kind: "setAdmin", makeAdmin: !admin, user })}
              variant="icon"
              title={admin ? t("admin.revokeAdmin") : t("admin.grantAdmin")}
              icon={admin ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
            />
          </div>
        );
      }
    }
  ];

  async function confirmPending() {
    const action = pending;
    if (!action) return;
    setPending(null);
    setNotice(undefined);
    try {
      if (action.kind === "setActive") await mutations.setActive.mutateAsync({ active: action.active, user: action.user });
      if (action.kind === "setAdmin") await mutations.setAdmin.mutateAsync({ makeAdmin: action.makeAdmin, user: action.user });
    } catch (error) {
      setNotice({ text: (error as Error).message || t("common.error"), tone: "error" });
    }
  }

  async function handleInvite(input: { email: string; firstName: string; lastName: string }) {
    setInviteError(undefined);
    try {
      await mutations.invite.mutateAsync(input);
      setPending(null);
      setNotice({ text: t("admin.invite.sent"), tone: "ok" });
    } catch (error) {
      setInviteError((error as Error).message);
    }
  }

  return (
    <section>
      <PageHeader
        title={t("admin.title")}
        subtitle={t("admin.subtitle")}
        actions={<ActionButton onClick={() => { setInviteError(undefined); setPending({ kind: "invite" }); }} icon={<UserPlus size={18} />} children={t("admin.invite")} />}
      />

      <div className="admin-toolbar">
        <div className="search-box">
          <input
            aria-label={t("admin.searchPlaceholder")}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("admin.searchPlaceholder")}
            value={search}
          />
        </div>
        <ActionButton variant="icon" onClick={() => staff.refetch()} title={t("common.refresh")} icon={<RefreshCw size={18} />} />
      </div>

      {notice ? <p className={notice.tone === "ok" ? "task-notice-ok" : "task-notice"} role="status">{notice.text}</p> : null}

      {staff.isError ? (
        <ErrorState message={t("common.error")} onRetry={() => staff.refetch()} />
      ) : staff.isLoading ? (
        <p className="muted">{t("common.loading")}</p>
      ) : (staff.data ?? []).length === 0 ? (
        <EmptyState icon={<UserPlus size={40} />} title={t("admin.title")} description={t("admin.empty")} />
      ) : (
        <DataTable columns={columns} rows={staff.data ?? []} />
      )}

      {pending?.kind === "invite" ? (
        <InviteUserDialog error={inviteError} onCancel={() => setPending(null)} onInvite={handleInvite} pending={mutations.invite.isPending} />
      ) : null}

      {pending?.kind === "setActive" ? (
        <ConfirmDialog
          confirmLabel={pending.active ? t("admin.reactivate") : t("admin.deactivate")}
          message={(pending.active ? t("admin.reactivate.confirm") : t("admin.deactivate.confirm")).replace("{name}", displayName(pending.user))}
          onCancel={() => setPending(null)}
          onConfirm={confirmPending}
          title={pending.active ? t("admin.reactivate") : t("admin.deactivate")}
          tone={pending.active ? "primary" : "danger"}
        />
      ) : null}

      {pending?.kind === "setAdmin" ? (
        <ConfirmDialog
          confirmLabel={pending.makeAdmin ? t("admin.grantAdmin") : t("admin.revokeAdmin")}
          message={(pending.makeAdmin ? t("admin.grant.confirm") : t("admin.revoke.confirm")).replace("{name}", displayName(pending.user))}
          onCancel={() => setPending(null)}
          onConfirm={confirmPending}
          title={pending.makeAdmin ? t("admin.grantAdmin") : t("admin.revokeAdmin")}
          tone="primary"
        />
      ) : null}
    </section>
  );
}
