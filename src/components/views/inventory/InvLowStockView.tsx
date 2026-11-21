'use client';

import React, { useMemo, useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { InventoryPageShell } from '../../inventory/InventoryPageShell';
import { InventoryDataTable } from '../../inventory/InventoryDataTable';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';
import { CATEGORY_LABELS } from '../../../data/inventory';
import { InventoryCategory } from '../../../types/erp';

export function InvLowStockView() {
  const { inventory, warehouses, setCurrentView } = useERP();
  const [category, setCategory] = useState<InventoryCategory | 'ALL'>('ALL');
  const [warehouse, setWarehouse] = useState('ALL');

  const alerts = useMemo(() => {
    return inventory
      .filter((i) => i.status === 'Low Stock' || i.status === 'Critical')
      .filter((i) => (category === 'ALL' ? true : i.category === category))
      .filter((i) => (warehouse === 'ALL' ? true : i.warehouse === warehouse))
      .map((i) => ({
        ...i,
        shortageKg: Math.max(0, i.reorderLevelKg - i.availableKg),
      }));
  }, [inventory, category, warehouse]);

  return (
    <InventoryPageShell
      title="Low Stock Alerts"
      subtitle="SKUs below reorder threshold — shortage gap in kg with quick receive action."
    >
      <div className="flex flex-wrap gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as InventoryCategory | 'ALL')}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
        >
          <option value="ALL">All categories</option>
          {(Object.keys(CATEGORY_LABELS) as InventoryCategory[]).map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
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
      </div>

      <InventoryDataTable
        rows={alerts}
        csvFileName="low-stock-alerts"
        pageSize={10}
        columns={[
          { key: 'name', header: 'Material', render: (r) => r.name, csvValue: (r) => r.name },
          { key: 'code', header: 'Batch', render: (r) => r.batchNumber, csvValue: (r) => r.batchNumber },
          {
            key: 'cat',
            header: 'Category',
            render: (r) => CATEGORY_LABELS[r.category],
            csvValue: (r) => r.category,
          },
          { key: 'wh', header: 'Warehouse', render: (r) => r.warehouse, csvValue: (r) => r.warehouse },
          {
            key: 'avail',
            header: 'Available (kg)',
            render: (r) => r.availableKg.toLocaleString(),
            csvValue: (r) => r.availableKg,
          },
          {
            key: 'min',
            header: 'Min reorder (kg)',
            render: (r) => r.reorderLevelKg.toLocaleString(),
            csvValue: (r) => r.reorderLevelKg,
          },
          {
            key: 'gap',
            header: 'Shortage (kg)',
            render: (r) => r.shortageKg.toLocaleString(),
            csvValue: (r) => r.shortageKg,
          },
          {
            key: 'status',
            header: 'Status',
            render: (r) => (
              <Badge variant={r.status === 'Low Stock' ? 'warning' : 'danger'}>{r.status}</Badge>
            ),
            csvValue: (r) => r.status,
          },
          {
            key: 'act',
            header: '',
            render: () => (
              <Button variant="outline" size="sm" onClick={() => setCurrentView('inv-receive')}>
                Quick receive
              </Button>
            ),
          },
        ]}
      />
    </InventoryPageShell>
  );
}