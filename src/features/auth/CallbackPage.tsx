import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../app/providers/AuthProvider";
import { completeLogin } from "../../lib/blocks/auth";
import { useT } from "../../lib/i18n/LocalizationProvider";
import { Alert } from "../../shared/ui/Alert";
import { LoadingScreen } from "../../shared/ui/LoadingScreen";

export function CallbackPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { refresh } = useAuth();
  const { t } = useT();
  const [error, setError] = useState<string | undefined>();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    completeLogin(window.location.href).then((result) => {
      if (result.ok) {
        refresh();
        onNavigate(result.returnTo);
        return;
      }

      setError(result.message);
    });
  }, [onNavigate, refresh]);

  if (error) {
    const inactive = isInactiveAccountError(error);
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <h2>{inactive ? t("admin.deactivated.title") : t("auth.failed")}</h2>
          <Alert tone="error">{inactive ? t("auth.inactive") : error}</Alert>
          <button className="primary-button auth-submit" onClick={() => onNavigate("/login")}>{t("auth.back")}</button>
        </div>
      </div>
    );
  }

  return <LoadingScreen />;
}

// IAM reports a deactivated account's refused sign-in through the OIDC error
// payload. The exact wording is server-owned, so match the common phrasings
// rather than a single exact string, and fall back to the raw message.
function isInactiveAccountError(message: string): boolean {
  return /not\s*active|inactive|deactivat|disabled|suspended|account.*deleted/i.test(message);
}
