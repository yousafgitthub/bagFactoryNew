'use client';

import React, { useEffect, useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { InventoryPageShell } from '../../inventory/InventoryPageShell';
import { InventoryDataTable } from '../../inventory/InventoryDataTable';
import { Button } from '../../common/Button';

export function InvAdjustmentsView() {
  const { inventory, adjustStock, stockAdjustmentRecords, selectedEntityId, setSelectedEntityId } = useERP();
  const [itemId, setItemId] = useState('');

  useEffect(() => {
    if (selectedEntityId && inventory.some((i) => i.id === selectedEntityId)) {
      setItemId(selectedEntityId);
      setSelectedEntityId(null);
    }
  }, [selectedEntityId, inventory, setSelectedEntityId]);
  const [newQty, setNewQty] = useState('');
  const [reason, setReason] = useState('');

  const selected = inventory.find((i) => i.id === itemId);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(newQty);
    if (!itemId || Number.isNaN(qty) || !reason.trim()) return;
    adjustStock(itemId, qty, reason);
    setNewQty('');
    setReason('');
  };

  return (
    <InventoryPageShell
      title="Stock Adjustments"
      subtitle="Cycle-count and correction entries with signed kg delta and PKR impact in the movement ledger."
    >
      <form onSubmit={submit} className="bg-white border border-slate-200 rounded-xl p-6 grid md:grid-cols-2 gap-4 max-w-3xl">
        <label className="text-xs font-medium text-slate-600 md:col-span-2">
          Stock line
          <select
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            required
          >
            <option value="">Select…</option>
            {inventory.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} — {i.warehouse} ({i.availableKg} kg)
              </option>
            ))}
          </select>
        </label>
        {selected && (
          <p className="md:col-span-2 text-xs text-slate-500">
            Current on-hand: <strong>{selected.availableKg} kg</strong> @ Rs. {selected.unitCost}/kg
          </p>
        )}
        <label className="text-xs font-medium text-slate-600">
          New quantity (kg)
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Reason
          <input
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
        </label>
        <Button type="submit" variant="primary">
          Post Adjustment
        </Button>
      </form>

      <InventoryDataTable
        rows={stockAdjustmentRecords}
        csvFileName="inventory-adjustments"
        columns={[
          { key: 'date', header: 'Date', render: (r) => r.date, csvValue: (r) => r.date },
          { key: 'item', header: 'Item', render: (r) => r.itemName, csvValue: (r) => r.itemName },
          { key: 'wh', header: 'Warehouse', render: (r) => r.warehouse, csvValue: (r) => r.warehouse },
          { key: 'prev', header: 'Previous kg', render: (r) => r.previousQtyKg, csvValue: (r) => r.previousQtyKg },
          { key: 'new', header: 'New kg', render: (r) => r.newQtyKg, csvValue: (r) => r.newQtyKg },
          { key: 'delta', header: 'Delta', render: (r) => r.deltaKg, csvValue: (r) => r.deltaKg },
          { key: 'reason', header: 'Reason', render: (r) => r.reason, csvValue: (r) => r.reason },
        ]}
      />
    </InventoryPageShell>
  );
}