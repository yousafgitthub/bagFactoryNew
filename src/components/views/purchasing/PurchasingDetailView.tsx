'use client';

import React from 'react';
import { useERP } from '../../../context/ERPContext';
import { PurchasingPageShell } from './PurchasingPageShell';
import { PurchaseDocStatusBadge, PurchasePaymentBadge } from './PurchasingStatusBadge';
import { Button } from '../../common/Button';
import { purchaseCategoryLabel } from '../../../purchasing/purchasingUtils';

export function PurchasingDetailView() {
  const { purchaseOrders, purchaseReceipts, supplierPayments, purchaseReturns, selectedEntityId, setCurrentView, confirmPurchaseOrder, recordPurchasePayment } = useERP();
  const purchase = purchaseOrders.find((p) => p.id === selectedEntityId) ?? purchaseOrders[0];
  if (!purchase) return <PurchasingPageShell title="Purchase detail" subtitle="Not found"><p className="text-sm">Select a purchase from the list.</p></PurchasingPageShell>;

  const receipts = purchaseReceipts.filter((r) => r.purchaseId === purchase.id);
  const payments = supplierPayments.filter((p) => p.purchaseId === purchase.id);
  const returns = purchaseReturns.filter((r) => r.purchaseId === purchase.id);

  return (
    <PurchasingPageShell
      title={purchase.purchaseNumber}
      subtitle={`${purchase.supplierName} · ${purchaseCategoryLabel(purchase.purchaseCategory)} · ${purchase.warehouse}`}
      actions={<Button variant="outline" size="sm" onClick={() => setCurrentView('purchases-all')}>Back</Button>}
    >
      <div className="flex gap-2 flex-wrap text-xs">
        <PurchaseDocStatusBadge status={purchase.documentStatus} />
        <PurchasePaymentBadge status={purchase.paymentStatus} />
      </div>
      <div className="grid md:grid-cols-4 gap-3 text-xs">
        <Stat label="Net total" value={`Rs. ${purchase.netTotal.toLocaleString()}`} />
        <Stat label="Paid" value={`Rs. ${purchase.amountPaid.toLocaleString()}`} />
        <Stat label="Payable" value={`Rs. ${purchase.remainingPayable.toLocaleString()}`} />
        <Stat label="Due date" value={purchase.paymentDueDate} />
      </div>
      {purchase.documentStatus === 'Draft' ? (
        <Button variant="primary" size="sm" onClick={() => confirmPurchaseOrder(purchase.id)}>Confirm order</Button>
      ) : null}
      {purchase.remainingPayable > 0 ? (
        <Button variant="outline" size="sm" onClick={() => { recordPurchasePayment(purchase.id, Math.min(50000, purchase.remainingPayable), 'Bank Transfer', `SPAY-${Date.now().toString().slice(-5)}`); }}>
          Quick pay Rs. {Math.min(50000, purchase.remainingPayable).toLocaleString()}
        </Button>
      ) : null}
      <Section title="Line items">
        <table className="w-full text-xs bg-white border rounded-xl overflow-hidden">
          <thead className="bg-slate-50"><tr><th className="p-2 text-left">Item</th><th className="p-2">Ordered</th><th className="p-2">Received</th><th className="p-2">Rate</th><th className="p-2 text-right">Line total</th></tr></thead>
          <tbody className="divide-y">
            {purchase.items.map((i) => (
              <tr key={i.id}><td className="p-2">{i.itemName}</td><td className="p-2 text-center">{i.orderedQty} {i.unit}</td><td className="p-2 text-center">{i.receivedQty}</td><td className="p-2 text-center">Rs. {i.ratePerUnit}</td><td className="p-2 text-right font-semibold">{i.lineTotal.toLocaleString()}</td></tr>
            ))}
          </tbody>
        </table>
      </Section>
      <Section title="Receipts">{receipts.length ? receipts.map((r) => <p key={r.id} className="text-xs text-slate-600">{r.receiptNumber} — {r.receiptDate}</p>) : <p className="text-xs text-slate-500">No receipts</p>}</Section>
      <Section title="Payments">{payments.map((p) => <p key={p.id} className="text-xs">{p.paymentReference}: Rs. {p.amount.toLocaleString()}</p>)}</Section>
      <Section title="Returns">{returns.map((r) => <p key={r.id} className="text-xs">{r.returnReference}: credit Rs. {r.payableCredit.toLocaleString()}</p>)}</Section>
      {purchase.attachments.length ? (
        <Section title="Attachments (mock)">
          {purchase.attachments.map((a) => (
            <p key={a.id} className="text-xs text-slate-600">{a.fileName} — {a.previewNote}</p>
          ))}
        </Section>
      ) : null}
    </PurchasingPageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="bg-white border rounded-xl p-3"><p className="text-slate-500">{label}</p><p className="font-bold text-slate-900">{value}</p></div>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-white border rounded-xl p-4"><p className="text-sm font-semibold mb-2">{title}</p>{children}</div>;
}