'use client';

import { useState } from 'react';
import { HedgingRecord } from '@/lib/types';
import { validate, hedgingRules } from '@/lib/validation';
import { useSupabaseTable } from '@/hooks/useSupabaseTable';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import ErrorBanner from '@/components/ErrorBanner';
import LoadingSpinner from '@/components/LoadingSpinner';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatFuturesMonth(dateValue: string | null): string {
  if (!dateValue) return '-';
  const parts = dateValue.split('-');
  const monthIndex = parseInt(parts[1], 10) - 1;
  const year = parts[0].slice(-2);
  return MONTH_NAMES[monthIndex] + year;
}

function parseFuturesMonthForForm(dateValue: string | null): { month: string; year: string } {
  if (!dateValue) return { month: '', year: '' };
  const parts = dateValue.split('-');
  return { month: String(parseInt(parts[1], 10)), year: parts[0] };
}

export default function FeederCattlePage() {
  const { data: records, loading, error, setError, clearError, fetchData, insert, update, remove } =
    useSupabaseTable<HedgingRecord>({ table: 'hedging', orderColumn: 'futures_month', ascending: true });

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HedgingRecord | null>(null);
  const [form, setForm] = useState({ futures_month_m: '', futures_month_y: '', positions: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const feederRecords = records.filter(r => r.cattle_type === 'Feeder Cattle');

  const handleSubmit = async () => {
    const futuresMonth = form.futures_month_m && form.futures_month_y
      ? `${form.futures_month_y}-${form.futures_month_m.padStart(2, '0')}-01`
      : null;
    const recordData = {
      cattle_type: 'Feeder Cattle',
      futures_month: futuresMonth,
      positions: form.positions ? Number(form.positions) : null,
    };
    const validationError = validate(recordData, hedgingRules);
    if (validationError) { setError(validationError); return; }

    let success: boolean;
    if (editingRecord) {
      success = await update(editingRecord.id, recordData);
    } else {
      success = await insert(recordData);
    }
    if (success) {
      setShowAddForm(false);
      setEditingRecord(null);
      setForm({ futures_month_m: '', futures_month_y: '', positions: '' });
    }
  };

  const handleEdit = (record: HedgingRecord) => {
    const parsed = parseFuturesMonthForForm(record.futures_month);
    setForm({
      futures_month_m: parsed.month,
      futures_month_y: parsed.year,
      positions: record.positions ? String(record.positions) : '',
    });
    setEditingRecord(record);
    setShowAddForm(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const success = await remove(deleteConfirm);
    if (success) setDeleteConfirm(null);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingRecord(null);
    setForm({ futures_month_m: '', futures_month_y: '', positions: '' });
  };

  if (loading) return <LoadingSpinner message="Loading feeder cattle data..." />;

  return (
    <div className="space-y-4">
      {error && <ErrorBanner error={error} onDismiss={clearError} />}

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Feeder Cattle Hedging</h2>
          <div className="flex gap-2">
            <button onClick={fetchData} className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            </button>
            <button onClick={() => setShowAddForm(true)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Position
            </button>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">{editingRecord ? 'Edit Position' : 'Add New Position'}</h3>
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Futures Month</label>
              <div className="flex gap-2">
                <select value={form.futures_month_m} onChange={e => setForm({ ...form, futures_month_m: e.target.value })} className="border rounded px-3 py-2 bg-white">
                  <option value="">Month</option>
                  {MONTH_NAMES.map((name, i) => (
                    <option key={i} value={String(i + 1)}>{name}</option>
                  ))}
                </select>
                <select value={form.futures_month_y} onChange={e => setForm({ ...form, futures_month_y: e.target.value })} className="border rounded px-3 py-2 bg-white">
                  <option value="">Year</option>
                  {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i - 1).map(y => (
                    <option key={y} value={String(y)}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Positions</label>
              <input type="number" value={form.positions} onChange={e => setForm({ ...form, positions: e.target.value })} className="border rounded px-3 py-2 w-32" placeholder="# of positions" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleCancel} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                {editingRecord ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Futures Month</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Positions</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {feederRecords.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">No feeder cattle positions found</td></tr>
            ) : (
              feederRecords.map(record => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{formatFuturesMonth(record.futures_month)}</td>
                  <td className="px-4 py-3 text-sm">{record.positions?.toLocaleString() || '-'}</td>
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
        <DeleteConfirmModal
          message="Are you sure you want to delete this position? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
