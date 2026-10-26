import { LogOut, UserRound } from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import { useCurrentUser, userDisplayName, userInitials } from "../../features/profile/useCurrentUser";
import { useT } from "../../lib/i18n/LocalizationProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../../shared/ui/dropdown-menu";

export function UserMenu({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { logout } = useAuth();
  const { t } = useT();
  const me = useCurrentUser();
  const profile = me.data?.data;
  const name = userDisplayName(profile) || (me.isLoading ? t("common.loading") : "");

  function handleLogout() {
    logout();
    onNavigate("/login");
  }

  return (
    <div className="topbar-user">
      {name ? <span className="topbar-user-name">{name}</span> : null}
      <DropdownMenu>
        <DropdownMenuTrigger className="user-menu-trigger" aria-label={t("nav.account")}>
          <span className="avatar avatar-sm">{userInitials(profile)}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[240px]">
          <DropdownMenuLabel className="flex items-center gap-3 font-normal">
            <span className="avatar avatar-lg">{userInitials(profile)}</span>
            <div className="grid gap-0.5 overflow-hidden">
              <strong className="truncate text-sm font-semibold">{name || t("nav.account")}</strong>
              {profile?.email ? <small className="truncate text-xs text-[hsl(var(--muted-foreground))]">{profile.email}</small> : null}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => onNavigate("/profile")}>
            <UserRound size={18} /> {t("nav.profile")}
          </DropdownMenuItem>
          <DropdownMenuItem destructive onSelect={handleLogout}>
            <LogOut size={18} /> {t("nav.logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <button className="primary-button signout-button" onClick={handleLogout}>
        <LogOut size={16} /> <span className="signout-label">{t("nav.signOut")}</span>
      </button>
    </div>
  );
}
