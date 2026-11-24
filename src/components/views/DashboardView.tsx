'use client';

import React from 'react';
import { useERP } from '../../context/ERPContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Plus, Factory, Recycle } from 'lucide-react';

interface DashboardViewProps {
  onOpenNewSale: () => void;
  onOpenNewProduction: () => void;
  onOpenNewRecycling: () => void;
}

function money(amount: number) {
  return `Rs. ${amount.toLocaleString()}`;
}

export function DashboardView({
  onOpenNewSale,
  onOpenNewProduction,
  onOpenNewRecycling,
}: DashboardViewProps) {
  const {
    inventory,
    salesInvoices,
    purchaseBills,
    customers,
    accounts,
    setCurrentView,
    setSelectedEntityId,
  } = useERP();

  const totalSalesAmount = salesInvoices.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalPurchasesAmount = purchaseBills.reduce((acc, p) => acc + p.totalAmount, 0);
  const totalCashBank = accounts.reduce((acc, a) => acc + a.currentBalance, 0);
  const totalInventoryKg = inventory.reduce((acc, i) => acc + i.availableKg, 0);
  const totalReceivables = customers.reduce((acc, c) => acc + c.currentBalance, 0);
  const lowStockItems = inventory.filter((i) => i.status === 'Low Stock' || i.status === 'Critical');

  const stockLines = [
    { label: 'New raw material', kg: inventory.filter((i) => i.category === 'NEW_BRANDED').reduce((a, i) => a + i.availableKg, 0) },
    { label: 'Waste plastic', kg: inventory.filter((i) => i.category === 'WASTE_PLASTIC').reduce((a, i) => a + i.availableKg, 0) },
    { label: 'Recycled material', kg: inventory.filter((i) => i.category === 'RECYCLED_RAW').reduce((a, i) => a + i.availableKg, 0) },
    { label: 'Finished bags', kg: inventory.filter((i) => i.category === 'FINISHED_GOODS').reduce((a, i) => a + i.availableKg, 0) },
  ];

  const recentSales = [...salesInvoices].sort((a, b) => b.saleDate.localeCompare(a.saleDate)).slice(0, 5);
  const recentPurchases = [...purchaseBills].sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate)).slice(0, 5);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#1E293B]">Today</h2>
          <p className="text-sm text-slate-500">Sales, purchases, cash, and stock at a glance.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="primary" icon={<Plus className="w-3.5 h-3.5" />} onClick={onOpenNewSale}>
            New sale
          </Button>
          <Button size="sm" variant="outline" icon={<Factory className="w-3.5 h-3.5" />} onClick={onOpenNewProduction}>
            Bag batch
          </Button>
          <Button size="sm" variant="outline" icon={<Recycle className="w-3.5 h-3.5" />} onClick={onOpenNewRecycling}>
            Recycling batch
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <SummaryCard
          label="Sales"
          value={money(totalSalesAmount)}
          hint={`${salesInvoices.length} invoices · ${money(totalReceivables)} still due`}
          onClick={() => setCurrentView('sales')}
        />
        <SummaryCard
          label="Purchases"
          value={money(totalPurchasesAmount)}
          hint={`${purchaseBills.length} bills`}
          onClick={() => setCurrentView('purchases')}
        />
        <SummaryCard
          label="Cash balance"
          value={money(totalCashBank)}
          hint="Cash and bank accounts"
          onClick={() => setCurrentView('cash-bank')}
        />
        <SummaryCard
          label="Stock"
          value={`${totalInventoryKg.toLocaleString()} kg`}
          hint={lowStockItems.length > 0 ? `${lowStockItems.length} items low` : 'No low-stock items'}
          onClick={() => setCurrentView(lowStockItems.length > 0 ? 'inv-low-stock' : 'inv-overview')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <header className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
            <h3 className="text-sm font-semibold text-[#1E293B]">Recent sales</h3>
            <button type="button" className="text-xs font-medium text-[#2563EB]" onClick={() => setCurrentView('sales-all')}>
              View all
            </button>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500">
                <tr>
                  <th className="text-left font-medium px-4 py-2">Customer</th>
                  <th className="text-left font-medium px-2 py-2">Date</th>
                  <th className="text-right font-medium px-4 py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-sm text-slate-400">No sales yet.</td>
                  </tr>
                ) : (
                  recentSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer"
                      onClick={() => {
                        setSelectedEntityId(sale.id);
                        setCurrentView('sales-invoice-detail');
                      }}
                    >
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-[#1E293B]">{sale.customerName}</p>
                        <p className="text-xs text-slate-500">{sale.invoiceNumber}</p>
                      </td>
                      <td className="px-2 py-2.5 text-slate-600 whitespace-nowrap">{sale.saleDate}</td>
                      <td className="px-4 py-2.5 text-right">
                        <p className="font-medium">{money(sale.grandTotal)}</p>
                        <Badge variant={sale.paymentStatus === 'Paid' ? 'success' : sale.paymentStatus === 'Partial' ? 'warning' : 'danger'}>
                          {sale.paymentStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <header className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
            <h3 className="text-sm font-semibold text-[#1E293B]">Recent purchases</h3>
            <button type="button" className="text-xs font-medium text-[#2563EB]" onClick={() => setCurrentView('purchases-all')}>
              View all
            </button>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500">
                <tr>
                  <th className="text-left font-medium px-4 py-2">Supplier</th>
                  <th className="text-left font-medium px-2 py-2">Date</th>
                  <th className="text-right font-medium px-4 py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-sm text-slate-400">No purchases yet.</td>
                  </tr>
                ) : (
                  recentPurchases.map((bill) => (
                    <tr
                      key={bill.id}
                      className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer"
                      onClick={() => {
                        setSelectedEntityId(bill.id);
                        setCurrentView('purchases-detail');
                      }}
                    >
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-[#1E293B]">{bill.supplierName}</p>
                        <p className="text-xs text-slate-500">{bill.purchaseNumber}</p>
                      </td>
                      <td className="px-2 py-2.5 text-slate-600 whitespace-nowrap">{bill.purchaseDate}</td>
                      <td className="px-4 py-2.5 text-right">
                        <p className="font-medium">{money(bill.totalAmount)}</p>
                        <Badge variant={bill.paymentStatus === 'Paid' ? 'success' : 'warning'}>{bill.paymentStatus}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#1E293B]">Stock summary</h3>
            <button type="button" className="text-xs font-medium text-[#2563EB]" onClick={() => setCurrentView('inv-overview')}>
              Open inventory
            </button>
          </div>
          <ul className="divide-y divide-slate-100">
            {stockLines.map((line) => (
              <li key={line.label} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-slate-600">{line.label}</span>
                <span className="font-medium text-[#1E293B]">{line.kg.toLocaleString()} kg</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#1E293B]">Low stock</h3>
            <button type="button" className="text-xs font-medium text-[#2563EB]" onClick={() => setCurrentView('inv-low-stock')}>
              View alerts
            </button>
          </div>
          {lowStockItems.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">Every item is above its reorder level.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {lowStockItems.slice(0, 6).map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="text-[#1E293B] truncate">{item.name}</span>
                  <span className="shrink-0 text-slate-600">
                    {item.availableKg.toLocaleString()} kg
                    <span className="text-slate-400"> / {item.reorderLevelKg.toLocaleString()}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  onClick,
}: {
  label: string;
  value: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left bg-white border border-slate-200 rounded-xl px-4 py-3.5 hover:border-slate-300 transition-colors"
    >
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-[#1E293B] tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </button>
  );
}
