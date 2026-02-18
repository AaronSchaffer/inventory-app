'use client';

import { useState } from 'react';
import { HedgingRecord } from '@/lib/types';
import { validate, hedgingRules } from '@/lib/validation';
import { useSupabaseTable } from '@/hooks/useSupabaseTable';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import ErrorBanner from '@/components/ErrorBanner';
import LoadingSpinner from '@/components/LoadingSpinner';

function formatFuturesMonth(dateValue: string | null): string {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[date.getMonth()] + date.getFullYear().toString().slice(-2);
}

function parseFuturesMonthForInput(dateValue: string | null): string {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  return date.toISOString().slice(0, 7);
}

export default function HedgingPage() {
  const { data: records, loading, error, setError, clearError, fetchData, insert, update, remove } =
    useSupabaseTable<HedgingRecord>({ table: 'hedging', orderColumn: 'futures_month', ascending: true });

  const [showAddForm, setShowAddForm] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<HedgingRecord | null>(null);
  const [form, setForm] = useState({ futures_month: '', positions: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleSubmit = async (cattleType: string) => {
    const recordData = {
      cattle_type: cattleType,
      futures_month: form.futures_month ? form.futures_month + '-01' : null,
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
      setShowAddForm(null);
      setEditingRecord(null);
      setForm({ futures_month: '', positions: '' });
    }
  };

  const handleEdit = (record: HedgingRecord, cattleType: string) => {
    setForm({
      futures_month: parseFuturesMonthForInput(record.futures_month),
      positions: record.positions ? String(record.positions) : '',
    });
    setEditingRecord(record);
    setShowAddForm(cattleType);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const success = await remove(deleteConfirm);
    if (success) setDeleteConfirm(null);
  };

  const handleCancel = () => {
    setShowAddForm(null);
    setEditingRecord(null);
    setForm({ futures_month: '', positions: '' });
  };

  const feederCattleRecords = records.filter(r => r.cattle_type === 'Feeder Cattle');
  const liveCattleRecords = records.filter(r => r.cattle_type === 'Live Cattle');

  const HedgingTable = ({ title, data, cattleType }: { title: string; data: HedgingRecord[]; cattleType: string }) => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
        <h3 className="font-semibold text-lg">{title}</h3>
        <button onClick={() => setShowAddForm(cattleType)} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-1 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add
        </button>
      </div>

      {showAddForm === cattleType && (
        <div className="p-4 bg-blue-50 border-b">
          <h4 className="font-medium mb-3">{editingRecord ? 'Edit Position' : 'Add New Position'}</h4>
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Futures Month</label>
              <input type="month" value={form.futures_month} onChange={e => setForm({ ...form, futures_month: e.target.value })} className="border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Positions</label>
              <input type="number" value={form.positions} onChange={e => setForm({ ...form, positions: e.target.value })} className="border rounded px-3 py-2 w-32" placeholder="# of positions" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleCancel} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
              <button onClick={() => handleSubmit(cattleType === 'feeder' ? 'Feeder Cattle' : 'Live Cattle')} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                {editingRecord ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Futures Month</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Positions</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">No positions found</td></tr>
          ) : (
            data.map(record => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{formatFuturesMonth(record.futures_month)}</td>
                <td className="px-4 py-3 text-sm">{record.positions?.toLocaleString() || '-'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(record, cattleType)} className="text-blue-500 hover:text-blue-700 mr-2">
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
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Hedging</h2>
          <button onClick={fetchData} className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          </button>
        </div>
      </div>

      {error && <ErrorBanner error={error} onDismiss={clearError} />}

      {loading ? (
        <LoadingSpinner message="Loading hedging data..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HedgingTable title="Feeder Cattle" data={feederCattleRecords} cattleType="feeder" />
          <HedgingTable title="Live Cattle" data={liveCattleRecords} cattleType="live" />
        </div>
      )}

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
