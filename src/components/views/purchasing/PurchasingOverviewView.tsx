'use client';

import React, { useMemo } from 'react';
import { useERP } from '../../../context/ERPContext';
import { KPICard } from '../../common/KPICard';
import { Button } from '../../common/Button';
import { PurchasingPageShell } from './PurchasingPageShell';
import { PurchaseDocStatusBadge, PurchasePaymentBadge } from './PurchasingStatusBadge';
import { aggregatePurchaseKpis, purchaseCategoryLabel } from '../../../purchasing/purchasingUtils';
import { ShoppingCart, Plus, CreditCard, AlertCircle, BarChart3, Truck } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const PIE = ['#2563eb', '#059669', '#7c3aed', '#d97706', '#dc2626'];

export function PurchasingOverviewView() {
  const {
    purchaseOrders,
    purchaseReceipts,
    supplierPayments,
    purchaseReturns,
    suppliers,
    setCurrentView,
    setSelectedEntityId,
    searchQuery,
  } = useERP();

  const kpis = useMemo(() => aggregatePurchaseKpis(purchaseOrders), [purchaseOrders]);

  const monthlyTrend = useMemo(() => {
    const map: Record<string, { month: string; value: number }> = {};
    purchaseOrders
      .filter((p) => p.documentStatus !== 'Draft' && p.documentStatus !== 'Cancelled')
      .forEach((p) => {
        const month = p.purchaseDate.slice(0, 7);
        if (!map[month]) map[month] = { month, value: 0 };
        map[month].value += p.netTotal;
      });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [purchaseOrders]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    purchaseOrders.forEach((p) => {
      if (p.documentStatus === 'Draft' || p.documentStatus === 'Cancelled') return;
      const label = purchaseCategoryLabel(p.purchaseCategory);
      map[label] = (map[label] || 0) + p.netTotal;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [purchaseOrders]);

  const paymentPie = useMemo(
    () => [
      { name: 'Paid', value: kpis.paidCount },
      { name: 'Partial', value: kpis.partialCount },
      { name: 'Unpaid', value: kpis.unpaidCount },
    ],
    [kpis]
  );

  const recentPurchases = useMemo(
    () =>
      [...purchaseOrders]
        .sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate))
        .slice(0, 6)
        .filter(
          (p) =>
            !searchQuery ||
            p.purchaseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [purchaseOrders, searchQuery]
  );

  return (
    <PurchasingPageShell
      title="Purchase Overview"
      subtitle="External procurement in PKR/kg • Supplier payables • Goods receiving integrated with Phase 2 inventory"
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => setCurrentView('purchases-outstanding')}>
            Payables
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentView('purchases-receive')}>
            Goods Receiving
          </Button>
          <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setCurrentView('purchases-create')}>
            Create Purchase
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Purchase Value" value={`Rs. ${kpis.totalPurchaseValue.toLocaleString()}`} subtitle="Confirmed orders" icon={ShoppingCart} highlightColor="blue" />
        <KPICard title="Today's Purchases" value={`Rs. ${kpis.todayPurchases.toLocaleString()}`} subtitle="PKR" icon={BarChart3} />
        <KPICard title="This Month" value={`Rs. ${kpis.monthPurchases.toLocaleString()}`} subtitle="Month-to-date" icon={BarChart3} highlightColor="green" />
        <KPICard title="Outstanding Payables" value={`Rs. ${kpis.totalOutstanding.toLocaleString()}`} subtitle="We owe suppliers" icon={AlertCircle} highlightColor="red" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Total Invoices', kpis.totalInvoices],
          ['Paid', kpis.paidCount],
          ['Partial / Overdue', kpis.partialCount],
          ['Unpaid', kpis.unpaidCount],
        ].map(([label, val]) => (
          <div key={label as string} className="bg-white border border-[#E2E8F0] rounded-xl p-4 text-xs">
            <p className="text-[#64748B]">{label}</p>
            <p className="text-lg font-bold text-[#1E293B]">{val}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 h-64">
          <p className="text-xs font-semibold text-[#64748B] mb-2">Monthly purchase trend</p>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 h-64">
          <p className="text-xs font-semibold text-[#64748B] mb-2">Purchases by category</p>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 lg:col-span-2">
          <p className="text-xs font-semibold text-slate-700 mb-3">Recent purchase invoices</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 border-b">
                <tr>
                  <th className="py-2 pr-2">Purchase #</th>
                  <th className="py-2 pr-2">Supplier</th>
                  <th className="py-2 pr-2">Status</th>
                  <th className="py-2 pr-2 text-right">Net (PKR)</th>
                  <th className="py-2 text-right">Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentPurchases.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => {
                      setSelectedEntityId(p.id);
                      setCurrentView('purchases-detail');
                    }}
                  >
                    <td className="py-2 font-bold text-purple-700">{p.purchaseNumber}</td>
                    <td className="py-2">{p.supplierName}</td>
                    <td className="py-2">
                      <PurchaseDocStatusBadge status={p.documentStatus} />
                      <span className="ml-1 inline-block" />
                      <PurchasePaymentBadge status={p.paymentStatus} />
                    </td>
                    <td className="py-2 text-right font-semibold">{p.netTotal.toLocaleString()}</td>
                    <td className="py-2 text-right text-rose-600 font-bold">{p.remainingPayable.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 h-48">
            <p className="text-xs font-semibold text-[#64748B] mb-2">Payment status</p>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie data={paymentPie} dataKey="value" nameKey="name" innerRadius={40} outerRadius={60}>
                  {paymentPie.map((_, i) => (
                    <Cell key={i} fill={PIE[i % PIE.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 text-xs space-y-2">
            <p className="font-semibold text-slate-800">Recent activity</p>
            <p className="text-slate-600">{purchaseReceipts.length} goods receipts on file</p>
            <p className="text-slate-600">{supplierPayments.length} supplier payments recorded</p>
            <p className="text-slate-600">{purchaseReturns.length} purchase returns</p>
            <p className="text-slate-600">{suppliers.length} active suppliers</p>
            <Button variant="outline" size="sm" className="w-full mt-2" icon={<Truck className="w-3.5 h-3.5" />} onClick={() => setCurrentView('purchase-suppliers')}>
              Supplier management
            </Button>
            <Button variant="outline" size="sm" className="w-full" icon={<CreditCard className="w-3.5 h-3.5" />} onClick={() => setCurrentView('purchases-payments')}>
              Record payment
            </Button>
          </div>
        </div>
      </div>
    </PurchasingPageShell>
  );
}