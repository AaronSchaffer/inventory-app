'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Pen } from '@/lib/types';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

const penTypes = ['Open Lot', 'Lot with Shed', 'Confinement'];

export default function PensPage() {
  const [pens, setPens] = useState<Pen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPen, setEditingPen] = useState<Pen | null>(null);
  const [form, setForm] = useState({ pen_name: '', pen_square_feet: '', pen_type: 'Open Lot', pre_ship: false });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchPens = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: records, error: fetchError } = await supabase
        .from('pens').select('*').order('pen_name', { ascending: true });
      if (fetchError) throw fetchError;
      setPens(records || []);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPens(); }, []);

  const resetForm = () => setForm({ pen_name: '', pen_square_feet: '', pen_type: 'Open Lot', pre_ship: false });

  const handleSubmit = async () => {
    try {
      if (form.pre_ship && form.pen_name?.toUpperCase().startsWith('B')) {
        setError('Pre-Ship pens cannot have a name starting with "B"');
        return;
      }
      const payload = { ...form, pen_square_feet: form.pen_square_feet ? Number(form.pen_square_feet) : null };
      if (editingPen) {
        const { error: updateError } = await supabase.from('pens').update(payload).eq('id', editingPen.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('pens').insert([payload]);
        if (insertError) throw insertError;
      }
      setShowAddForm(false);
      setEditingPen(null);
      resetForm();
      fetchPens();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  const handleEdit = (pen: Pen) => {
    setForm({
      pen_name: pen.pen_name || '',
      pen_square_feet: pen.pen_square_feet ? String(pen.pen_square_feet) : '',
      pen_type: pen.pen_type || 'Open Lot',
      pre_ship: pen.pre_ship || false,
    });
    setEditingPen(pen);
    setShowAddForm(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const { error: deleteError } = await supabase.from('pens').delete().eq('id', deleteConfirm);
      if (deleteError) throw deleteError;
      setDeleteConfirm(null);
      fetchPens();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="loader rounded-full h-12 w-12 border-4 border-gray-200 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading pens...</p>
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
          <h2 className="text-xl font-semibold">Edit Pens</h2>
          <div className="flex gap-2">
            <button onClick={fetchPens} className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            </button>
            <button onClick={() => { resetForm(); setEditingPen(null); setShowAddForm(true); }} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Pen
            </button>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">{editingPen ? 'Edit Pen' : 'Add New Pen'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer mt-6">
                <input type="checkbox" checked={form.pre_ship} onChange={e => setForm({ ...form, pre_ship: e.target.checked })} className="w-5 h-5 rounded border-gray-300" />
                <span className="text-sm font-medium text-gray-700">Pre-Ship</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => { setShowAddForm(false); setEditingPen(null); resetForm(); }} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">{editingPen ? 'Save Changes' : 'Add Pen'}</button>
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pre-Ship</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
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
