'use client';

interface DeleteConfirmModalProps {
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({ message, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm">
        <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
        <p className="text-gray-600 mb-6">{message || 'Are you sure you want to delete this record? This action cannot be undone.'}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 border rounded hover:bg-gray-100">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
