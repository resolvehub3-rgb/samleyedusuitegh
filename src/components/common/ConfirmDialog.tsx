import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false
}) => {
  const variantBtn = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    primary: 'bg-orange-600 hover:bg-orange-700 text-white'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
          }}
          disabled={loading}
          className={`px-4 py-2 text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer ${variantBtn[variant]}`}
        >
          {loading ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
};
