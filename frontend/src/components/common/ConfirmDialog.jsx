import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

// Generic confirm-before-you-act modal — used for anything destructive or
// hard to undo (delete, post, resubmit-for-review). One shared component
// so every "are you sure?" moment in the app looks and behaves the same.
//
// isOpen: controls visibility
// title / message: what's being confirmed
// confirmLabel / cancelLabel: button text (defaults below)
// isLoading: disables both buttons and shows a spinner on confirm, so a
//   double-click can't fire the action twice
// onConfirm / onCancel: called on the respective button click
// variant: "danger" (red confirm button, e.g. delete) or "default" (black)
const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading = false,
  onConfirm,
  onCancel,
  variant = "default",
}) => {
  if (!isOpen) return null;

  const confirmButtonClasses =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={!isLoading ? onCancel : undefined}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 w-full max-w-sm p-6"
      >
        <div className="flex items-start gap-3 mb-2">
          {variant === "danger" && (
            <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4.5 h-4.5 text-red-600 dark:text-red-400" />
            </div>
          )}
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">{title}</h2>
            {message && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{message}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2 ${confirmButtonClasses}`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;