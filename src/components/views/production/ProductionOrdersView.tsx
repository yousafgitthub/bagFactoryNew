'use client';

import React, { useMemo, useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import type { ProductionPriority, ProductionSource } from '../../../types/erp';
import { ProductionPageShell, BatchTable } from './ProductionPageShell';
import { ProductionOrderStatusBadge } from './ProductionStatusBadge';
import { Button } from '../../common/Button';

export function ProductionOrdersView() {
  const {
    productionOrders,
    upsertProductionOrder,
    updateProductionOrderStatus,
    convertOrderToBatch,
    setCurrentView,
    setSelectedEntityId,
  } = useERP();
  const [form, setForm] = useState({
    brand: 'Crystal',
    color: 'White',
    productName: 'Crystal Shopping Bags',
    plannedQtyKg: 300,
    materialSource: 'NEW' as ProductionSource,
    priority: 'Normal' as ProductionPriority,
    plannedProductionDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const rows = useMemo(() => productionOrders, [productionOrders]);

  return (
    <ProductionPageShell
      title="Production Orders"
      subtitle="Orders link to batches — duplicate active batches per order are blocked."
      actions={
        <Button
          size="sm"
          onClick={() =>
            upsertProductionOrder({
              orderDate: new Date().toISOString().split('T')[0],
              plannedProductionDate: form.plannedProductionDate,
              brand: form.brand,
              productName: form.productName,
              color: form.color,
              plannedQtyKg: form.plannedQtyKg,
              materialSource: form.materialSource,
              priority: form.priority,
              status: 'Draft',
              notes: form.notes,
            })
          }
        >
          Create order
        </Button>
      }
    >
      <div className="grid md:grid-cols-3 gap-2 text-xs">
        <input className="border rounded p-2" placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
        <input className="border rounded p-2" type="number" placeholder="Qty kg" value={form.plannedQtyKg} onChange={(e) => setForm({ ...form, plannedQtyKg: +e.target.value })} />
        <select className="border rounded p-2" value={form.materialSource} onChange={(e) => setForm({ ...form, materialSource: e.target.value as ProductionSource })}>
          <option value="NEW">New Raw</option>
          <option value="RECYCLED">Recycled</option>
        </select>
      </div>
      <BatchTable
        headers={['Order #', 'Date', 'Product', 'Qty', 'Source', 'Priority', 'Status', '']}
        rows={rows.map((o) => [
          o.orderNumber,
          o.orderDate,
          `${o.brand} ${o.color}`,
          o.plannedQtyKg,
          o.materialSource,
          o.priority,
          o.status,
          '',
        ])}
      />
      <div className="flex flex-wrap gap-2">
        {rows.map((o) => (
          <OrderChip key={o.id} className="flex items-center gap-2 text-xs border rounded-lg px-3 py-2 bg-white">
            <ProductionOrderStatusBadge status={o.status} />
            <span>{o.orderNumber}</span>
            {o.status === 'Draft' && (
              <Button size="sm" variant="outline" onClick={() => updateProductionOrderStatus(o.id, 'Approved')}>
                Approve
              </Button>
            )}
            {o.status === 'Approved' || o.status === 'In Progress' ? (
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  const id = convertOrderToBatch(o.id);
                  if (id) {
                    setSelectedEntityId(id);
                    setCurrentView('production-create');
                  }
                }}
              >
                Create batch
              </Button>
            ) : null}
          </OrderChip>
        ))}
      </div>
    </ProductionPageShell>
  );
}

function OrderChip({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>;
}