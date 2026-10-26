import { Mail, RefreshCw, ShieldCheck, UserRound } from "lucide-react";
import { useT } from "../../lib/i18n/LocalizationProvider";
import { ActionButton } from "../../shared/ui/ActionButton";
import { ChipList } from "../../shared/ui/Chip";
import { PageHeader } from "../../shared/ui/PageHeader";
import { Skeleton } from "../../shared/ui/Skeleton";
import { StatusPill } from "../../shared/ui/StatusPill";
import { useCurrentUser, userDisplayName, userInitials } from "./useCurrentUser";

export function ProfilePage() {
  const me = useCurrentUser();
  const { t } = useT();
  const profile = me.data?.data;
  const name = userDisplayName(profile);

  return (
    <section>
      <PageHeader
        title={t("profile.title")}
        subtitle={t("profile.subtitle")}
        actions={<ActionButton variant="icon" onClick={() => me.refetch()} title={t("common.refresh")} icon={<RefreshCw size={18} />} />}
      />

      {me.isLoading ? (
        <div className="profile-card">
          <Skeleton className="skeleton-avatar-lg" />
          <div className="profile-heading">
            <Skeleton className="skeleton-line-lg" />
            <Skeleton className="skeleton-line" />
          </div>
        </div>
      ) : (
        <div className="profile-card">
          <span className="avatar avatar-lg">{userInitials(profile)}</span>
          <div className="profile-heading">
            <h3>{name || (me.isError ? t("common.error") : t("nav.account"))}</h3>
            {profile?.email ? <span className="muted"><Mail size={14} /> {profile.email}</span> : null}
            <StatusPill tone={me.isSuccess ? "good" : "warn"}>
              {me.isSuccess ? t("profile.active") : t("common.error")}
            </StatusPill>
          </div>
        </div>
      )}

      <div className="grid">
        <DetailCard icon={<UserRound size={16} />} label={t("profile.name")} loading={me.isLoading} value={name} />
        <DetailCard icon={<Mail size={16} />} label={t("profile.email")} loading={me.isLoading} value={profile?.email} />
      </div>

      <div className="panel">
        <div className="panel-title"><ShieldCheck size={16} /><span>{t("profile.roles")}</span></div>
        {me.isLoading ? <Skeleton className="skeleton-line" /> : <ChipList empty={t("profile.noRoles")} items={profile?.roles} />}
      </div>
    </section>
  );
}

function DetailCard({ icon, label, loading, value }: { icon: React.ReactNode; label: string; loading?: boolean; value?: string }) {
  return (
    <div className="panel">
      <div className="panel-title">{icon}<span>{label}</span></div>
      {loading ? <Skeleton className="skeleton-line" /> : <strong className="mono">{value || "\u2014"}</strong>}
    </div>
  );
}
