'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { InventoryPageShell } from '../../inventory/InventoryPageShell';
import { InventoryCategory } from '../../../types/erp';
import { CATEGORY_LABELS } from '../../../data/inventory';
import { Button } from '../../common/Button';

export function InvReceiveView() {
  const { receiveStock, warehouses, inventoryModuleSettings, showToast } = useERP();
  const [category, setCategory] = useState<InventoryCategory>('NEW_BRANDED');
  const [name, setName] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [warehouse, setWarehouse] = useState(warehouses[0]?.name ?? '');
  const [qtyKg, setQtyKg] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [supplier, setSupplier] = useState('');
  const [color, setColor] = useState(inventoryModuleSettings.colors[0] ?? 'White');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(qtyKg);
    const cost = parseFloat(unitCost);
    if (!name.trim()) {
      showToast('error', 'Validation Failed', 'Material name is required');
      return;
    }
    if (!batchNumber.trim()) {
      showToast('error', 'Validation Failed', 'Batch number is required');
      return;
    }
    if (!qty || qty <= 0) {
      showToast('error', 'Validation Failed', 'Enter a valid quantity greater than zero');
      return;
    }
    if (!cost || cost <= 0) {
      showToast('error', 'Validation Failed', 'Enter a valid unit cost greater than zero');
      return;
    }
    receiveStock({
      name,
      category,
      warehouse,
      batchNumber,
      qtyKg: qty,
      unitCostPkr: cost,
      supplier: supplier || undefined,
      color: category === 'FINISHED_GOODS' ? color : undefined,
      referenceNo: `RCV-${Date.now().toString().slice(-6)}`,
      notes: 'Manual goods receipt (Phase 2)',
    });
    setQtyKg('');
    setUnitCost('');
  };

  return (
    <InventoryPageShell
      title="Receive Stock"
      subtitle="Posts inbound quantity with weighted-average cost when the same batch line already exists (kg, PKR/kg)."
    >
      <form onSubmit={submit} className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
        <label className="text-xs font-medium text-slate-600">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as InventoryCategory)}
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          >
            {(Object.keys(CATEGORY_LABELS) as InventoryCategory[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-600">
          Warehouse
          <select
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          >
            {warehouses.filter((w) => w.status === 'Active').map((w) => (
              <option key={w.id} value={w.name}>
                {w.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-600 md:col-span-2">
          Material / product name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Batch #
          <input
            required
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Supplier (optional)
          <input value={supplier} onChange={(e) => setSupplier(e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Quantity (kg)
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            value={qtyKg}
            onChange={(e) => setQtyKg(e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Unit cost (PKR/kg)
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
        </label>
        {category === 'FINISHED_GOODS' && (
          <label className="text-xs font-medium text-slate-600">
            Color
            <select value={color} onChange={(e) => setColor(e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
              {inventoryModuleSettings.colors.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="md:col-span-2">
          <Button type="submit" variant="primary">
            Post Receipt
          </Button>
        </div>
      </form>
    </InventoryPageShell>
  );
}