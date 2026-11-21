'use client';

import React, { useEffect, useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { InventoryPageShell } from '../../inventory/InventoryPageShell';
import { InventoryDataTable } from '../../inventory/InventoryDataTable';
import { Button } from '../../common/Button';
import { InventoryItem } from '../../../types/erp';

export function InvTransferView() {
  const { inventory, transferStock, warehouses, stockTransferRecords, selectedEntityId, setSelectedEntityId } = useERP();
  const [itemId, setItemId] = useState('');

  useEffect(() => {
    if (selectedEntityId && inventory.some((i) => i.id === selectedEntityId)) {
      setItemId(selectedEntityId);
      setSelectedEntityId(null);
    }
  }, [selectedEntityId, inventory, setSelectedEntityId]);
  const [toWarehouse, setToWarehouse] = useState('');
  const [qtyKg, setQtyKg] = useState('');

  const selected = inventory.find((i) => i.id === itemId);
  const fromWarehouse = selected?.warehouse ?? '';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !toWarehouse) return;
    const qty = parseFloat(qtyKg);
    if (!qty) return;
    transferStock(selected.id, fromWarehouse, toWarehouse, qty);
    setQtyKg('');
  };

  const activeLines = inventory.filter((i) => i.availableKg > 0);

  return (
    <InventoryPageShell
      title="Inter-Warehouse Transfers"
      subtitle="Moves kg between the five stores; destination balances update with preserved weighted-average cost."
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
            <option value="">Select line…</option>
            {activeLines.map((i: InventoryItem) => (
              <option key={i.id} value={i.id}>
                {i.name} — {i.warehouse} ({i.availableKg} kg)
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-600">
          From
          <input readOnly value={fromWarehouse} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          To warehouse
          <select
            required
            value={toWarehouse}
            onChange={(e) => setToWarehouse(e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select…</option>
            {warehouses
              .filter((w) => w.name !== fromWarehouse && w.status === 'Active')
              .map((w) => (
                <option key={w.id} value={w.name}>
                  {w.name}
                </option>
              ))}
          </select>
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
        <div className="flex items-end">
          <Button type="submit" variant="primary">
            Execute Transfer
          </Button>
        </div>
      </form>

      <InventoryDataTable
        rows={stockTransferRecords}
        csvFileName="inventory-transfers"
        columns={[
          { key: 'date', header: 'Date', render: (r) => r.date, csvValue: (r) => r.date },
          { key: 'item', header: 'Item', render: (r) => r.itemName, csvValue: (r) => r.itemName },
          { key: 'from', header: 'From', render: (r) => r.fromWarehouse, csvValue: (r) => r.fromWarehouse },
          { key: 'to', header: 'To', render: (r) => r.toWarehouse, csvValue: (r) => r.toWarehouse },
          { key: 'qty', header: 'Qty (kg)', render: (r) => r.qtyKg, csvValue: (r) => r.qtyKg },
          { key: 'ref', header: 'Reference', render: (r) => r.referenceNo, csvValue: (r) => r.referenceNo },
        ]}
      />
    </InventoryPageShell>
  );
}