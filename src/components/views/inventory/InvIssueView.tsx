'use client';

import React, { useEffect, useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { InventoryPageShell } from '../../inventory/InventoryPageShell';
import { Button } from '../../common/Button';

const ISSUE_REASONS = [
  'Manual floor issue',
  'Sample / QA withdrawal',
  'Scrap write-off to production',
  'Donation / disposal',
  'Other authorized issue',
];

export function InvIssueView() {
  const { inventory, issueStock, selectedEntityId, setSelectedEntityId } = useERP();
  const [itemId, setItemId] = useState('');
  const [qtyKg, setQtyKg] = useState('');
  const [reason, setReason] = useState(ISSUE_REASONS[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (selectedEntityId && inventory.some((i) => i.id === selectedEntityId)) {
      setItemId(selectedEntityId);
      setSelectedEntityId(null);
    }
  }, [selectedEntityId, inventory, setSelectedEntityId]);

  const selected = inventory.find((i) => i.id === itemId);
  const activeLines = inventory.filter((i) => i.availableKg > 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(qtyKg);
    if (!itemId || !qty || qty <= 0) return;
    issueStock(itemId, qty, reason, undefined, notes || undefined);
    setQtyKg('');
    setNotes('');
  };

  return (
    <InventoryPageShell
      title="Issue Stock"
      subtitle="Manual outbound issue — posts OUT movement, reduces on-hand kg, and blocks negative balances."
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
            {activeLines.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} — {i.warehouse} ({i.availableKg} kg)
              </option>
            ))}
          </select>
        </label>
        {selected && (
          <p className="md:col-span-2 text-xs text-slate-500">
            Available: <strong>{selected.availableKg} kg</strong> @ Rs. {selected.unitCost}/kg
          </p>
        )}
        <label className="text-xs font-medium text-slate-600">
          Quantity to issue (kg)
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            max={selected?.availableKg}
            value={qtyKg}
            onChange={(e) => setQtyKg(e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Reason
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          >
            {ISSUE_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-600 md:col-span-2">
          Notes (optional)
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />
        </label>
        <Button type="submit" variant="primary">
          Post Issue
        </Button>
      </form>
    </InventoryPageShell>
  );
}