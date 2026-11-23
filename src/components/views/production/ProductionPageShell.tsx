'use client';

import React from 'react';

interface ProductionPageShellProps {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function ProductionPageShell({ title, subtitle, actions, children }: ProductionPageShellProps) {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B] tracking-tight">{title}</h2>
          <p className="text-xs text-[#64748B] max-w-2xl">{subtitle}</p>
        </div>
        {actions ? <div className="flex items-center gap-2 flex-wrap">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

interface BatchTableProps {
  headers: string[];
  rows: (string | number)[][];
  onRowClick?: (index: number) => void;
  rowClass?: (index: number) => string;
}

export function BatchTable({ headers, rows, onRowClick, rowClass }: BatchTableProps) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#F1F5F9] text-[#64748B] uppercase tracking-wide">
              {headers.map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-4 py-8 text-center text-[#94A3B8]">
                  No records match the current filters.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={i}
                  className={`border-t border-[#F1F5F9] hover:bg-[#F8FAFC] ${onRowClick ? 'cursor-pointer' : ''} ${rowClass?.(i) || ''}`}
                  onClick={() => onRowClick?.(i)}
                >
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-3 text-[#334155] whitespace-nowrap">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}