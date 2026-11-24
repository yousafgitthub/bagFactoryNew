'use client';

import React from 'react';
import { useERP } from '../../../context/ERPContext';
import { SalesPageShell } from './SalesPageShell';
import { InvoiceStatusBadge, SalesPaymentBadge } from './SalesStatusBadge';
import { Button } from '../../common/Button';
import { generateInvoicePDF } from '../../../utils/exportUtils';
import { Printer, Download, Ban } from 'lucide-react';

export function SalesInvoiceDetailView() {
  const {
    salesInvoices,
    customers,
    selectedEntityId,
    stockMovements,
    confirmSalesInvoice,
    cancelSalesInvoice,
    setCurrentView,
    recordInvoicePayment,
    salesSettings,
  } = useERP();

  const invoice = salesInvoices.find((i) => i.id === selectedEntityId) || salesInvoices[0];
  const customer = customers.find((c) => c.id === invoice?.customerId);
  if (!invoice) return <p className="text-sm text-slate-500">Select an invoice from All Sales.</p>;

  const movements = stockMovements.filter((m) => m.referenceNo === invoice.invoiceNumber);

  return (
    <SalesPageShell
      title={`Invoice ${invoice.invoiceNumber}`}
      subtitle={`${salesSettings.factoryName} • PKR • kg`}
      actions={
        <>
          {invoice.invoiceStatus === 'Draft' && (
            <Button size="sm" onClick={() => confirmSalesInvoice(invoice.id)}>
              Confirm invoice
            </Button>
          )}
          <Button variant="outline" size="sm" icon={<Printer className="w-3.5 h-3.5" />} onClick={() => window.print()}>
            Print
          </Button>
          <Button variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={() => generateInvoicePDF(invoice, customer)}>
            PDF
          </Button>
          {invoice.invoiceStatus !== 'Cancelled' && (
            <Button
              variant="outline"
              size="sm"
              icon={<Ban className="w-3.5 h-3.5" />}
              onClick={() => cancelSalesInvoice(invoice.id, 'Cancelled by authorized user')}
            >
              Cancel
            </Button>
          )}
        </>
      }
    >
      <div className="grid lg:grid-cols-3 gap-4 text-xs">
        <div className="lg:col-span-2 bg-white border rounded-xl p-4 space-y-3">
          <div className="flex gap-2">
            <InvoiceStatusBadge status={invoice.invoiceStatus} />
            <SalesPaymentBadge status={invoice.paymentStatus} />
            {invoice.stockDeducted ? (
              <span className="text-emerald-600 font-medium">Stock deducted</span>
            ) : (
              <span className="text-amber-600 font-medium">No stock movement</span>
            )}
          </div>
          <p>
            <strong>Customer:</strong> {invoice.customerName} ({invoice.customerPhone})
          </p>
          <p>
            <strong>Dates:</strong> {invoice.saleDate} • Due {invoice.dueDate}
          </p>
          <table className="w-full">
            <thead>
              <tr className="text-left text-[#64748B] border-b">
                <th className="py-2">Product</th>
                <th>Brand</th>
                <th>Color</th>
                <th className="text-right">Kg</th>
                <th className="text-right">Rate</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((line) => (
                <tr key={line.id} className="border-b border-slate-100">
                  <td className="py-2">{line.productName}</td>
                  <td>{line.brand}</td>
                  <td>{line.color}</td>
                  <td className="text-right">{line.qtyKg}</td>
                  <td className="text-right">{line.ratePerKg}</td>
                  <td className="text-right">Rs. {line.totalAmount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right space-y-1">
            <p>Subtotal: Rs. {invoice.subtotal.toLocaleString()}</p>
            <p>Discount: Rs. {invoice.discount.toLocaleString()}</p>
            {invoice.taxAmount > 0 && <p>Tax: Rs. {invoice.taxAmount.toLocaleString()}</p>}
            <p className="font-bold text-base">Net: Rs. {invoice.grandTotal.toLocaleString()}</p>
            <p>Received: Rs. {invoice.amountReceived.toLocaleString()}</p>
            <p>Outstanding: Rs. {invoice.remainingBalance.toLocaleString()}</p>
          </div>
        </div>
        <div className="space-y-3">
          <Button className="w-full" size="sm" onClick={() => setCurrentView('sales-payments')}>
            Record payment
          </Button>
          <Button variant="outline" className="w-full" size="sm" onClick={() => setCurrentView('customers')}>
            View customer
          </Button>
          <StockMovementsPanel movements={movements} />
        </div>
      </div>
    </SalesPageShell>
  );
}

function StockMovementsPanel({ movements }: { movements: { type: string; qtyKg: number; warehouse: string }[] }) {
  return (
    <div className="bg-white border rounded-xl p-3">
      <p className="font-semibold mb-2">Stock movements</p>
      {movements.length === 0 ? (
        <p className="text-slate-500">No movements (draft or not confirmed).</p>
      ) : (
        movements.map((m, i) => (
          <p key={i} className="text-[#475569]">
            {m.type}: {m.qtyKg} kg @ {m.warehouse}
          </p>
        ))
      )}
    </div>
  );
}