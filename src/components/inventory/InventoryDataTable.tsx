'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '../common/Button';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

export interface InventoryTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  csvValue?: (row: T) => string | number;
}

interface InventoryDataTableProps<T> {
  rows: T[];
  columns: InventoryTableColumn<T>[];
  csvFileName: string;
  pageSize?: number;
  emptyMessage?: string;
}

export function InventoryDataTable<T extends { id: string }>({
  rows,
  columns,
  csvFileName,
  pageSize = 10,
  emptyMessage = 'No records match your filters.',
}: InventoryDataTableProps<T>) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);

  const pageRows = useMemo(() => {
    const start = safePage * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, safePage, pageSize]);

  const handleExport = () => {
    const headers = columns.map((c) => c.header);
    const data = rows.map((row) =>
      columns.map((c) => (c.csvValue ? c.csvValue(row) : String(c.render(row))))
    );
    exportToCSV(csvFileName, headers, data);
  };

  React.useEffect(() => {
    setPage(0);
  }, [rows.length]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80">
        <p className="text-xs text-slate-600">
          Showing <span className="font-semibold text-slate-800">{rows.length}</span> record
          {rows.length === 1 ? '' : 's'}
        </p>
        <Button variant="ghost" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={handleExport}>
          Export CSV
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 bg-slate-50 border-b border-slate-100">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-semibold whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-500 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={row.id} className="border-b border-slate-50 hover:bg-blue-50/40 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {rows.length > pageSize && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-600">
          <span>
            Page {safePage + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={safePage === 0}
              icon={<ChevronLeft className="w-4 h-4" />}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Prev
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={safePage >= totalPages - 1}
              icon={<ChevronRight className="w-4 h-4" />}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}