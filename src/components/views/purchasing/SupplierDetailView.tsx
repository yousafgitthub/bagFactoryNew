'use client';

import React, { useMemo } from 'react';
import { useERP } from '../../../context/ERPContext';
import { PurchasingPageShell } from './PurchasingPageShell';
import { Button } from '../../common/Button';

export function SupplierDetailView() {
  const { suppliers, purchaseOrders, selectedEntityId, setCurrentView, setSelectedEntityId } = useERP();
  const supplier = suppliers.find((s) => s.id === selectedEntityId) ?? suppliers[0];
  const history = useMemo(
    () => purchaseOrders.filter((p) => p.supplierId === supplier?.id).sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate)),
    [purchaseOrders, supplier]
  );

  if (!supplier) return null;

  return (
    <PurchasingPageShell
      title={supplier.name}
      subtitle={`${supplier.code} · ${supplier.category} · ${supplier.city}`}
      actions={
        <>
          <Button size="sm" variant="outline" onClick={() => setCurrentView('purchase-suppliers')}>Back</Button>
          <Button size="sm" variant="primary" onClick={() => setCurrentView('purchase-supplier-statement')}>Statement</Button>
        </>
      }
    >
      <div className="grid md:grid-cols-3 gap-3 text-xs">
        <InfoCard label="Contact" value={`${supplier.contactPerson} · ${supplier.phone}`} />
        <InfoCard label="Address" value={supplier.address} />
        <InfoCard label="Outstanding payable" value={`Rs. ${supplier.currentPayable.toLocaleString()}`} />
      </div>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b"><tr><th className="p-3 text-left">Purchase #</th><th className="p-3">Date</th><th className="p-3 text-right">Net</th><th className="p-3 text-right">Payable</th></tr></thead>
          <tbody className="divide-y">
            {history.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => { setSelectedEntityId(p.id); setCurrentView('purchases-detail'); }}>
                <td className="p-3 font-bold text-purple-700">{p.purchaseNumber}</td>
                <td className="p-3">{p.purchaseDate}</td>
                <td className="p-3 text-right">{p.netTotal.toLocaleString()}</td>
                <td className="p-3 text-right text-rose-600">{p.remainingPayable.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PurchasingPageShell>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return <div className="bg-white border rounded-xl p-3"><p className="text-slate-500">{label}</p><p className="font-semibold text-slate-900 mt-1">{value}</p></div>;
}