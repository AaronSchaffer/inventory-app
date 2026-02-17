'use client';

import { useState } from 'react';
import { ColumnDef } from '@/lib/types';
import { allColumns, formatDateForInput } from '@/lib/columns';

interface EditModalProps {
  record: Record<string, unknown>;
  fields: string[];
  onSave: (record: Record<string, unknown>) => Promise<boolean>;
  onClose: () => void;
}

export default function EditModal({ record, fields, onSave, onClose }: EditModalProps) {
  const [form, setForm] = useState<Record<string, unknown>>(record);

  const handleSubmit = async () => {
    const { _fields, ...saveData } = form;
    const success = await onSave(saveData);
    if (success) onClose();
  };

  const displayFields = fields.filter(key => key !== '_fields');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h2 className="text-xl font-semibold">Edit Record - {(record.lot as string) || `ID ${record.id}`}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayFields.map(key => {
              const col = allColumns.find((c: ColumnDef) => c.key === key);
              if (!col) return null;
              return (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{col.label}</label>
                  {col.key === 'notes_on_group' ? (
                    <textarea
                      value={(form[key] as string) || ''}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      className="w-full border rounded px-2 py-1 text-sm"
                      rows={3}
                    />
                  ) : (
                    <input
                      type={col.type === 'date' ? 'date' : col.type === 'datetime' ? 'datetime-local' : col.type === 'number' || col.type === 'currency' ? 'number' : 'text'}
                      step={col.type === 'currency' ? '0.01' : 'any'}
                      value={col.type === 'date' ? formatDateForInput(form[key]) : ((form[key] as string) ?? '')}
                      onChange={e => setForm({ ...form, [key]: e.target.value || null })}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
