'use client';

import { useState, useMemo } from 'react';
import { HomeCloseout } from '@/lib/types';
import { keyDetailsFields, keyDetailsTableColumns } from '@/lib/columns';
import { validate, homeCloseoutRules } from '@/lib/validation';
import { useSupabaseTable } from '@/hooks/useSupabaseTable';
import DataTable from '@/components/DataTable';
import EditModal from '@/components/EditModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import ErrorBanner from '@/components/ErrorBanner';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function KeyDetailsPage() {
  const { data: rawData, loading, error, setError, clearError, fetchData, update, remove } =
    useSupabaseTable<HomeCloseout>({ table: 'home_closeouts', orderColumn: 'purchase_date', ascending: false });

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const recordsPerPage = 15;

  const data = useMemo(() => rawData.filter(r => !r.lot?.startsWith('B')), [rawData]);

  const baseFilteredData = data.filter(record => {
    if (!record.purchase_date) return false;
    const died = Number(record.died) || 0;
    const hdSold = Number(record.hd_sold) || 0;
    const hdPurchased = Number(record.hd_purchased) || 0;
    return (died + hdSold) < hdPurchased;
  });

  const filteredData = baseFilteredData.filter(record => {
    const s = searchTerm.toLowerCase();
    return (
      record.lot?.toLowerCase().includes(s) ||
      record.origin?.toLowerCase().includes(s) ||
      record.notes_on_group?.toLowerCase().includes(s)
    );
  });

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

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
          <h2 className="text-xl font-semibold">Edit Key Group Details</h2>
          <div className="flex gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-4 py-2 border rounded w-48"
              />
            </div>
            <button onClick={fetchData} className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            </button>
          </div>
        </div>
      </div>

      <DataTable
        columns={keyDetailsTableColumns}
        data={paginatedData as unknown as Record<string, unknown>[]}
        currentPage={currentPage}
        totalPages={totalPages}
        totalRecords={filteredData.length}
        recordsPerPage={recordsPerPage}
        onPageChange={setCurrentPage}
        onEdit={(record) => setEditingRecord({ ...record, _fields: keyDetailsFields })}
        onDelete={(id) => setDeleteConfirm(id)}
        notesColumn="notes_on_group"
      />

      {editingRecord && (
        <EditModal
          record={editingRecord}
          fields={(editingRecord._fields as string[]) || keyDetailsFields}
          onSave={handleSave}
          onClose={() => setEditingRecord(null)}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmModal onConfirm={handleDelete} onCancel={() => setDeleteConfirm(null)} />
      )}
    </div>
  );
}
