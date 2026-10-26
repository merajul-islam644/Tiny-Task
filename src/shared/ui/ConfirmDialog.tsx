import { Modal } from "./Modal";

export function ConfirmDialog({
  confirmLabel = "Delete",
  message,
  onCancel,
  onConfirm,
  title,
  tone = "danger"
}: {
  confirmLabel?: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  tone?: "danger" | "primary";
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p>{message}</p>
      <div className="modal-actions">
        <button className="icon-button" onClick={onCancel}>Cancel</button>
        <button className={tone === "danger" ? "primary-button danger" : "primary-button"} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}
