'use client';

import React, { useMemo, useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { PurchasingPageShell } from './PurchasingPageShell';
import { Button } from '../../common/Button';
import { purchaseCategoryLabel } from '../../../purchasing/purchasingUtils';
import { exportToCSV } from '../../../utils/exportUtils';

export function PurchasingReportsView() {
  const { purchaseOrders, supplierPayments, purchaseReturns, purchaseReceipts, suppliers } = useERP();
  const [report, setReport] = useState<'monthly' | 'supplier' | 'category' | 'payables' | 'returns'>('monthly');

  const supplierReport = useMemo(() => {
    const map: Record<string, number> = {};
    purchaseOrders.forEach((p) => {
      if (p.documentStatus === 'Draft' || p.documentStatus === 'Cancelled') return;
      map[p.supplierName] = (map[p.supplierName] || 0) + p.netTotal;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [purchaseOrders]);

  const exportActive = () => {
    if (report === 'supplier') {
      exportToCSV('supplier-purchases', ['Supplier', 'Purchase Value PKR'], supplierReport.map(([s, v]) => [s, v]));
    } else if (report === 'payables') {
      const rows = purchaseOrders.filter((p) => p.remainingPayable > 0);
      exportToCSV('outstanding-payables', ['Purchase', 'Supplier', 'Outstanding'], rows.map((p) => [p.purchaseNumber, p.supplierName, p.remainingPayable]));
    }
  };

  return (
    <PurchasingPageShell title="Purchase Reports" subtitle="Totals from live purchase data — CSV export & print-friendly tables" actions={<Button size="sm" variant="outline" onClick={exportActive}>Export CSV</Button>}>
      <div className="flex flex-wrap gap-2 text-xs">
        {(['monthly', 'supplier', 'category', 'payables', 'returns'] as const).map((r) => (
          <button key={r} onClick={() => setReport(r)} className={`px-3 py-1 rounded-lg border capitalize ${report === r ? 'bg-blue-600 text-white' : 'bg-white'}`}>{r.replace('-', ' ')}</button>
        ))}
      </div>
      <div className="bg-white border rounded-xl p-4 text-xs print:shadow-none">
        {report === 'supplier' && supplierReport.map(([name, val]) => (
          <p key={name} className="flex justify-between border-b py-2"><span>{name}</span><span className="font-bold">Rs. {val.toLocaleString()}</span></p>
        ))}
        {report === 'category' && (
          <CategoryReport orders={purchaseOrders} />
        )}
        {report === 'payables' && (
          <p>Total outstanding: Rs. {purchaseOrders.reduce((a, p) => a + p.remainingPayable, 0).toLocaleString()} across {suppliers.length} suppliers</p>
        )}
        {report === 'returns' && purchaseReturns.map((r) => <p key={r.id}>{r.returnReference}: Rs. {r.payableCredit.toLocaleString()}</p>)}
        {report === 'monthly' && (
          <p>Receipts: {purchaseReceipts.length} · Payments: {supplierPayments.length} · Active supplier count: {suppliers.length}</p>
        )}
      </div>
    </PurchasingPageShell>
  );
}

function CategoryReport({ orders }: { orders: ReturnType<typeof useERP>['purchaseOrders'] }) {
  const map: Record<string, number> = {};
  orders.forEach((p) => {
    if (p.documentStatus === 'Draft') return;
    const k = purchaseCategoryLabel(p.purchaseCategory);
    map[k] = (map[k] || 0) + p.netTotal;
  });
  return (
    <>
      {Object.entries(map).map(([k, v]) => (
        <p key={k} className="flex justify-between border-b py-2"><span>{k}</span><span className="font-bold">Rs. {v.toLocaleString()}</span></p>
      ))}
    </>
  );
}