'use client';

import React, { useMemo, useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { SalesPageShell } from './SalesPageShell';
import { InvoiceStatusBadge, SalesPaymentBadge } from './SalesStatusBadge';
import { Button } from '../../common/Button';
import { daysOverdue } from '../../../sales/salesUtils';
import { exportSalesRegisterCSV } from '../../../utils/exportUtils';
import { FileSpreadsheet, Eye } from 'lucide-react';
import type { SalesInvoice } from '../../../types/erp';

export function SalesAllInvoicesView() {
  const { salesInvoices, searchQuery, setCurrentView, setSelectedEntityId } = useERP();
  const [status, setStatus] = useState<string>('ALL');
  const rows = useMemo(
    () =>
      salesInvoices.filter((inv) => {
        const q = searchQuery.toLowerCase();
        const matchQ =
          !q ||
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.customerName.toLowerCase().includes(q);
        const matchS = status === 'ALL' || inv.invoiceStatus === status || inv.paymentStatus === status;
        return matchQ && matchS;
      }),
    [salesInvoices, searchQuery, status]
  );

  return (
    <SalesPageShell
      title="All Sales Invoices"
      subtitle="Draft invoices do not reduce finished goods until confirmed."
      actions={
        <Button variant="outline" size="sm" icon={<FileSpreadsheet className="w-3.5 h-3.5" />} onClick={() => exportSalesRegisterCSV(rows)}>
          Export CSV
        </Button>
      }
    >
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-xs border border-slate-300 rounded-lg p-2">
        <option value="ALL">All statuses</option>
        <option value="Draft">Draft</option>
        <option value="Confirmed">Confirmed</option>
        <option value="Paid">Paid</option>
        <option value="Overdue">Overdue</option>
        <option value="Cancelled">Cancelled</option>
      </select>
      <InvoiceTable
        rows={rows}
        onOpen={(id) => {
          setSelectedEntityId(id);
          setCurrentView('sales-invoice-detail');
        }}
      />
    </SalesPageShell>
  );
}

export function SalesOutstandingView() {
  const { salesInvoices, setCurrentView, setSelectedEntityId } = useERP();
  const today = new Date().toISOString().split('T')[0];
  const rows = salesInvoices.filter(
    (i) => i.remainingBalance > 0 && i.invoiceStatus !== 'Draft' && i.invoiceStatus !== 'Cancelled'
  );

  return (
    <SalesPageShell title="Outstanding Invoices" subtitle="Receivables with due dates and overdue tracking">
      <InvoiceTable
        rows={rows}
        headers={['Invoice', 'Date', 'Customer', 'Net', 'Received', 'Outstanding', 'Due', 'Overdue days', 'Payment', '']}
        renderExtra={(inv) => (
          <>
            <td className="px-4 py-2">{inv.dueDate}</td>
            <td className="px-4 py-2">{daysOverdue(inv.dueDate, today) || '—'}</td>
          </>
        )}
        onOpen={(id) => {
          setSelectedEntityId(id);
          setCurrentView('sales-invoice-detail');
        }}
      />
    </SalesPageShell>
  );
}

export function SalesPaymentsView() {
  const { customerPayments, salesInvoices, recordInvoicePayment, customers } = useERP();
  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<'Cash' | 'Bank Transfer' | 'Cheque' | 'Other'>('Bank Transfer');
  const [ref, setRef] = useState(`RCP-${Date.now().toString().slice(-6)}`);

  const openInvoices = salesInvoices.filter((i) => i.remainingBalance > 0 && i.invoiceStatus !== 'Draft' && i.invoiceStatus !== 'Cancelled');

  return (
    <SalesPageShell title="Customer Payments" subtitle="Payments allocated to specific invoices">
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <label className="block">
          Invoice
          <select className="w-full mt-1 border rounded-lg p-2" value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)}>
            <option value="">Select…</option>
            {openInvoices.map((i) => (
              <option key={i.id} value={i.id}>
                {i.invoiceNumber} — {i.customerName} (Rs. {i.remainingBalance.toLocaleString()} due)
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          Amount (PKR)
          <input type="number" className="w-full mt-1 border rounded-lg p-2" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} />
        </label>
        <label className="block">
          Method
          <select className="w-full mt-1 border rounded-lg p-2" value={method} onChange={(e) => setMethod(e.target.value as typeof method)}>
            <option>Cash</option>
            <option>Bank Transfer</option>
            <option>Cheque</option>
            <option>Other</option>
          </select>
        </label>
        <div className="flex items-end">
          <Button
            className="w-full"
            size="sm"
            onClick={() => invoiceId && recordInvoicePayment(invoiceId, amount, method, ref)}
          >
            Record payment
          </Button>
        </div>
      </div>
      <table className="w-full text-xs bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-[#F8FAFC] text-[#64748B]">
            <th className="text-left px-4 py-2">Ref</th>
            <th className="text-left px-4 py-2">Date</th>
            <th className="text-left px-4 py-2">Customer</th>
            <th className="text-left px-4 py-2">Invoice</th>
            <th className="text-right px-4 py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {customerPayments.map((p) => (
            <tr key={p.id} className="border-t border-[#F1F5F9]">
              <td className="px-4 py-2">{p.paymentReference}</td>
              <td className="px-4 py-2">{p.paymentDate}</td>
              <td className="px-4 py-2">{p.customerName}</td>
              <td className="px-4 py-2">{p.invoiceNumber}</td>
              <td className="px-4 py-2 text-right">Rs. {p.amount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[10px] text-slate-500">Customers module: {customers.length} active records (shared, not duplicated).</p>
    </SalesPageShell>
  );
}

export function SalesReturnsView() {
  const { salesReturns, salesInvoices, saveSalesReturn, updateSalesReturnStatus, completeSalesReturn } = useERP();
  const [invoiceId, setInvoiceId] = useState('');
  const [qty, setQty] = useState(0);
  const [reason, setReason] = useState('Quality inspection');

  const invoice = salesInvoices.find((i) => i.id === invoiceId);
  const line = invoice?.items[0];

  return (
    <SalesPageShell title="Sales Returns" subtitle="Inspection workflow — only saleable stock returns to finished goods">
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 gap-3 grid sm:grid-cols-2 lg:grid-cols-4 text-xs">
        <select className="border rounded-lg p-2" value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)}>
          <option value="">Original invoice…</option>
          {salesInvoices
            .filter((i) => i.invoiceStatus === 'Confirmed' || i.invoiceStatus === 'Completed')
            .map((i) => (
              <option key={i.id} value={i.id}>
                {i.invoiceNumber}
              </option>
            ))}
        </select>
        <input type="number" className="border rounded-lg p-2" placeholder="Qty kg" value={qty || ''} onChange={(e) => setQty(Number(e.target.value))} />
        <input className="border rounded-lg p-2" value={reason} onChange={(e) => setReason(e.target.value)} />
        <Button
          size="sm"
          disabled={!invoice || !line || qty <= 0}
          onClick={() => {
            if (!invoice || !line) return;
            saveSalesReturn({
              returnReference: `SRET-${Date.now().toString().slice(-6)}`,
              invoiceId: invoice.id,
              invoiceNumber: invoice.invoiceNumber,
              customerId: invoice.customerId,
              customerName: invoice.customerName,
              returnDate: new Date().toISOString().split('T')[0],
              items: [
                {
                  id: 'ri-' + Date.now(),
                  invoiceItemId: line.id,
                  inventoryItemId: line.inventoryItemId,
                  productName: line.productName,
                  brand: line.brand,
                  color: line.color,
                  qtyReturnedKg: qty,
                  condition: 'Saleable',
                  batchNumber: line.batchNumber,
                },
              ],
              reason,
              financialCredit: qty * line.ratePerKg,
              status: 'Pending Inspection',
            });
          }}
        >
          Create return
        </Button>
      </div>
      <table className="w-full text-xs bg-white border rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-[#F8FAFC]">
            <th className="text-left px-4 py-2">Reference</th>
            <th className="text-left px-4 py-2">Invoice</th>
            <th className="text-left px-4 py-2">Status</th>
            <th className="text-left px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {salesReturns.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="px-4 py-2">{r.returnReference}</td>
              <td className="px-4 py-2">{r.invoiceNumber}</td>
              <td className="px-4 py-2">{r.status}</td>
              <td className="px-4 py-2 flex gap-2">
                {r.status === 'Pending Inspection' && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => updateSalesReturnStatus(r.id, 'Approved')}>
                      Approve
                    </Button>
                    <Button size="sm" onClick={() => completeSalesReturn(r.id)}>
                      Complete
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </SalesPageShell>
  );
}

function InvoiceTable({
  rows,
  onOpen,
  headers = ['Invoice', 'Date', 'Customer', 'Invoice status', 'Total', 'Balance', 'Payment', ''],
  renderExtra,
}: {
  rows: SalesInvoice[];
  onOpen: (id: string) => void;
  headers?: string[];
  renderExtra?: (inv: SalesInvoice) => React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[#F8FAFC] text-[#64748B]">
            {headers.map((h) => (
              <th key={h} className={`px-4 py-2 ${h === 'Total' || h === 'Balance' || h === 'Outstanding' || h === 'Received' || h === 'Net' ? 'text-right' : 'text-left'}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((inv) => (
            <tr key={inv.id} className="border-t hover:bg-[#F8FAFC]">
              <td className="px-4 py-2 font-medium">{inv.invoiceNumber}</td>
              {headers.includes('Date') && <td className="px-4 py-2">{inv.saleDate}</td>}
              <td className="px-4 py-2">{inv.customerName}</td>
              {headers.includes('Invoice status') && (
                <td className="px-4 py-2">
                  <InvoiceStatusBadge status={inv.invoiceStatus} />
                </td>
              )}
              {(headers.includes('Total') || headers.includes('Net')) && (
                <td className="px-4 py-2 text-right">Rs. {inv.grandTotal.toLocaleString()}</td>
              )}
              {headers.includes('Received') && <td className="px-4 py-2 text-right">Rs. {inv.amountReceived.toLocaleString()}</td>}
              {headers.includes('Balance') || headers.includes('Outstanding') ? (
                <td className="px-4 py-2 text-right">Rs. {inv.remainingBalance.toLocaleString()}</td>
              ) : null}
              {renderExtra?.(inv)}
              {headers.includes('Payment') && (
                <td className="px-4 py-2">
                  <SalesPaymentBadge status={inv.paymentStatus} />
                </td>
              )}
              {headers.includes('') && (
                <td className="px-4 py-2">
                  <button onClick={() => onOpen(inv.id)} className="text-blue-600 hover:underline flex items-center gap-1">
                    <Eye className="w-3 h-3" /> View
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}