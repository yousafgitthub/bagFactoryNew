'use client';

import React, { useMemo, useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { InventoryPageShell } from '../../inventory/InventoryPageShell';
import { InventoryDataTable } from '../../inventory/InventoryDataTable';

function parseMovementDay(dateStr: string): string {
  return dateStr.slice(0, 10);
}

export function InvMovementsView() {
  const { stockMovements } = useERP();
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filtered = useMemo(() => {
    return stockMovements.filter((m) => {
      if (typeFilter !== 'ALL' && m.type !== typeFilter) return false;
      const day = parseMovementDay(m.date);
      if (fromDate && day < fromDate) return false;
      if (toDate && day > toDate) return false;
      return true;
    });
  }, [stockMovements, typeFilter, fromDate, toDate]);

  const types = Array.from(new Set(stockMovements.map((m) => m.type)));

  return (
    <InventoryPageShell
      title="Movement Ledger"
      subtitle="Full audit trail — IN, OUT, TRANSFER, ADJUSTMENT, and production-linked movements with operator and cost detail."
    >
      <div className="flex flex-wrap gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
        >
          <option value="ALL">All movement types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <label className="text-xs text-slate-600 flex items-center gap-2">
          From
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-2 py-1.5"
          />
        </label>
        <label className="text-xs text-slate-600 flex items-center gap-2">
          To
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-2 py-1.5"
          />
        </label>
      </div>

      <InventoryDataTable
        rows={filtered.map((m) => ({ ...m, id: m.id }))}
        csvFileName="inventory-movements"
        pageSize={15}
        columns={[
          { key: 'date', header: 'Date', render: (r) => r.date, csvValue: (r) => r.date },
          { key: 'type', header: 'Type', render: (r) => r.type, csvValue: (r) => r.type },
          { key: 'item', header: 'Item', render: (r) => r.itemName, csvValue: (r) => r.itemName },
          { key: 'wh', header: 'Warehouse', render: (r) => r.warehouse, csvValue: (r) => r.warehouse },
          { key: 'qty', header: 'Qty (kg)', render: (r) => r.qtyKg, csvValue: (r) => r.qtyKg },
          {
            key: 'unit',
            header: 'Unit cost/kg',
            render: (r) => `Rs. ${r.unitCost}`,
            csvValue: (r) => r.unitCost,
          },
          { key: 'cost', header: 'Total PKR', render: (r) => r.totalCost.toLocaleString(), csvValue: (r) => r.totalCost },
          { key: 'op', header: 'Operator', render: (r) => r.operator, csvValue: (r) => r.operator },
          { key: 'ref', header: 'Reference', render: (r) => r.referenceNo, csvValue: (r) => r.referenceNo },
          { key: 'notes', header: 'Notes', render: (r) => r.notes ?? '—', csvValue: (r) => r.notes ?? '' },
        ]}
      />
    </InventoryPageShell>
  );
}