import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { navItems } from "./navItems";
import { NotificationsMenu } from "./NotificationsMenu";
import { UserMenu } from "./UserMenu";
import { useIsAdmin } from "../../features/admin/useStaff";
import { useT } from "../../lib/i18n/LocalizationProvider";

const MOBILE_QUERY = "(max-width: 880px)";

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

export function AppShell({ activePath, children, onNavigate }: { activePath: string; children: ReactNode; onNavigate: (path: string) => void }) {
  const isMobile = useIsMobile();
  const { t } = useT();
  const isAdmin = useIsAdmin();
  const visibleNav = navItems.filter((item) => !item.adminOnly || isAdmin);
  const activeItem = visibleNav.find((item) => item.href === activePath);

  return (
    <div className="shell">
      <aside className={isMobile ? "collapsed" : ""}>
        <div className="sidebar-header">
          <a className="brand" href="/" onClick={(event) => { event.preventDefault(); onNavigate("/"); }}>
            <span className="brand-mark"><CheckCircle2 size={17} /></span>
            {isMobile ? null : <span>TinyTasks</span>}
          </a>
        </div>
        <nav>
          {visibleNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              data-tooltip={t(item.labelKey)}
              className={activePath === item.href ? "active" : ""}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(item.href);
              }}
            >
              <item.icon size={18} />
              {isMobile ? null : <span>{t(item.labelKey)}</span>}
            </a>
          ))}
        </nav>
      </aside>
      <div className="content">
        <header className="topbar">
          {activeItem ? (
            <div className="breadcrumb">
              <activeItem.icon size={16} />
              <span>{isMobile ? t("app.name") : t(activeItem.labelKey)}</span>
            </div>
          ) : null}
          <div className="topbar-spacer" />
          <NotificationsMenu />
          <UserMenu onNavigate={onNavigate} />
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
