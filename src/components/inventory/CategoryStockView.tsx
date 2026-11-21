'use client';

import React, { useState } from 'react';
import { InventoryCategory } from '../../types/erp';
import { CATEGORY_LABELS } from '../../data/inventory';
import { InventoryPageShell } from './InventoryPageShell';
import { InventoryDataTable } from './InventoryDataTable';
import { useCategoryInventory } from './useCategoryInventory';
import { KPICard } from '../common/KPICard';
import { Badge } from '../common/Badge';
import { Boxes, AlertTriangle } from 'lucide-react';
import { InventoryDetailModal } from '../views/InventoryDetailModal';
import { InventoryItem } from '../../types/erp';
import { useERP } from '../../context/ERPContext';

interface CategoryStockViewProps {
  category: InventoryCategory;
}

export function CategoryStockView({ category }: CategoryStockViewProps) {
  const { setCurrentView, setSelectedEntityId } = useERP();
  const { items, totals, warehouseFilter, setWarehouseFilter, statusFilter, setStatusFilter, warehouseOptions } =
    useCategoryInventory(category);
  const [detail, setDetail] = useState<InventoryItem | null>(null);

  const label = CATEGORY_LABELS[category];

  return (
    <InventoryPageShell
      title={label}
      subtitle={`Dedicated stock ledger for ${label.toLowerCase()} — quantities in kg, valuation in PKR. No mixing across inventory categories.`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard title="On Hand" value={`${totals.qtyKg.toLocaleString()} kg`} icon={Boxes} highlightColor="blue" />
        <KPICard
          title="Valuation"
          value={`Rs. ${totals.valuePkr.toLocaleString()}`}
          icon={Boxes}
          highlightColor="navy"
        />
        <KPICard
          title="Alerts"
          value={String(totals.lowCount)}
          subtitle="Low / critical SKUs"
          icon={AlertTriangle}
          highlightColor={totals.lowCount > 0 ? 'amber' : 'green'}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={warehouseFilter}
          onChange={(e) => setWarehouseFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
        >
          <option value="ALL">All warehouses</option>
          {warehouseOptions.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
        >
          <option value="ALL">All statuses</option>
          <option value="Healthy">Healthy</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      <InventoryDataTable
        rows={items}
        csvFileName={`inventory-${category.toLowerCase()}`}
        columns={[
          { key: 'name', header: 'Material / Product', render: (r) => r.name, csvValue: (r) => r.name },
          { key: 'batch', header: 'Batch', render: (r) => r.batchNumber, csvValue: (r) => r.batchNumber },
          { key: 'wh', header: 'Warehouse', render: (r) => r.warehouse, csvValue: (r) => r.warehouse },
          {
            key: 'qty',
            header: 'Qty (kg)',
            render: (r) => r.availableKg.toLocaleString(),
            csvValue: (r) => r.availableKg,
          },
          {
            key: 'cost',
            header: 'Avg cost/kg',
            render: (r) => `Rs. ${r.unitCost}`,
            csvValue: (r) => r.unitCost,
          },
          {
            key: 'value',
            header: 'Value (PKR)',
            render: (r) => `Rs. ${r.totalValue.toLocaleString()}`,
            csvValue: (r) => r.totalValue,
          },
          {
            key: 'status',
            header: 'Status',
            render: (r) => (
              <Badge
                variant={
                  r.status === 'Healthy' ? 'success' : r.status === 'Low Stock' ? 'warning' : 'danger'
                }
              >
                {r.status}
              </Badge>
            ),
            csvValue: (r) => r.status,
          },
          {
            key: 'action',
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
          setSelectedEntityId(item.id);
          setDetail(null);
          setCurrentView('inv-adjustments');
        }}
        onOpenTransfer={(item) => {
          setSelectedEntityId(item.id);
          setDetail(null);
          setCurrentView('inv-transfer');
        }}
      />
    </InventoryPageShell>
  );
}