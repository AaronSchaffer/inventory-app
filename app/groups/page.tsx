'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { HomeCloseout } from '@/lib/types';
import { allColumns, newGroupFields, newGroupTableColumns, formatValue, getColumn } from '@/lib/columns';
import DataTable from '@/components/DataTable';
import EditModal from '@/components/EditModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

export default function NewGroupPage() {
  const [data, setData] = useState<HomeCloseout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const recordsPerPage = 15;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: records, error: fetchError } = await supabase
        .from('home_closeouts')
        .select('*')
        .order('purchase_date', { ascending: false });
      if (fetchError) throw fetchError;
      setData((records || []).filter((r: HomeCloseout) => !r.lot?.startsWith('B')));
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredData = data.filter(r => r.purchase_date);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const handleSubmit = async () => {
    try {
      const { error: insertError } = await supabase.from('home_closeouts').insert([form]);
      if (insertError) throw insertError;
      setShowAddForm(false);
      setForm({});
      fetchData();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  const handleSave = async (record: Record<string, unknown>) => {
    try {
      const { error: updateError } = await supabase.from('home_closeouts').update(record).eq('id', record.id);
      if (updateError) throw updateError;
      setEditingRecord(null);
      fetchData();
      return true;
    } catch (err: unknown) {
      setError((err as Error).message);
      return false;
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const { error: deleteError } = await supabase.from('home_closeouts').delete().eq('id', deleteConfirm);
      if (deleteError) throw deleteError;
      setDeleteConfirm(null);
      fetchData();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="loader rounded-full h-12 w-12 border-4 border-gray-200 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
          <button onClick={() => setError(null)} className="float-right font-bold">&times;</button>
        </div>
      )}

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
