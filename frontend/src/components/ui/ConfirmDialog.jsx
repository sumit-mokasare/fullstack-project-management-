export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = true }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-slide-up p-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-2">{message}</p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className={danger ? 'btn-danger text-sm' : 'btn-primary text-sm'}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
