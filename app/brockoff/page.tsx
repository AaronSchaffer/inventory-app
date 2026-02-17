'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { HomeCloseout } from '@/lib/types';
import { newGroupFields, newGroupTableColumns, getColumn } from '@/lib/columns';
import DataTable from '@/components/DataTable';
import EditModal from '@/components/EditModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

export default function BrockoffPage() {
  const [data, setData] = useState<HomeCloseout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [copyStatus, setCopyStatus] = useState('');
  const [pasteStatus, setPasteStatus] = useState('');
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pasteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
      setData((records || []).filter((r: HomeCloseout) => r.lot?.startsWith('B')));
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = Math.ceil(data.length / recordsPerPage);
  const paginatedData = data.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const handleSubmit = async () => {
    try {
      const lot = form.lot as string;
      if (!lot || !lot.startsWith('B')) {
        setError('Brockoff lot names must start with "B"');
        return;
      }
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

  const handleCopyToClipboard = async () => {
    try {
      const headers = newGroupTableColumns.map(key => getColumn(key)?.label || key).join('\t');
      const rows = data.map(record =>
        newGroupTableColumns.map(key => {
          const value = record[key as keyof HomeCloseout];
          return value === null || value === undefined ? '' : value;
        }).join('\t')
      ).join('\n');
      await navigator.clipboard.writeText(headers + '\n' + rows);
      setCopyStatus('Copied ' + data.length + ' records!');
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
        if (values.length >= newGroupTableColumns.length) {
          const newRecord: Record<string, unknown> = {};
          newGroupTableColumns.forEach((key, index) => {
            const value = values[index]?.trim();
            if (value && value !== '') newRecord[key] = value;
          });
          if (newRecord.lot) {
            const { error: insertError } = await supabase.from('home_closeouts').insert([newRecord]);
            if (!insertError) addedCount++;
          }
        }
      }
      setPasteStatus('Added ' + addedCount + ' records!');
      if (pasteTimerRef.current) clearTimeout(pasteTimerRef.current);
      pasteTimerRef.current = setTimeout(() => setPasteStatus(''), 3000);
      fetchData();
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
          <h2 className="text-xl font-semibold">Brockoff Groups</h2>
          <div className="flex gap-2 items-center">
            {copyStatus && <span className="text-sm text-green-600">{copyStatus}</span>}
            {pasteStatus && <span className="text-sm text-blue-600">{pasteStatus}</span>}
            <button onClick={handleCopyToClipboard} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-2" title="Copy all visible data to clipboard">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              Copy to Clipboard
            </button>
            <button onClick={handlePasteFromClipboard} className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-2" title="Paste data from clipboard">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
              Paste from Clipboard
            </button>
            <button onClick={fetchData} className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            </button>
            <button onClick={() => setShowAddForm(true)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Brockoff Group
            </button>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Add New Brockoff Group</h3>
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
                    placeholder={key === 'lot' ? 'B...' : ''}
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
        totalRecords={data.length}
        recordsPerPage={recordsPerPage}
        onPageChange={setCurrentPage}
        onEdit={(record) => setEditingRecord({ ...record, _fields: newGroupFields })}
        onDelete={(id) => setDeleteConfirm(id)}
        emptyMessage="No Brockoff groups found"
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
        <DeleteConfirmModal onConfirm={handleDelete} onCancel={() => setDeleteConfirm(null)} />
      )}
    </div>
  );
}
