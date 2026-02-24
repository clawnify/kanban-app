interface ConfirmBarProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  style?: Record<string, string>;
}

export function ConfirmBar({
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Yes, delete",
  cancelLabel = "No, keep",
  style,
}: ConfirmBarProps) {
  return (
    <div class="confirm-bar" style={style}>
      <span>{message}</span>
      <button class="btn btn-sm btn-danger" onClick={onConfirm} aria-label={confirmLabel}>
        {confirmLabel}
      </button>
      <button class="btn btn-sm" onClick={onCancel} aria-label={cancelLabel}>
        {cancelLabel}
      </button>
    </div>
  );
}
