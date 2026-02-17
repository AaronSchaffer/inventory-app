'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { GroupByPen } from '@/lib/types';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

export default function CattleByPenPage() {
  const [records, setRecords] = useState<GroupByPen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GroupByPen | null>(null);
  const [form, setForm] = useState({ group_name: '', pen_name: '', head: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const [pasteStatus, setPasteStatus] = useState('');
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pasteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('groups_by_pen').select('*').order('group_name', { ascending: true });
      if (fetchError) throw fetchError;
      setRecords(data || []);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleSubmit = async () => {
    try {
      const recordData = {
        group_name: form.group_name,
        pen_name: form.pen_name,
        head: form.head ? Number(form.head) : null,
      };
      if (editingRecord) {
        const { error: updateError } = await supabase.from('groups_by_pen').update(recordData).eq('id', editingRecord.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('groups_by_pen').insert([recordData]);
        if (insertError) throw insertError;
      }
      setShowAddForm(false);
      setEditingRecord(null);
      setForm({ group_name: '', pen_name: '', head: '' });
      fetchRecords();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  const handleEdit = (record: GroupByPen) => {
    setForm({
      group_name: record.group_name || '',
      pen_name: record.pen_name || '',
      head: record.head ? String(record.head) : '',
    });
    setEditingRecord(record);
    setShowAddForm(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const { error: deleteError } = await supabase.from('groups_by_pen').delete().eq('id', deleteConfirm);
      if (deleteError) throw deleteError;
      setDeleteConfirm(null);
      fetchRecords();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  const handleClearAll = async () => {
    if (records.length === 0) return;
    try {
      const ids = records.map(r => r.id);
      const { error: deleteError } = await supabase.from('groups_by_pen').delete().in('id', ids);
      if (deleteError) throw deleteError;
      setClearConfirm(false);
      fetchRecords();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const headers = ['Group Name', 'Pen Name', 'Head'].join('\t');
      const rows = records.map(r => [r.group_name || '', r.pen_name || '', r.head || ''].join('\t')).join('\n');
      await navigator.clipboard.writeText(headers + '\n' + rows);
      setCopyStatus('Copied ' + records.length + ' records!');
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopyStatus(''), 3000);
    } catch (err: unknown) {
      setCopyStatus('Copy failed: ' + (err as Error).message);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopyStatus(''), 3000);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const lines = clipboardText.trim().split('\n');
      if (lines.length < 2) {
        setPasteStatus('No data found in clipboard');
        if (pasteTimerRef.current) clearTimeout(pasteTimerRef.current);
        pasteTimerRef.current = setTimeout(() => setPasteStatus(''), 3000);
        return;
      }
      const dataRows = lines.slice(1);
      let addedCount = 0;
      for (const row of dataRows) {
        const values = row.split('\t');
        if (values.length >= 3) {
          const newRecord = {
            group_name: values[0]?.trim() || null,
            pen_name: values[1]?.trim() || null,
            head: values[2]?.trim() ? Number(values[2].trim()) : null,
          };
          if (newRecord.group_name || newRecord.pen_name) {
            const { error: insertError } = await supabase.from('groups_by_pen').insert([newRecord]);
            if (!insertError) addedCount++;
          }
        }
      }
      setPasteStatus('Added ' + addedCount + ' records!');
      if (pasteTimerRef.current) clearTimeout(pasteTimerRef.current);
      pasteTimerRef.current = setTimeout(() => setPasteStatus(''), 3000);
      fetchRecords();
    } catch (err: unknown) {
      setPasteStatus('Paste failed: ' + (err as Error).message);
      if (pasteTimerRef.current) clearTimeout(pasteTimerRef.current);
      pasteTimerRef.current = setTimeout(() => setPasteStatus(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="loader rounded-full h-12 w-12 border-4 border-gray-200 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading records...</p>
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
          <h2 className="text-xl font-semibold">Edit Cattle by Pen</h2>
          <div className="flex gap-2 items-center">
            {copyStatus && <span className="text-sm text-green-600">{copyStatus}</span>}
            {pasteStatus && <span className="text-sm text-blue-600">{pasteStatus}</span>}
            <button onClick={handleCopyToClipboard} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-2" title="Copy all data to clipboard">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              Copy
            </button>
            <button onClick={handlePasteFromClipboard} className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-2" title="Paste data from clipboard">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
              Paste
            </button>
            <button onClick={() => setClearConfirm(true)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2" title="Clear all records">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              Clear All
            </button>
            <button onClick={fetchRecords} className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            </button>
            <button onClick={() => setShowAddForm(true)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Record
            </button>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">{editingRecord ? 'Edit Record' : 'Add New Record'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
              <input type="text" value={form.group_name} onChange={e => setForm({ ...form, group_name: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="Enter group name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pen Name</label>
              <input type="text" value={form.pen_name} onChange={e => setForm({ ...form, pen_name: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="Enter pen name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Head</label>
              <input type="number" value={form.head} onChange={e => setForm({ ...form, head: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="Number of head" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => { setShowAddForm(false); setEditingRecord(null); setForm({ group_name: '', pen_name: '', head: '' }); }} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">{editingRecord ? 'Save Changes' : 'Add Record'}</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pen Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Head</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {records.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No records found</td></tr>
            ) : (
              records.map(record => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{record.group_name || '-'}</td>
                  <td className="px-4 py-3 text-sm">{record.pen_name || '-'}</td>
                  <td className="px-4 py-3 text-sm">{record.head ? record.head.toLocaleString() : '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(record)} className="text-blue-500 hover:text-blue-700 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    </button>
                    <button onClick={() => setDeleteConfirm(record.id)} className="text-red-500 hover:text-red-700">
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
        <DeleteConfirmModal onConfirm={handleDelete} onCancel={() => setDeleteConfirm(null)} />
      )}

      {clearConfirm && (
        <DeleteConfirmModal
          message={`Are you sure you want to delete ALL ${records.length} records? This action cannot be undone.`}
          onConfirm={handleClearAll}
          onCancel={() => setClearConfirm(false)}
        />
      )}
    </div>
  );
}
