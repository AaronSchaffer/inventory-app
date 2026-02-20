'use client';

import { useState } from 'react';
import { Pen } from '@/lib/types';
import { validate, penRules } from '@/lib/validation';
import { useSupabaseTable } from '@/hooks/useSupabaseTable';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import ErrorBanner from '@/components/ErrorBanner';
import LoadingSpinner from '@/components/LoadingSpinner';

const penTypes = ['N/A', 'Open Lot', 'Lot with Shed', 'Confinement'];

export default function PenKeyDetailsPage() {
  const { data: pens, loading, error, setError, clearError, fetchData, update, remove } =
    useSupabaseTable<Pen>({ table: 'pens', orderColumn: 'pen_name', ascending: true });

  const [editingPen, setEditingPen] = useState<Pen | null>(null);
  const [form, setForm] = useState({ pen_name: '', pen_type: 'Open Lot', bunk_space_ft: '', pre_ship: false });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPens = pens.filter(pen => {
    const s = searchTerm.toLowerCase();
    return (
      pen.pen_name?.toLowerCase().includes(s) ||
      pen.pen_type?.toLowerCase().includes(s)
    );
  });

  const handleEdit = (pen: Pen) => {
    setForm({
      pen_name: pen.pen_name || '',
      pen_type: pen.pen_type || 'Open Lot',
      bunk_space_ft: pen.bunk_space_ft ? String(pen.bunk_space_ft) : '',
      pre_ship: pen.pre_ship || false,
    });
    setEditingPen(pen);
  };

  const handleSubmit = async () => {
    if (!editingPen) return;
    if (form.pre_ship && form.pen_name?.toUpperCase().startsWith('B')) {
      setError('Pre-Ship pens cannot have a name starting with "B"');
      return;
    }
    const validationError = validate(form, penRules);
    if (validationError) { setError(validationError); return; }

    const payload = { pen_name: form.pen_name, pen_type: form.pen_type, bunk_space_ft: form.bunk_space_ft ? Math.floor(Number(form.bunk_space_ft)) : null, pre_ship: form.pre_ship };
    const success = await update(editingPen.id, payload);
    if (success) {
      setEditingPen(null);
      setForm({ pen_name: '', pen_type: 'Open Lot', bunk_space_ft: '', pre_ship: false });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const success = await remove(deleteConfirm);
    if (success) setDeleteConfirm(null);
  };

  if (loading) return <LoadingSpinner message="Loading pens..." />;

  return (
    <div className="space-y-4">
      {error && <ErrorBanner error={error} onDismiss={clearError} />}

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Edit Key Pen Details</h2>
          <div className="flex gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded w-48"
              />
            </div>
            <button onClick={fetchData} className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            </button>
          </div>
        </div>
      </div>

      {editingPen && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Edit Key Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pen Name</label>
              <input type="text" value={form.pen_name} onChange={e => setForm({ ...form, pen_name: e.target.value })} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pen Type</label>
              <select value={form.pen_type} onChange={e => setForm({ ...form, pen_type: e.target.value })} className="w-full border rounded px-3 py-2 bg-white">
                {penTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bunk Space (ft)</label>
              <input type="number" step="1" min="0" max="999" value={form.bunk_space_ft} onChange={e => setForm({ ...form, bunk_space_ft: e.target.value.replace(/\D/g, '') })} className="w-full border rounded px-3 py-2" placeholder="Linear feet" />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer mt-6">
                <input type="checkbox" checked={form.pre_ship} onChange={e => setForm({ ...form, pre_ship: e.target.checked })} className="w-5 h-5 rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Pre-Ship</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => { setEditingPen(null); }} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Save Changes</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pen Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pen Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bunk Space (ft)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pre-Ship</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPens.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No pens found.</td></tr>
            ) : (
              filteredPens.map(pen => (
                <tr key={pen.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{pen.pen_name || '-'}</td>
                  <td className="px-4 py-3 text-sm">{pen.pen_type || '-'}</td>
                  <td className="px-4 py-3 text-sm">{pen.bunk_space_ft ? Number(pen.bunk_space_ft).toLocaleString() : '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    {pen.pre_ship ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Yes</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(pen)} className="text-blue-500 hover:text-blue-700 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    </button>
                    <button onClick={() => setDeleteConfirm(pen.id)} className="text-red-500 hover:text-red-700">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteConfirm && (
        <DeleteConfirmModal message="Are you sure you want to delete this pen? This action cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteConfirm(null)} />
      )}
    </div>
  );
}
