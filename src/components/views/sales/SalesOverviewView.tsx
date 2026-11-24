'use client';

import React, { useMemo } from 'react';
import { useERP } from '../../../context/ERPContext';
import { KPICard } from '../../common/KPICard';
import { Button } from '../../common/Button';
import { SalesPageShell } from './SalesPageShell';
import { InvoiceStatusBadge, SalesPaymentBadge } from './SalesStatusBadge';
import { aggregateSalesKpis, confirmedSalesInvoices, getBrandFromProductName } from '../../../sales/salesUtils';
import { ShoppingBag, Plus, CreditCard, AlertCircle, BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const PIE = ['#2563eb', '#059669', '#7c3aed', '#d97706', '#dc2626'];

export function SalesOverviewView() {
  const {
    salesInvoices,
    customerPayments,
    salesReturns,
    setCurrentView,
    setSelectedEntityId,
    searchQuery,
  } = useERP();

  const confirmed = useMemo(() => confirmedSalesInvoices(salesInvoices), [salesInvoices]);
  const kpis = useMemo(() => aggregateSalesKpis(salesInvoices, customerPayments), [salesInvoices, customerPayments]);

  const monthlyTrend = useMemo(() => {
    const map: Record<string, { month: string; sales: number }> = {};
    confirmed.forEach((inv) => {
      const month = inv.saleDate.slice(0, 7);
      if (!map[month]) map[month] = { month, sales: 0 };
      map[month].sales += inv.grandTotal;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [confirmed]);

  const brandData = useMemo(() => {
    const map: Record<string, number> = {};
    confirmed.forEach((inv) =>
      inv.items.forEach((line) => {
        const brand = line.brand || getBrandFromProductName(line.productName);
        map[brand] = (map[brand] || 0) + line.qtyKg;
      })
    );
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [confirmed]);

  const paymentPie = useMemo(
    () => [
      { name: 'Paid', value: kpis.paidInvoices },
      { name: 'Partial', value: kpis.partialInvoices },
      { name: 'Unpaid / Overdue', value: kpis.unpaidInvoices },
    ],
    [kpis]
  );

  const paymentTrend = useMemo(() => {
    const map: Record<string, number> = {};
    customerPayments.forEach((p) => {
      const m = p.paymentDate.slice(0, 7);
      map[m] = (map[m] || 0) + p.amount;
    });
    return Object.entries(map)
      .map(([month, received]) => ({ month, received }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [customerPayments]);

  const recentInvoices = useMemo(
    () =>
      [...salesInvoices]
        .sort((a, b) => b.saleDate.localeCompare(a.saleDate))
        .slice(0, 6)
        .filter(
          (inv) =>
            !searchQuery ||
            inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.customerName.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [salesInvoices, searchQuery]
  );

  return (
    <SalesPageShell
      title="Sales Overview"
      subtitle="Commercial invoicing in PKR and kg • Finished goods dispatch • Payments & receivables"
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => setCurrentView('sales-outstanding')}>
            Outstanding
          </Button>
          <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setCurrentView('sales-create')}>
            Create Invoice
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Sales" value={`Rs. ${kpis.totalSales.toLocaleString()}`} subtitle="Confirmed invoices" icon={ShoppingBag} highlightColor="blue" />
        <KPICard title="Today's Sales" value={`Rs. ${kpis.todaySales.toLocaleString()}`} subtitle="Sale date = today" icon={BarChart3} />
        <KPICard title="This Month" value={`Rs. ${kpis.monthSales.toLocaleString()}`} subtitle="Month-to-date revenue" icon={BarChart3} highlightColor="green" />
        <KPICard title="Outstanding" value={`Rs. ${kpis.totalOutstanding.toLocaleString()}`} subtitle="Receivables balance" icon={AlertCircle} highlightColor="amber" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 text-xs">
          <p className="text-[#64748B]">Total Invoices</p>
          <p className="text-lg font-bold text-[#1E293B]">{kpis.totalInvoices}</p>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 text-xs">
          <p className="text-[#64748B]">Paid</p>
          <p className="text-lg font-bold text-emerald-600">{kpis.paidInvoices}</p>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 text-xs">
          <p className="text-[#64748B]">Partial</p>
          <p className="text-lg font-bold text-amber-600">{kpis.partialInvoices}</p>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 text-xs">
          <p className="text-[#64748B]">Unpaid / Overdue</p>
          <p className="text-lg font-bold text-rose-600">{kpis.unpaidInvoices}</p>
        </div>
      </div>

      <details className="rounded-xl border border-[#E2E8F0] bg-white">
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-[#1E293B]">
          Charts
        </summary>
        <div className="grid lg:grid-cols-2 gap-4 p-4 pt-0">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 h-64">
          <p className="text-xs font-semibold text-[#64748B] mb-2">Monthly sales trend</p>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 h-64">
          <p className="text-xs font-semibold text-[#64748B] mb-2">Sales by brand (kg)</p>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={brandData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 h-64">
          <p className="text-xs font-semibold text-[#64748B] mb-2">Payment status mix</p>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={paymentPie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                {paymentPie.map((_, i) => (
                  <Cell key={i} fill={PIE[i % PIE.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 h-64">
          <p className="text-xs font-semibold text-[#64748B] mb-2">Payments received (monthly)</p>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={paymentTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="received" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        </div>
      </details>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E2E8F0] flex justify-between items-center">
            <p className="text-sm font-semibold text-[#1E293B]">Recent invoices</p>
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('sales-all')}>
              View all
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] text-[#64748B]">
                  <th className="text-left px-4 py-2">Invoice</th>
                  <th className="text-left px-4 py-2">Customer</th>
                  <th className="text-left px-4 py-2">Status</th>
                  <th className="text-right px-4 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-t border-[#F1F5F9] hover:bg-[#F8FAFC] cursor-pointer"
                    onClick={() => {
                      setSelectedEntityId(inv.id);
                      setCurrentView('sales-invoice-detail');
                    }}
                  >
                    <td className="px-4 py-2 font-medium">{inv.invoiceNumber}</td>
                    <td className="px-4 py-2">{inv.customerName}</td>
                    <td className="px-4 py-2 flex gap-1 flex-wrap">
                      <InvoiceStatusBadge status={inv.invoiceStatus} />
                      <SalesPaymentBadge status={inv.paymentStatus} />
                    </td>
                    <td className="px-4 py-2 text-right">Rs. {inv.grandTotal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-[#1E293B]">Quick actions</p>
          <Button className="w-full justify-center" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setCurrentView('sales-create')}>
            Create invoice
          </Button>
          <Button variant="outline" className="w-full justify-center" size="sm" icon={<CreditCard className="w-3.5 h-3.5" />} onClick={() => setCurrentView('sales-payments')}>
            Record payment
          </Button>
          <Button variant="outline" className="w-full justify-center" size="sm" onClick={() => setCurrentView('sales-reports')}>
            Sales reports
          </Button>
          <div className="pt-2 border-t border-[#E2E8F0]">
            <p className="text-[10px] uppercase text-[#94A3B8] mb-1">Recent returns</p>
            {salesReturns.slice(0, 3).map((r) => (
              <p key={r.id} className="text-xs text-[#475569]">
                {r.returnReference} — {r.customerName}
              </p>
            ))}
          </div>
        </div>
      </div>
    </SalesPageShell>
  );
}