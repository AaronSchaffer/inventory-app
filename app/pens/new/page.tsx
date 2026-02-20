'use client';

import { useState } from 'react';
import { Pen } from '@/lib/types';
import { validate, penRules } from '@/lib/validation';
import { useSupabaseTable } from '@/hooks/useSupabaseTable';
import ErrorBanner from '@/components/ErrorBanner';
import LoadingSpinner from '@/components/LoadingSpinner';

const penTypes = ['N/A', 'Open Lot', 'Lot with Shed', 'Confinement'];

export default function NewPenPage() {
  const { data: pens, loading, error, setError, clearError, fetchData, insert } =
    useSupabaseTable<Pen>({ table: 'pens', orderColumn: 'pen_name', ascending: true });

  const [form, setForm] = useState({ pen_name: '', pen_square_feet: '', pen_type: 'Open Lot', pre_ship: false, bunk_space_ft: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const resetForm = () => setForm({ pen_name: '', pen_square_feet: '', pen_type: 'Open Lot', pre_ship: false, bunk_space_ft: '' });

  const handleSubmit = async () => {
    if (form.pre_ship && form.pen_name?.toUpperCase().startsWith('B')) {
      setError('Pre-Ship pens cannot have a name starting with "B"');
      return;
    }
    const validationError = validate(form, penRules);
    if (validationError) { setError(validationError); return; }

    const payload = { ...form, pen_square_feet: form.pen_square_feet ? Number(form.pen_square_feet) : null, bunk_space_ft: form.bunk_space_ft ? Math.floor(Number(form.bunk_space_ft)) : null };
    const success = await insert(payload);
    if (success) {
      setShowAddForm(false);
      resetForm();
    }
  };

  if (loading) return <LoadingSpinner message="Loading pens..." />;

  return (
    <div className="space-y-4">
      {error && <ErrorBanner error={error} onDismiss={clearError} />}

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">New Pen</h2>
          <div className="flex gap-2">
            <button onClick={fetchData} className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            </button>
            <button onClick={() => { resetForm(); setShowAddForm(true); }} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Pen
            </button>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Add New Pen</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pen Name</label>
              <input type="text" value={form.pen_name} onChange={e => setForm({ ...form, pen_name: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="Enter pen name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pen Sq Foot</label>
              <input type="number" value={form.pen_square_feet} onChange={e => setForm({ ...form, pen_square_feet: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="Square footage" />
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
            <button onClick={() => { setShowAddForm(false); resetForm(); }} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Add Pen</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pen Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sq Foot</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pen Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bunk Space (ft)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pre-Ship</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pens.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No pens found. Click &quot;Add Pen&quot; to create one.</td></tr>
            ) : (
              pens.map(pen => (
                <tr key={pen.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{pen.pen_name || '-'}</td>
                  <td className="px-4 py-3 text-sm">{pen.pen_square_feet ? Number(pen.pen_square_feet).toLocaleString() : '-'}</td>
                  <td className="px-4 py-3 text-sm">{pen.pen_type || '-'}</td>
                  <td className="px-4 py-3 text-sm">{pen.bunk_space_ft ? Number(pen.bunk_space_ft).toLocaleString() : '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    {pen.pre_ship ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Yes</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">No</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
