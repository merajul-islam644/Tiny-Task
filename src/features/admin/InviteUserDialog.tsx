import { useState } from "react";
import type { FormEvent } from "react";
import { useT } from "../../lib/i18n/LocalizationProvider";
import { Modal } from "../../shared/ui/Modal";
import { Alert } from "../../shared/ui/Alert";

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function InviteUserDialog({
  error,
  onCancel,
  onInvite,
  pending
}: {
  error?: string;
  onCancel: () => void;
  onInvite: (input: { email: string; firstName: string; lastName: string }) => void;
  pending: boolean;
}) {
  const { t } = useT();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [localError, setLocalError] = useState<string | undefined>();

  function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL.test(trimmed)) {
      setLocalError(t("admin.invite.invalidEmail"));
      return;
    }
    setLocalError(undefined);
    onInvite({ email: trimmed, firstName: firstName.trim(), lastName: lastName.trim() });
  }

  return (
    <Modal onClose={onCancel} title={t("admin.invite.title")}>
      <form className="task-editor" onSubmit={submit}>
        <label className="form-field">
          <span>{t("admin.invite.email")}</span>
          <input autoFocus onChange={(event) => { setEmail(event.target.value); setLocalError(undefined); }} type="email" value={email} />
        </label>
        <label className="form-field">
          <span>{t("admin.invite.firstName")}</span>
          <input onChange={(event) => setFirstName(event.target.value)} value={firstName} />
        </label>
        <label className="form-field">
          <span>{t("admin.invite.lastName")}</span>
          <input onChange={(event) => setLastName(event.target.value)} value={lastName} />
        </label>
        {localError ? <p className="task-field-error" role="alert">{localError}</p> : null}
        {error ? <Alert tone="error">{error}</Alert> : null}
        <div className="modal-actions">
          <button className="icon-button" onClick={onCancel} type="button">{t("common.cancel")}</button>
          <button className="primary-button" disabled={pending} type="submit">{t("admin.invite.send")}</button>
        </div>
      </form>
    </Modal>
  );
}
