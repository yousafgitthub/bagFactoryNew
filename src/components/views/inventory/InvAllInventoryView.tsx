'use client';

import React, { useMemo, useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { InventoryPageShell } from '../../inventory/InventoryPageShell';
import { InventoryDataTable } from '../../inventory/InventoryDataTable';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';
import { CATEGORY_LABELS } from '../../../data/inventory';
import { InventoryCategory, InventoryItem } from '../../../types/erp';
import { InventoryDetailModal } from '../InventoryDetailModal';
import { StockTransferModal, StockAdjustModal } from '../StockTransferModal';

const CATEGORY_PILLS: { id: InventoryCategory | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'All categories' },
  { id: 'NEW_BRANDED', label: CATEGORY_LABELS.NEW_BRANDED },
  { id: 'WASTE_PLASTIC', label: CATEGORY_LABELS.WASTE_PLASTIC },
  { id: 'RECYCLED_RAW', label: CATEGORY_LABELS.RECYCLED_RAW },
  { id: 'FINISHED_GOODS', label: CATEGORY_LABELS.FINISHED_GOODS },
];

export function InvAllInventoryView() {
  const { inventory, warehouses, searchQuery, setSearchQuery, setCurrentView } = useERP();
  const [category, setCategory] = useState<InventoryCategory | 'ALL'>('ALL');
  const [warehouse, setWarehouse] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [detail, setDetail] = useState<InventoryItem | null>(null);
  const [transferItem, setTransferItem] = useState<InventoryItem | null>(null);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);

  const rows = useMemo(() => {
    return inventory.filter((item) => {
      if (category !== 'ALL' && item.category !== category) return false;
      if (warehouse !== 'ALL' && item.warehouse !== warehouse) return false;
      if (status !== 'ALL' && item.status !== status) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const hay = `${item.name} ${item.batchNumber} ${item.supplier ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [inventory, category, warehouse, status, searchQuery]);

  return (
    <InventoryPageShell
      title="All Inventory"
      subtitle="Unified catalog across four material categories — search, filter, and paginate every stock line (kg, PKR)."
      actions={
        <Button variant="primary" size="sm" onClick={() => setCurrentView('inv-receive')}>
          Receive Stock
        </Button>
      }
    >
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_PILLS.map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setCategory(pill.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                category === pill.id ? 'bg-[#142238] text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="ALL">All warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.name}>
                {w.name}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="ALL">All statuses</option>
            <option value="Healthy">Healthy</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Critical">Critical</option>
          </select>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, batch, supplier…"
            className="flex-1 min-w-[200px] text-sm border border-slate-200 rounded-lg px-3 py-2"
          />
        </div>
      </div>

      <InventoryDataTable
        rows={rows}
        csvFileName="all-inventory"
        pageSize={12}
        columns={[
          { key: 'name', header: 'Material', render: (r) => r.name, csvValue: (r) => r.name },
          {
            key: 'cat',
            header: 'Category',
            render: (r) => CATEGORY_LABELS[r.category],
            csvValue: (r) => r.category,
          },
          { key: 'wh', header: 'Warehouse', render: (r) => r.warehouse, csvValue: (r) => r.warehouse },
          {
            key: 'qty',
            header: 'Available (kg)',
            render: (r) => r.availableKg.toLocaleString(),
            csvValue: (r) => r.availableKg,
          },
          {
            key: 'cost',
            header: 'Unit cost/kg',
            render: (r) => `Rs. ${r.unitCost}`,
            csvValue: (r) => r.unitCost,
          },
          {
            key: 'val',
            header: 'Value (PKR)',
            render: (r) => r.totalValue.toLocaleString(),
            csvValue: (r) => r.totalValue,
          },
          {
            key: 'batch',
            header: 'Batch / supplier',
            render: (r) => `${r.batchNumber} — ${r.supplier ?? 'Internal'}`,
            csvValue: (r) => r.batchNumber,
          },
          {
            key: 'status',
            header: 'Status',
            render: (r) => (
              <Badge variant={r.status === 'Healthy' ? 'success' : r.status === 'Low Stock' ? 'warning' : 'danger'}>
                {r.status}
              </Badge>
            ),
            csvValue: (r) => r.status,
          },
          {
            key: 'actions',
            header: '',
            render: (r) => (
              <button type="button" className="text-blue-600 text-xs font-semibold hover:underline" onClick={() => setDetail(r)}>
                Details
              </button>
            ),
          },
        ]}
      />

      <InventoryDetailModal
        item={detail}
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        onOpenAdjust={(item) => {
          setDetail(null);
          setAdjustItem(item);
        }}
        onOpenTransfer={(item) => {
          setDetail(null);
          setTransferItem(item);
        }}
      />
      <StockTransferModal item={transferItem} isOpen={!!transferItem} onClose={() => setTransferItem(null)} />
      <StockAdjustModal item={adjustItem} isOpen={!!adjustItem} onClose={() => setAdjustItem(null)} />
    </InventoryPageShell>
  );
}