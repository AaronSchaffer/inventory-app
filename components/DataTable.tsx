'use client';

import { allColumns } from '@/lib/columns';
import { formatValue } from '@/lib/columns';
import Pagination from './Pagination';

interface DataTableProps {
  columns: string[];
  data: Record<string, unknown>[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  recordsPerPage: number;
  onPageChange: (page: number) => void;
  onEdit?: (record: Record<string, unknown>) => void;
  onDelete?: (id: number) => void;
  scrollable?: boolean;
  notesColumn?: string;
  emptyMessage?: string;
}

export default function DataTable({
  columns,
  data,
  currentPage,
  totalPages,
  totalRecords,
  recordsPerPage,
  onPageChange,
  onEdit,
  onDelete,
  scrollable,
  notesColumn,
  emptyMessage = 'No records found',
}: DataTableProps) {
  const tableContent = (
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          {columns.map(key => {
            const col = allColumns.find(c => c.key === key);
            return (
              <th key={key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                {col?.label || key}
              </th>
            );
          })}
          {(onEdit || onDelete) && (
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-4 py-8 text-center text-gray-500">
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map(record => (
            <tr key={record.id as number} className="hover:bg-gray-50">
              {columns.map(key => {
                const col = allColumns.find(c => c.key === key);
                const value = record[key];
                let display: string;
                if (notesColumn && key === notesColumn) {
                  const text = (value as string) || '';
                  display = text.length > 30 ? text.substring(0, 30) + '...' : text || '-';
                } else {
                  display = formatValue(value, col?.type);
                }
                return (
                  <td key={key} className="px-4 py-3 text-sm whitespace-nowrap">
                    {display}
                  </td>
                );
              })}
              {(onEdit || onDelete) && (
                <td className="px-4 py-3 text-right">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(record)}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(record.id as number)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {scrollable ? <div className="overflow-x-auto">{tableContent}</div> : tableContent}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalRecords={totalRecords}
        recordsPerPage={recordsPerPage}
        onPageChange={onPageChange}
      />
    </div>
  );
}
