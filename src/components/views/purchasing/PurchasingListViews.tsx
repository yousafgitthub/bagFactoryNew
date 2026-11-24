'use client';

import React, { useMemo, useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Button } from '../../common/Button';
import { PurchasingPageShell } from './PurchasingPageShell';
import { PurchaseDocStatusBadge, PurchasePaymentBadge } from './PurchasingStatusBadge';
import { daysOverduePayable, purchaseCategoryLabel } from '../../../purchasing/purchasingUtils';
import { exportToCSV } from '../../../utils/exportUtils';
import type { Supplier, SupplierPaymentRecord, PurchaseReturn } from '../../../types/erp';

export function PurchasesAllView() {
  const { purchaseOrders, setCurrentView, setSelectedEntityId, searchQuery } = useERP();
  const filtered = purchaseOrders.filter(
    (p) =>
      !searchQuery ||
      p.purchaseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PurchasingPageShell title="All Purchases" subtitle="Purchase orders and invoices" actions={<Button variant="primary" size="sm" onClick={() => setCurrentView('purchases-create')}>Create Purchase</Button>}>
      <PurchaseTable rows={filtered} onOpen={(id) => { setSelectedEntityId(id); setCurrentView('purchases-detail'); }} />
    </PurchasingPageShell>
  );
}

export function PurchasesOutstandingView() {
  const { purchaseOrders, setCurrentView, setSelectedEntityId, searchQuery } = useERP();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Overdue' | 'Unpaid'>('ALL');
  const rows = useMemo(() => {
    return purchaseOrders
      .filter((p) => p.remainingPayable > 0.01 && p.documentStatus !== 'Draft' && p.documentStatus !== 'Cancelled')
      .filter((p) => {
        if (statusFilter === 'Overdue') return p.paymentStatus === 'Overdue';
        if (statusFilter === 'Unpaid') return p.paymentStatus === 'Unpaid';
        return true;
      })
      .filter(
        (p) =>
          !searchQuery ||
          p.purchaseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [purchaseOrders, statusFilter, searchQuery]);

  const exportCsv = () => {
    exportToCSV(
      'outstanding-payables',
      ['Purchase #', 'Supplier', 'Date', 'Net Total', 'Paid', 'Outstanding', 'Due', 'Days Overdue', 'Payment Status'],
      rows.map((p) => [
        p.purchaseNumber,
        p.supplierName,
        p.purchaseDate,
        p.netTotal,
        p.amountPaid,
        p.remainingPayable,
        p.paymentDueDate,
        daysOverduePayable(p.paymentDueDate),
        p.paymentStatus,
      ])
    );
  };

  return (
    <PurchasingPageShell title="Outstanding Payables" subtitle="Supplier balances payable in PKR" actions={<Button variant="outline" size="sm" onClick={exportCsv}>Export CSV</Button>}>
      <div className="flex gap-2 text-xs mb-3">
        {(['ALL', 'Unpaid', 'Overdue'] as const).map((f) => (
          <button key={f} onClick={() => setStatusFilter(f)} className={`px-3 py-1 rounded-lg border ${statusFilter === f ? 'bg-blue-600 text-white' : 'bg-white'}`}>
            {f}
          </button>
        ))}
      </div>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Purchase #</th>
              <th className="p-3">Supplier</th>
              <th className="p-3">Net Total</th>
              <th className="p-3">Outstanding</th>
              <th className="p-3">Due</th>
              <th className="p-3">Days Overdue</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="p-3 font-bold text-purple-700">{p.purchaseNumber}</td>
                <td className="p-3">{p.supplierName}</td>
                <td className="p-3">Rs. {p.netTotal.toLocaleString()}</td>
                <td className="p-3 text-rose-600 font-bold">Rs. {p.remainingPayable.toLocaleString()}</td>
                <td className="p-3">{p.paymentDueDate}</td>
                <td className="p-3">{daysOverduePayable(p.paymentDueDate)}</td>
                <td className="p-3"><PurchasePaymentBadge status={p.paymentStatus} /></td>
                <td className="p-3 text-right space-x-1">
                  <Button size="sm" variant="outline" onClick={() => { setSelectedEntityId(p.id); setCurrentView('purchases-detail'); }}>View</Button>
                  <Button size="sm" variant="primary" onClick={() => { setSelectedEntityId(p.id); setCurrentView('purchases-payments'); }}>Pay</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PurchasingPageShell>
  );
}

export function PurchasesPaymentsView() {
  const { purchaseOrders, supplierPayments, recordPurchasePayment, selectedEntityId } = useERP();
  const [purchaseId, setPurchaseId] = useState(selectedEntityId ?? purchaseOrders.find((p) => p.remainingPayable > 0)?.id ?? '');
  const [amount, setAmount] = useState(50000);
  const [method, setMethod] = useState<'Cash' | 'Bank Transfer' | 'Cheque' | 'Other'>('Bank Transfer');
  const [reference, setReference] = useState(`SPAY-${Date.now().toString().slice(-6)}`);

  const selected = purchaseOrders.find((p) => p.id === purchaseId);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    recordPurchasePayment(purchaseId, Math.min(amount, selected.remainingPayable), method, reference);
  };

  return (
    <PurchasingPageShell title="Supplier Payments" subtitle="Payments against purchase invoices (no inventory impact)">
      <form onSubmit={submit} className="bg-white border rounded-xl p-4 grid md:grid-cols-2 gap-4 text-xs max-w-3xl">
        <div>
          <label className="font-medium">Purchase invoice</label>
          <select className="w-full mt-1 border rounded-lg p-2" value={purchaseId} onChange={(e) => setPurchaseId(e.target.value)}>
            {purchaseOrders.filter((p) => p.remainingPayable > 0).map((p) => (
              <option key={p.id} value={p.id}>{p.purchaseNumber} — {p.supplierName} (Rs. {p.remainingPayable.toLocaleString()} due)</option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-medium">Payment amount (PKR)</label>
          <input type="number" className="w-full mt-1 border rounded-lg p-2" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        </div>
        <div>
          <label className="font-medium">Method</label>
          <select className="w-full mt-1 border rounded-lg p-2" value={method} onChange={(e) => setMethod(e.target.value as typeof method)}>
            {['Cash', 'Bank Transfer', 'Cheque', 'Other'].map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="font-medium">Reference</label>
          <input className="w-full mt-1 border rounded-lg p-2" value={reference} onChange={(e) => setReference(e.target.value)} required />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" variant="primary">Record payment</Button>
        </div>
      </form>
      <MotionLedger payments={supplierPayments} />
    </PurchasingPageShell>
  );
}

function MotionLedger({ payments }: { payments: SupplierPaymentRecord[] }) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden mt-4">
      <table className="w-full text-xs">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="p-3 text-left">Reference</th>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-left">Supplier</th>
            <th className="p-3 text-left">Purchase #</th>
            <th className="p-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {payments.map((p) => (
            <tr key={p.id}>
              <td className="p-3 font-mono">{p.paymentReference}</td>
              <td className="p-3">{p.paymentDate}</td>
              <td className="p-3">{p.supplierName}</td>
              <td className="p-3">{p.purchaseNumber}</td>
              <td className="p-3 text-right font-bold">Rs. {p.amount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PurchasesReturnsView() {
  const { purchaseOrders, purchaseReturns, savePurchaseReturn, setCurrentView, setSelectedEntityId } = useERP();
  const [purchaseId, setPurchaseId] = useState(purchaseOrders.find((p) => p.documentStatus === 'Received')?.id ?? '');
  const purchase = purchaseOrders.find((p) => p.id === purchaseId);
  const [qty, setQty] = useState(10);
  const [reason, setReason] = useState('Quality / moisture issue');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchase) return;
    const line = purchase.items.find((i) => i.receivedQty > 0 && i.unit === 'kg');
    if (!line) return;
    const id = savePurchaseReturn(purchase.id, [{ purchaseItemId: line.id, returnQty: qty, returnRate: line.ratePerUnit }], new Date().toISOString().split('T')[0], reason);
    if (id) setCurrentView('purchases-returns');
  };

  return (
    <PurchasingPageShell title="Purchase Returns" subtitle="Return materials to external suppliers — stock-out on completion">
      <form onSubmit={submit} className="bg-white border rounded-xl p-4 max-w-xl text-xs space-y-3">
        <select className="w-full border rounded-lg p-2" value={purchaseId} onChange={(e) => setPurchaseId(e.target.value)}>
          {purchaseOrders.filter((p) => p.documentStatus === 'Received' || p.documentStatus === 'Partially Received').map((p) => (
            <option key={p.id} value={p.id}>{p.purchaseNumber}</option>
          ))}
        </select>
        <input type="number" className="w-full border rounded-lg p-2" value={qty} onChange={(e) => setQty(Number(e.target.value))} placeholder="Return qty (kg)" />
        <input className="w-full border rounded-lg p-2" value={reason} onChange={(e) => setReason(e.target.value)} />
        <Button type="submit" variant="primary">Submit return</Button>
      </form>
      <MotionReturns returns={purchaseReturns} onOpen={(pid: string) => { setSelectedEntityId(pid); setCurrentView('purchases-detail'); }} />
    </PurchasingPageShell>
  );
}

function MotionReturns({ returns, onOpen }: { returns: PurchaseReturn[]; onOpen: (id: string) => void }) {
  return (
    <table className="w-full text-xs mt-4 bg-white border rounded-xl overflow-hidden">
      <thead className="bg-slate-50"><tr><th className="p-3 text-left">Return #</th><th className="p-3">Purchase</th><th className="p-3">Credit</th><th className="p-3">Status</th></tr></thead>
      <tbody className="divide-y">
        {returns.map((r) => (
          <tr key={r.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => onOpen(r.purchaseId)}>
            <td className="p-3 font-bold">{r.returnReference}</td>
            <td className="p-3">{r.purchaseNumber}</td>
            <td className="p-3">Rs. {r.payableCredit.toLocaleString()}</td>
            <td className="p-3">{r.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function PurchasesReceiveView() {
  const { purchaseOrders, purchaseReceipts, recordPurchaseReceipt, setSelectedEntityId, setCurrentView } = useERP();
  const [purchaseId, setPurchaseId] = useState(purchaseOrders.find((p) => p.documentStatus === 'Ordered' || p.documentStatus === 'Partially Received')?.id ?? '');
  const purchase = purchaseOrders.find((p) => p.id === purchaseId);
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});

  React.useEffect(() => {
    if (!purchase) return;
    const initial: Record<string, number> = {};
    purchase.items.forEach((i) => {
      initial[i.id] = Math.max(0, i.orderedQty - i.receivedQty);
    });
    setQtyMap(initial);
  }, [purchaseId, purchase]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchase) return;
    const lines = Object.entries(qtyMap)
      .filter(([, q]) => q > 0)
      .map(([purchaseItemId, currentReceivedQty]) => ({ purchaseItemId, currentReceivedQty }));
    recordPurchaseReceipt(purchase.id, lines, new Date().toISOString().split('T')[0]);
  };

  return (
    <PurchasingPageShell title="Goods Receiving" subtitle="Post inventory only for quantities received (weighted-average cost)">
      <form onSubmit={submit} className="bg-white border rounded-xl p-4 text-xs space-y-3 max-w-2xl">
        <select className="w-full border rounded-lg p-2" value={purchaseId} onChange={(e) => setPurchaseId(e.target.value)}>
          {purchaseOrders
            .filter((p) => p.documentStatus !== 'Draft' && p.documentStatus !== 'Cancelled' && p.documentStatus !== 'Received')
            .map((p) => (
              <option key={p.id} value={p.id}>{p.purchaseNumber} — {p.supplierName}</option>
            ))}
        </select>
        {purchase?.items.map((line) => {
          const remaining = line.orderedQty - line.receivedQty;
          return (
            <div key={line.id} className="border rounded-lg p-3">
              <p className="font-semibold">{line.itemName}</p>
              <p className="text-slate-500">Ordered {line.orderedQty} {line.unit} · Received {line.receivedQty} · Remaining {remaining}</p>
              <input type="number" max={remaining} min={0} className="mt-2 border rounded p-2 w-full" value={qtyMap[line.id] ?? 0} onChange={(e) => setQtyMap({ ...qtyMap, [line.id]: Number(e.target.value) })} />
            </div>
          );
        })}
        <Button type="submit" variant="primary">Post receipt</Button>
      </form>
      <div className="mt-4 text-xs bg-white border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50"><tr><th className="p-3 text-left">GRN</th><th className="p-3">Purchase</th><th className="p-3">Date</th><th className="p-3">Warehouse</th></tr></thead>
          <tbody className="divide-y">
            {purchaseReceipts.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => { setSelectedEntityId(r.purchaseId); setCurrentView('purchases-detail'); }}>
                <td className="p-3 font-mono">{r.receiptNumber}</td>
                <td className="p-3">{r.purchaseNumber}</td>
                <td className="p-3">{r.receiptDate}</td>
                <td className="p-3">{r.warehouse}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PurchasingPageShell>
  );
}

function PurchaseTable({ rows, onOpen }: { rows: ReturnType<typeof useERP>['purchaseOrders']; onOpen: (id: string) => void }) {
  return (
    <div className="bg-white border rounded-xl overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="p-3 text-left">Purchase #</th>
            <th className="p-3 text-left">Supplier</th>
            <th className="p-3">Category</th>
            <th className="p-3">Doc status</th>
            <th className="p-3 text-right">Net PKR</th>
            <th className="p-3 text-right">Payable</th>
            <th className="p-3">Payment</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => onOpen(p.id)}>
              <td className="p-3 font-bold text-purple-700">{p.purchaseNumber}</td>
              <td className="p-3">{p.supplierName}</td>
              <td className="p-3">{purchaseCategoryLabel(p.purchaseCategory)}</td>
              <td className="p-3"><PurchaseDocStatusBadge status={p.documentStatus} /></td>
              <td className="p-3 text-right font-semibold">{p.netTotal.toLocaleString()}</td>
              <td className="p-3 text-right text-rose-600">{p.remainingPayable.toLocaleString()}</td>
              <td className="p-3"><PurchasePaymentBadge status={p.paymentStatus} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PurchaseSuppliersView() {
  const { suppliers, setCurrentView, setSelectedEntityId, searchQuery, upsertSupplier, purchaseSettings } = useERP();
  const [showForm, setShowForm] = useState(false);
  const filtered = suppliers.filter(
    (s) => !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addSupplier = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    upsertSupplier({
      name: String(fd.get('name')),
      businessName: String(fd.get('businessName') || ''),
      contactPerson: String(fd.get('contactPerson')),
      phone: String(fd.get('phone')),
      city: String(fd.get('city')),
      address: String(fd.get('address')),
      category: fd.get('category') as Supplier['category'],
      openingBalance: Number(fd.get('openingBalance') || 0),
      status: 'Active',
    });
    setShowForm(false);
    e.currentTarget.reset();
  };

  return (
    <PurchasingPageShell title="Supplier Management" subtitle={`Auto code prefix ${purchaseSettings.supplierCodePrefix}`} actions={<Button size="sm" variant="primary" onClick={() => setShowForm(!showForm)}>Add supplier</Button>}>
      {showForm ? (
        <form onSubmit={addSupplier} className="grid md:grid-cols-3 gap-3 bg-white border p-4 rounded-xl text-xs">
          <input name="name" required placeholder="Supplier name" className="border rounded p-2" />
          <input name="businessName" placeholder="Business name" className="border rounded p-2" />
          <input name="contactPerson" required placeholder="Contact person" className="border rounded p-2" />
          <input name="phone" required placeholder="Phone" className="border rounded p-2" />
          <input name="city" required placeholder="City" className="border rounded p-2" />
          <input name="address" required placeholder="Address" className="border rounded p-2 md:col-span-2" />
          <select name="category" className="border rounded p-2">
            <option>New Raw Material Supplier</option>
            <option>Waste Plastic Supplier</option>
            <option>Spare Parts Supplier</option>
            <option>Other Supplier</option>
          </select>
          <input name="openingBalance" type="number" placeholder="Opening balance PKR" className="border rounded p-2" />
          <Button type="submit" variant="primary">Save supplier</Button>
        </form>
      ) : null}
      <table className="w-full text-xs bg-white border rounded-xl overflow-hidden">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="p-3 text-left">Code</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3">Category</th>
            <th className="p-3 text-right">Purchases</th>
            <th className="p-3 text-right">Paid</th>
            <th className="p-3 text-right">Payable</th>
            <th className="p-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {filtered.map((s) => (
            <tr key={s.id} className="hover:bg-slate-50">
              <td className="p-3 font-bold text-purple-700">{s.code}</td>
              <td className="p-3 font-semibold">{s.name}</td>
              <td className="p-3">{s.category}</td>
              <td className="p-3 text-right">Rs. {s.totalPurchases.toLocaleString()}</td>
              <td className="p-3 text-right text-emerald-700">Rs. {s.paymentsMade.toLocaleString()}</td>
              <td className="p-3 text-right text-rose-600 font-bold">Rs. {s.currentPayable.toLocaleString()}</td>
              <td className="p-3 text-right space-x-1">
                <Button size="sm" variant="outline" onClick={() => { setSelectedEntityId(s.id); setCurrentView('purchase-supplier-detail'); }}>Details</Button>
                <Button size="sm" variant="outline" onClick={() => { setSelectedEntityId(s.id); setCurrentView('purchase-supplier-statement'); }}>Statement</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PurchasingPageShell>
  );
}