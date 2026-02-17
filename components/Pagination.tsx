'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  recordsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, totalRecords, recordsPerPage, onPageChange }: PaginationProps) {
  const start = totalRecords > 0 ? (currentPage - 1) * recordsPerPage + 1 : 0;
  const end = Math.min(currentPage * recordsPerPage, totalRecords);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
      <div className="text-sm text-gray-600">
        Showing {start} - {end} of {totalRecords}
      </div>
      <div className="flex gap-2 items-center">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <span>Page {currentPage} of {totalPages || 1}</span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    </div>
  );
}
