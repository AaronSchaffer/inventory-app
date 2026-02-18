'use client';

import { useState, useMemo } from 'react';
import { HomeCloseout } from '@/lib/types';
import { newGroupFields, newGroupTableColumns, getColumn } from '@/lib/columns';
import { validate, homeCloseoutRules } from '@/lib/validation';
import { useSupabaseTable } from '@/hooks/useSupabaseTable';
import DataTable from '@/components/DataTable';
import EditModal from '@/components/EditModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import ErrorBanner from '@/components/ErrorBanner';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function NewGroupPage() {
  const { data: rawData, loading, error, setError, clearError, fetchData, insert, update, remove } =
    useSupabaseTable<HomeCloseout>({ table: 'home_closeouts', orderColumn: 'purchase_date', ascending: false });

  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const recordsPerPage = 15;

  const data = useMemo(() => rawData.filter(r => !r.lot?.startsWith('B')), [rawData]);
  const filteredData = data.filter(r => r.purchase_date);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const handleSubmit = async () => {
    const validationError = validate(form, homeCloseoutRules);
    if (validationError) { setError(validationError); return; }
    const success = await insert(form);
    if (success) { setShowAddForm(false); setForm({}); }
  };

  const handleSave = async (record: Record<string, unknown>) => {
    const validationError = validate(record, homeCloseoutRules);
    if (validationError) { setError(validationError); return false; }
    const { id, ...rest } = record;
    const success = await update(id as number, rest);
    if (success) setEditingRecord(null);
    return success;
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const success = await remove(deleteConfirm);
    if (success) setDeleteConfirm(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      {error && <ErrorBanner error={error} onDismiss={clearError} />}

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">New Group</h2>
          <div className="flex gap-2">
            <button onClick={fetchData} className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add New Group
            </button>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Add New Group</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {newGroupFields.map(key => {
              const col = getColumn(key);
              return (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{col?.label}</label>
                  <input
                    type={col?.type === 'date' ? 'date' : col?.type === 'number' || col?.type === 'currency' ? 'number' : 'text'}
                    step={col?.type === 'currency' ? '0.01' : 'any'}
                    value={(form[key] as string) ?? ''}
                    onChange={e => setForm({ ...form, [key]: e.target.value || null })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => { setShowAddForm(false); setForm({}); }} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Save Group</button>
          </div>
        </div>
      )}

      <DataTable
        columns={newGroupTableColumns}
        data={paginatedData as unknown as Record<string, unknown>[]}
        currentPage={currentPage}
        totalPages={totalPages}
        totalRecords={filteredData.length}
        recordsPerPage={recordsPerPage}
        onPageChange={setCurrentPage}
        onEdit={(record) => setEditingRecord({ ...record, _fields: newGroupFields })}
        onDelete={(id) => setDeleteConfirm(id)}
      />

      {editingRecord && (
        <EditModal
          record={editingRecord}
          fields={(editingRecord._fields as string[]) || newGroupFields}
          onSave={handleSave}
          onClose={() => setEditingRecord(null)}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmModal
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
