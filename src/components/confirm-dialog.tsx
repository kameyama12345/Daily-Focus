"use client";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      style={{ background: "rgba(6, 10, 17, 0.32)" }}
    >
      <div
        className="w-full max-w-lg rounded-[28px] p-6 shadow-float"
        style={{ background: "var(--panel-strong)", border: "1px solid var(--line)" }}
      >
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted">Confirm</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">{title}</h3>
          <p className="mt-3 text-sm text-muted">{message}</p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            className="rounded-full px-4 py-2 text-sm"
            onClick={onCancel}
            style={{
              background: "var(--button-secondary)",
              color: "var(--button-secondary-text)",
            }}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className="rounded-full px-5 py-2 text-sm font-medium"
            onClick={onConfirm}
            style={{
              background: "var(--button-primary)",
              color: "var(--button-primary-text)",
            }}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

