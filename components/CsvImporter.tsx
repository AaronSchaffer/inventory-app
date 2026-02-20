'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface CsvImporterProps {
  table: string;
  allowedFields: string[];
  onComplete: () => void;
  onError: (msg: string) => void;
}

export default function CsvImporter({ table, allowedFields, onComplete, onError }: CsvImporterProps) {
  const [showModal, setShowModal] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<number, string>>({});
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) {
        onError('CSV file must have a header row and at least one data row');
        return;
      }

      const headers = parseCsvLine(lines[0]);
      const rows = lines.slice(1).map(line => parseCsvLine(line));

      setCsvHeaders(headers);
      setCsvRows(rows);

      const autoMapping: Record<number, string> = {};
      headers.forEach((header, index) => {
        const normalized = header.toLowerCase().replace(/[\s\-\/]/g, '_').replace(/[^a-z0-9_]/g, '');
        const match = allowedFields.find(f => f === normalized || f === header);
        if (match) autoMapping[index] = match;
      });
      setMapping(autoMapping);
      setShowModal(true);
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (inQuotes) {
        if (char === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const mappedRows: Record<string, unknown>[] = [];
      for (const row of csvRows) {
        const record: Record<string, unknown> = {};
        let hasData = false;
        for (const [indexStr, field] of Object.entries(mapping)) {
          if (field === 'skip') continue;
          const index = Number(indexStr);
          const value = row[index]?.trim() ?? '';
          if (value !== '') {
            record[field] = value;
            hasData = true;
          }
        }
        if (hasData) mappedRows.push(record);
      }

      if (mappedRows.length === 0) {
        onError('No valid rows to import');
        setImporting(false);
        return;
      }

      for (let i = 0; i < mappedRows.length; i += 100) {
        const batch = mappedRows.slice(i, i + 100);
        const { error: insertError } = await supabase.from(table).insert(batch);
        if (insertError) throw insertError;
      }

      setShowModal(false);
      setCsvHeaders([]);
      setCsvRows([]);
      setMapping({});
      onComplete();
    } catch (err: unknown) {
      onError((err as Error).message);
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setCsvHeaders([]);
    setCsvRows([]);
    setMapping({});
  };

  const previewRows = csvRows.slice(0, 3);
  const mappedFieldCount = Object.values(mapping).filter(v => v && v !== 'skip').length;

  return (
    <>
      <label className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 flex items-center gap-2 cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
        Import Data
        <input ref={fileRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
      </label>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h2 className="text-xl font-semibold">Import CSV Data</h2>
              <button onClick={handleClose} className="p-1 hover:bg-gray-200 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <h3 className="font-semibold mb-3">Map CSV Columns to Fields</h3>
              <div className="space-y-2 mb-6">
                {csvHeaders.map((header, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="w-48 text-sm font-medium truncate" title={header}>{header}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    <select
                      value={mapping[index] || 'skip'}
                      onChange={e => setMapping({ ...mapping, [index]: e.target.value })}
                      className="flex-1 border rounded px-3 py-1.5 text-sm bg-white"
                    >
                      <option value="skip">-- Skip --</option>
                      {allowedFields.map(field => (
                        <option key={field} value={field}>{field}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {previewRows.length > 0 && mappedFieldCount > 0 && (
                <>
                  <h3 className="font-semibold mb-3">Preview (first {previewRows.length} rows)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.entries(mapping)
                            .filter(([, v]) => v && v !== 'skip')
                            .map(([indexStr, field]) => (
                              <th key={indexStr} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b">
                                {field}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, rowIdx) => (
                          <tr key={rowIdx} className="border-b">
                            {Object.entries(mapping)
                              .filter(([, v]) => v && v !== 'skip')
                              .map(([indexStr]) => (
                                <td key={indexStr} className="px-3 py-2 text-sm">
                                  {row[Number(indexStr)] || '-'}
                                </td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <span className="text-sm text-gray-600">
                {csvRows.length} rows, {mappedFieldCount} fields mapped
              </span>
              <div className="flex gap-2">
                <button onClick={handleClose} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                <button
                  onClick={handleImport}
                  disabled={importing || mappedFieldCount === 0}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
