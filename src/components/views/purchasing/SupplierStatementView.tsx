'use client';

import React from 'react';
import { useERP } from '../../../context/ERPContext';
import { PurchasingPageShell } from './PurchasingPageShell';
import { Button } from '../../common/Button';

export function SupplierStatementView() {
  const { suppliers, selectedEntityId, getSupplierStatement, setCurrentView } = useERP();
  const supplier = suppliers.find((s) => s.id === selectedEntityId) ?? suppliers[0];
  const entries = supplier ? getSupplierStatement(supplier.id) : [];

  if (!supplier) return null;

  const closing = entries.length ? entries[entries.length - 1].runningBalance : supplier.openingBalance;

  return (
    <PurchasingPageShell
      title={`Supplier statement — ${supplier.name}`}
      subtitle="Debit = purchases (payable increases). Credit = payments & returns. Balance = amount payable to supplier."
      actions={<Button size="sm" variant="outline" onClick={() => setCurrentView('purchase-supplier-detail')}>Back</Button>}
    >
      <div className="bg-white border rounded-xl overflow-x-auto print:border-black">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Reference</th>
              <th className="p-3">Type</th>
              <th className="p-3 text-right">Debit</th>
              <th className="p-3 text-right">Credit</th>
              <th className="p-3 text-right">Balance payable</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {entries.map((e) => (
              <tr key={e.id}>
                <td className="p-3">{e.date}</td>
                <td className="p-3 font-mono">{e.reference}</td>
                <td className="p-3">{e.transactionType}</td>
                <td className="p-3 text-right">{e.debit ? e.debit.toLocaleString() : '—'}</td>
                <td className="p-3 text-right">{e.credit ? e.credit.toLocaleString() : '—'}</td>
                <td className="p-3 text-right font-bold">{e.runningBalance.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm font-bold text-rose-700 mt-3">Closing balance payable: Rs. {closing.toLocaleString()}</p>
    </PurchasingPageShell>
  );
}