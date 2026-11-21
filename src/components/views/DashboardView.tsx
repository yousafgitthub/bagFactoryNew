'use client';

import React from 'react';
import { useERP } from '../../context/ERPContext';
import { KPICard } from '../common/KPICard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  TrendingUp,
  ShoppingCart,
  Factory,
  Boxes,
  Users,
  Wallet,
  AlertTriangle,
  ArrowRight,
  Plus,
  Sparkles,
  Recycle,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface DashboardViewProps {
  onOpenNewSale: () => void;
  onOpenNewProduction: () => void;
  onOpenNewRecycling: () => void;
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
    productionBatches,
    recyclingBatches,
    customers,
    suppliers,
    accounts,
    setCurrentView,
    setSelectedEntityId,
  } = useERP();

  // Metrics calculation
  const totalSalesAmount = salesInvoices.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalPurchasesAmount = purchaseBills.reduce((acc, p) => acc + p.totalAmount, 0);
  const totalProductionKg = productionBatches.reduce((acc, p) => acc + p.finishedGoodsOutputKg, 0);
  const totalInventoryKg = inventory.reduce((acc, i) => acc + i.availableKg, 0);
  const totalReceivables = customers.reduce((acc, c) => acc + c.currentBalance, 0);
  const totalCashBank = accounts.reduce((acc, a) => acc + a.currentBalance, 0);

  // Inventory by category (in kg)
  const newMaterialKg = inventory
    .filter((i) => i.category === 'NEW_BRANDED')
    .reduce((acc, i) => acc + i.availableKg, 0);
  const wastePlasticKg = inventory
    .filter((i) => i.category === 'WASTE_PLASTIC')
    .reduce((acc, i) => acc + i.availableKg, 0);
  const recycledMaterialKg = inventory
    .filter((i) => i.category === 'RECYCLED_RAW')
    .reduce((acc, i) => acc + i.availableKg, 0);
  const finishedBagsKg = inventory
    .filter((i) => i.category === 'FINISHED_GOODS')
    .reduce((acc, i) => acc + i.availableKg, 0);

  // Production split
  const recycledBatches = productionBatches.filter((b) => b.materialSource === 'RECYCLED');
  const newBatches = productionBatches.filter((b) => b.materialSource === 'NEW');
  const recycledProductionKg = recycledBatches.reduce((acc, b) => acc + b.finishedGoodsOutputKg, 0);
  const newProductionKg = newBatches.reduce((acc, b) => acc + b.finishedGoodsOutputKg, 0);

  // Alerts
  const lowStockItems = inventory.filter((i) => i.status === 'Low Stock' || i.status === 'Critical');
  const unpaidInvoices = salesInvoices.filter((s) => s.paymentStatus !== 'Paid');
  const pendingPayables = suppliers.filter((s) => s.currentPayable > 0);

  // Sales chart data
  const monthlySalesData = [
    { month: 'Jun', sales: 620000, purchases: 380000 },
    { month: 'Jul', sales: 710000, purchases: 410000 },
    { month: 'Aug', sales: 690000, purchases: 430000 },
    { month: 'Sep', sales: 780000, purchases: 490000 },
    { month: 'Oct', sales: 820000, purchases: 510000 },
    { month: 'Nov (MTD)', sales: totalSalesAmount, purchases: totalPurchasesAmount },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-[#142238] via-[#1b2c47] to-[#263B58] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                Factory Operating Mode • Single Unit
              </span>
              <span className="text-xs text-slate-300">|</span>
              <span className="text-xs text-slate-300">Currency: PKR (Rs.)</span>
            </div>
            <h2 className="text-2xl font-bold mt-1.5 tracking-tight">Good morning, Factory Executive</h2>
            <p className="text-xs text-slate-300 max-w-xl mt-1">
              Real-time shopping bag extrusion, recycling output, customer Khata, and cashbook records.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={onOpenNewSale}
            >
              New Sale Invoice
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              icon={<Factory className="w-3.5 h-3.5" />}
              onClick={onOpenNewProduction}
            >
              Production Batch
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              icon={<Recycle className="w-3.5 h-3.5" />}
              onClick={onOpenNewRecycling}
            >
              Recycling Batch
            </Button>
          </div>
        </div>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Total Sales"
          value={`Rs. ${totalSalesAmount.toLocaleString()}`}
          subtitle="Revenue generated"
          icon={TrendingUp}
          highlightColor="blue"
          trend={{ value: '+14.2%', isPositive: true }}
          onClick={() => setCurrentView('sales')}
        />
        <KPICard
          title="Total Purchases"
          value={`Rs. ${totalPurchasesAmount.toLocaleString()}`}
          subtitle="Raw material & waste"
          icon={ShoppingCart}
          highlightColor="navy"
          trend={{ value: '+6.1%', isPositive: false }}
          onClick={() => setCurrentView('purchases')}
        />
        <KPICard
          title="Production Output"
          value={`${totalProductionKg.toLocaleString()} kg`}
          subtitle="Finished shopping bags"
          icon={Factory}
          highlightColor="green"
          trend={{ value: '+9.8%', isPositive: true }}
          onClick={() => setCurrentView('production')}
        />
        <KPICard
          title="Total Inventory"
          value={`${totalInventoryKg.toLocaleString()} kg`}
          subtitle="Across 4 categories"
          icon={Boxes}
          highlightColor="amber"
          onClick={() => setCurrentView('inv-overview')}
        />
        <KPICard
          title="Receivables (Khata)"
          value={`Rs. ${totalReceivables.toLocaleString()}`}
          subtitle="Pending customer collection"
          icon={Users}
          highlightColor="red"
          onClick={() => setCurrentView('khata')}
        />
        <KPICard
          title="Cash & Bank Balance"
          value={`Rs. ${totalCashBank.toLocaleString()}`}
          subtitle="Liquid operating funds"
          icon={Wallet}
          highlightColor="green"
          onClick={() => setCurrentView('cash-bank')}
        />
      </div>

      {/* Row 2: Sales Overview Chart + Inventory Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Purchases Comparison Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#1E293B]">Sales & Purchase Revenue Trends</h3>
              <p className="text-xs text-[#64748B]">Monthly comparison of gross sales vs factory raw material purchases (PKR)</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-md text-slate-700">
              FY 2026-27
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySalesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `Rs. ${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: number) => [`Rs. ${val.toLocaleString()}`, '']}
                  contentStyle={{
                    backgroundColor: '#142238',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="sales" name="Sales Revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="purchases" name="Purchases" fill="#94A3B8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4 Separate Inventory Categories Snapshot */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-[#1E293B]">Inventory by Category</h3>
              <button
                onClick={() => setCurrentView('inv-overview')}
                className="text-xs font-semibold text-[#2563EB] hover:underline"
              >
                View Stock
              </button>
            </div>
            <p className="text-xs text-[#64748B] mb-5">
              Categories remain strictly segregated per manufacturing rules
            </p>

            <div className="space-y-4">
              {/* 1. New Branded Raw Material */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#1E293B] mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                    New Branded Raw Material
                  </span>
                  <span>{newMaterialKg.toLocaleString()} kg</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (newMaterialKg / 4000) * 100)}%` }}
                  />
                </div>
              </div>

              {/* 2. Purchased Waste Plastic */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#1E293B] mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    Purchased Waste Plastic
                  </span>
                  <span>{wastePlasticKg.toLocaleString()} kg</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (wastePlasticKg / 3000) * 100)}%` }}
                  />
                </div>
              </div>

              {/* 3. Recycled Raw Material */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#1E293B] mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                    Recycled Raw Material (Output)
                  </span>
                  <span>{recycledMaterialKg.toLocaleString()} kg</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (recycledMaterialKg / 2000) * 100)}%` }}
                  />
                </div>
              </div>

              {/* 4. Finished Shopping Bags */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#1E293B] mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
                    Finished Shopping Bags (ABHA/Crystal)
                  </span>
                  <span>{finishedBagsKg.toLocaleString()} kg</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (finishedBagsKg / 2500) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
            <span>Total Stock On Floor:</span>
            <span className="font-bold text-[#1E293B]">{totalInventoryKg.toLocaleString()} kg</span>
          </div>
        </div>
      </div>

      {/* Row 3: Production Overview (Strict Source Separation) + Actionable Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production Overview (New vs Recycled) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#1E293B]">Production Source Breakdown</h3>
              <p className="text-xs text-[#64748B]">
                Strict segregation: Batches use strictly 100% Recycled OR 100% New Branded Material
              </p>
            </div>
            <button
              onClick={() => setCurrentView('production')}
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              All Batches
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Recycled Source Box */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="recycled">RECYCLED SOURCE</Badge>
                <span className="text-xs text-emerald-800 font-semibold">{recycledBatches.length} Batches</span>
              </div>
              <div className="text-2xl font-bold text-emerald-950 mt-1">
                {recycledProductionKg.toLocaleString()} kg
              </div>
              <p className="text-xs text-emerald-800 mt-1">
                Average conversion cost: <span className="font-bold">Rs. 274.50 / kg</span>
              </p>
              <div className="mt-3 text-[11px] text-emerald-700 bg-emerald-100/60 p-2 rounded">
                Product: ABHA White & ABHA Black shopping bags
              </div>
            </div>

            {/* New Branded Source Box */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="new">NEW BRANDED SOURCE</Badge>
                <span className="text-xs text-blue-800 font-semibold">{newBatches.length} Batches</span>
              </div>
              <div className="text-2xl font-bold text-blue-950 mt-1">
                {newProductionKg.toLocaleString()} kg
              </div>
              <p className="text-xs text-blue-800 mt-1">
                Average conversion cost: <span className="font-bold">Rs. 460.40 / kg</span>
              </p>
              <div className="mt-3 text-[11px] text-blue-700 bg-blue-100/60 p-2 rounded">
                Product: Crystal White & Crystal Black high-tensile bags
              </div>
            </div>
          </div>

          {/* Quick production efficiency indicator */}
          <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">
              Overall Extrusion & Cutting Efficiency:
            </span>
            <span className="font-bold text-[#16A34A] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 93.7% Average Yield (6.3% Processing Loss)
            </span>
          </div>
        </div>

        {/* Actionable Alerts Panel */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Actionable Alerts
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">
                {lowStockItems.length + unpaidInvoices.length} Items
              </span>
            </div>
            <p className="text-xs text-[#64748B] mb-4">Urgent factory stock & payment actions</p>

            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setCurrentView('inv-overview')}
                  className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-amber-900">{item.name}</span>
                    <Badge variant={item.status === 'Critical' ? 'danger' : 'warning'}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-1">
                    On Hand: <span className="font-bold">{item.availableKg} kg</span> (Reorder at {item.reorderLevelKg} kg)
                  </p>
                </div>
              ))}

              {unpaidInvoices.slice(0, 2).map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => setCurrentView('khata')}
                  className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-blue-900">{inv.customerName}</span>
                    <span className="text-xs font-semibold text-rose-600">
                      Rs. {inv.remainingBalance.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-800 mt-1">
                    Invoice {inv.invoiceNumber} • Due {inv.dueDate}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => setCurrentView('reports')}
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              Open Full Audit & Aging Reports &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Row 4: Recent Transactions Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#1E293B]">Recent Business Transactions</h3>
            <p className="text-xs text-[#64748B]">Latest sales, raw material purchases, customer receipts, and expense vouchers</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCurrentView('reports')}>
            View Ledger
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1E293B]">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Reference #</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Party / Particulars</th>
                <th className="py-2.5 px-3">Quantity (kg)</th>
                <th className="py-2.5 px-3 text-right">Amount (PKR)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesInvoices.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500">{sale.saleDate}</td>
                  <td className="py-2.5 px-3 font-semibold text-blue-600">{sale.invoiceNumber}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                      Sale
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium">{sale.customerName}</td>
                  <td className="py-2.5 px-3 font-medium">
                    {sale.items.reduce((acc, i) => acc + i.qtyKg, 0)} kg
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold">
                    Rs. {sale.grandTotal.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <Badge variant={sale.paymentStatus === 'Paid' ? 'success' : sale.paymentStatus === 'Partial' ? 'warning' : 'danger'}>
                      {sale.paymentStatus}
                    </Badge>
                  </td>
                </tr>
              ))}

              {purchaseBills.map((pur) => (
                <tr key={pur.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500">{pur.purchaseDate}</td>
                  <td className="py-2.5 px-3 font-semibold text-purple-600">{pur.purchaseNumber}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800">
                      Purchase
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium">
                    {pur.supplierName} ({pur.materialName})
                  </td>
                  <td className="py-2.5 px-3 font-medium">{pur.quantityKg} kg</td>
                  <td className="py-2.5 px-3 text-right font-bold">
                    Rs. {pur.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <Badge variant={pur.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                      {pur.paymentStatus}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
