'use client';

import React, { useMemo, useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { SalesPageShell } from './SalesPageShell';
import { Button } from '../../common/Button';
import { confirmedSalesInvoices, getBrandFromProductName } from '../../../sales/salesUtils';
import { exportSalesRegisterCSV } from '../../../utils/exportUtils';

type ReportKey =
  | 'daily'
  | 'monthly'
  | 'customer'
  | 'product'
  | 'brand'
  | 'color'
  | 'quantity'
  | 'collections'
  | 'outstanding'
  | 'returns';

export function SalesReportsView() {
  const { salesInvoices, customerPayments, salesReturns, customers } = useERP();
  const [report, setReport] = useState<ReportKey>('daily');
  const [from, setFrom] = useState('2026-11-01');
  const [to, setTo] = useState('2026-11-30');

  const filtered = useMemo(
    () =>
      confirmedSalesInvoices(salesInvoices).filter((i) => i.saleDate >= from && i.saleDate <= to),
    [salesInvoices, from, to]
  );

  const rows = useMemo(() => {
    switch (report) {
      case 'daily':
        return filtered.map((i) => [i.saleDate, i.invoiceNumber, i.customerName, i.grandTotal]);
      case 'monthly': {
        const map: Record<string, number> = {};
        filtered.forEach((i) => {
          const m = i.saleDate.slice(0, 7);
          map[m] = (map[m] || 0) + i.grandTotal;
        });
        return Object.entries(map).map(([m, v]) => [m, v]);
      }
      case 'customer': {
        const map: Record<string, number> = {};
        filtered.forEach((i) => {
          map[i.customerName] = (map[i.customerName] || 0) + i.grandTotal;
        });
        return Object.entries(map).map(([n, v]) => [n, v]);
      }
      case 'brand': {
        const map: Record<string, number> = {};
        filtered.forEach((i) =>
          i.items.forEach((l) => {
            const b = l.brand || getBrandFromProductName(l.productName);
            map[b] = (map[b] || 0) + l.qtyKg;
          })
        );
        return Object.entries(map).map(([n, v]) => [n, `${v} kg`]);
      }
      case 'color': {
        const map: Record<string, number> = {};
        filtered.forEach((i) => i.items.forEach((l) => (map[l.color] = (map[l.color] || 0) + l.qtyKg)));
        return Object.entries(map).map(([n, v]) => [n, `${v} kg`]);
      }
      case 'quantity':
        return filtered.map((i) => [
          i.invoiceNumber,
          i.items.reduce((a, l) => a + l.qtyKg, 0) + ' kg',
        ]);
      case 'collections':
        return customerPayments
          .filter((p) => p.paymentDate >= from && p.paymentDate <= to)
          .map((p) => [p.paymentDate, p.paymentReference, p.customerName, p.amount]);
      case 'outstanding':
        return salesInvoices
          .filter((i) => i.remainingBalance > 0)
          .map((i) => [i.invoiceNumber, i.customerName, i.remainingBalance]);
      case 'returns':
        return salesReturns.map((r) => [r.returnDate, r.returnReference, r.invoiceNumber, r.status]);
      default:
        return filtered.map((i) => [i.invoiceNumber, i.items[0]?.productName, i.grandTotal]);
    }
  }, [report, filtered, customerPayments, salesInvoices, salesReturns, from, to]);

  return (
    <SalesPageShell title="Sales Reports" subtitle="Derived from live sales transactions — print or export">
      <div className="flex flex-wrap gap-2 text-xs">
        {(
          [
            ['daily', 'Daily sales'],
            ['monthly', 'Monthly'],
            ['customer', 'Customer-wise'],
            ['brand', 'Brand-wise'],
            ['color', 'Color-wise'],
            ['quantity', 'Quantity (kg)'],
            ['collections', 'Collections'],
            ['outstanding', 'Outstanding'],
            ['returns', 'Returns'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setReport(key)}
            className={`px-3 py-1.5 rounded-lg border ${report === key ? 'bg-blue-600 text-white' : 'bg-white'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 text-xs items-center">
        <input type="date" className="border rounded p-2" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" className="border rounded p-2" value={to} onChange={(e) => setTo(e.target.value)} />
        <Button variant="outline" size="sm" onClick={() => exportSalesRegisterCSV(filtered)}>
          Export CSV
        </Button>
      </div>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2">
                    {typeof cell === 'number' ? (report === 'customer' || report === 'monthly' ? `Rs. ${cell.toLocaleString()}` : cell) : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-slate-500">{customers.length} customers in shared directory.</p>
    </SalesPageShell>
  );
}