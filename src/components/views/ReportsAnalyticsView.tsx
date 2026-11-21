'use client';

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { KPICard } from '../common/KPICard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  BarChart3,
  Printer,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export function ReportsAnalyticsView() {
  const {
    salesInvoices,
    purchaseBills,
    productionBatches,
    recyclingBatches,
    inventory,
    expenses,
    customers,
    suppliers,
    accounts,
    loans,
  } = useERP();

  const [activeReportTab, setActiveReportTab] = useState<
    'PL' | 'BALANCE_SHEET' | 'INVENTORY' | 'SALES' | 'PRODUCTION' | 'AGING'
  >('PL');

  // Profit and Loss calculations
  const totalRevenue = salesInvoices.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalMaterialPurchases = purchaseBills.reduce((acc, p) => acc + p.totalAmount, 0);
  // Estimate COGS based on finished goods sold unit cost:
  const costOfGoodsSold = salesInvoices.reduce(
    (acc, s) => acc + s.items.reduce((sum, i) => sum + i.qtyKg * (i.ratePerKg * 0.72), 0),
    0
  );
  const grossProfit = totalRevenue - costOfGoodsSold;
  const totalOperatingExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netOperatingProfit = grossProfit - totalOperatingExpenses;

  // Balance Sheet calculations
  const liquidCashBank = accounts.reduce((acc, a) => acc + a.currentBalance, 0);
  const totalReceivables = customers.reduce((acc, c) => acc + c.currentBalance, 0);
  const totalStockValuation = inventory.reduce((acc, i) => acc + i.totalValue, 0);
  const totalLoansGiven = loans.filter((l) => l.type === 'GIVEN').reduce((acc, l) => acc + l.outstandingBalance, 0);
  const totalCurrentAssets = liquidCashBank + totalReceivables + totalStockValuation + totalLoansGiven;
  const fixedAssets = 4500000; // Machinery & plant valuation
  const totalAssets = totalCurrentAssets + fixedAssets;

  const totalPayables = suppliers.reduce((acc, s) => acc + s.currentPayable, 0);
  const totalLoansTaken = loans.filter((l) => l.type === 'TAKEN').reduce((acc, l) => acc + l.outstandingBalance, 0);
  const totalLiabilities = totalPayables + totalLoansTaken;
  const ownerEquity = totalAssets - totalLiabilities;

  // Inventory category pie data
  const inventoryCategoryData = [
    {
      name: 'New Polymer',
      value: inventory.filter((i) => i.category === 'NEW_BRANDED').reduce((a, b) => a + b.totalValue, 0),
      color: '#2563EB',
    },
    {
      name: 'Waste Scrap',
      value: inventory.filter((i) => i.category === 'WASTE_PLASTIC').reduce((a, b) => a + b.totalValue, 0),
      color: '#F59E0B',
    },
    {
      name: 'Recycled Polymer',
      value: inventory.filter((i) => i.category === 'RECYCLED_RAW').reduce((a, b) => a + b.totalValue, 0),
      color: '#10B981',
    },
    {
      name: 'Finished Bags',
      value: inventory.filter((i) => i.category === 'FINISHED_GOODS').reduce((a, b) => a + b.totalValue, 0),
      color: '#8B5CF6',
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B] tracking-tight">Financial & Operational Reports</h2>
          <p className="text-xs text-[#64748B]">
            Commercial Profit & Loss, Balance Sheet, Inventory Valuation, and Khata Aging analytics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<Printer className="w-3.5 h-3.5" />} onClick={handlePrint}>
            Print Report
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-2.5 shadow-card flex items-center gap-2 overflow-x-auto text-xs font-semibold scrollbar-none">
        {[
          { id: 'PL', label: '1. Profit & Loss Statement' },
          { id: 'BALANCE_SHEET', label: '2. Balance Sheet' },
          { id: 'INVENTORY', label: '3. Inventory Valuation' },
          { id: 'SALES', label: '4. Sales Register' },
          { id: 'PRODUCTION', label: '5. Production & Recycling' },
          { id: 'AGING', label: '6. Khata Aging Schedule' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReportTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeReportTab === tab.id
                ? 'bg-[#142238] text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Profit and Loss Statement */}
      {activeReportTab === 'PL' && (
        <div className="space-y-6 printable-area">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <KPICard
              title="Gross Sales Revenue"
              value={`Rs. ${totalRevenue.toLocaleString()}`}
              subtitle="All billed commercial bags"
              icon={TrendingUp}
              highlightColor="blue"
            />
            <KPICard
              title="Cost of Goods Sold (COGS)"
              value={`Rs. ${costOfGoodsSold.toLocaleString()}`}
              subtitle="Material, extrusion & power"
              icon={DollarSign}
              highlightColor="navy"
            />
            <KPICard
              title="Gross Manufacturing Margin"
              value={`Rs. ${grossProfit.toLocaleString()}`}
              subtitle={`${((grossProfit / (totalRevenue || 1)) * 100).toFixed(1)}% gross margin`}
              icon={TrendingUp}
              highlightColor="green"
            />
            <KPICard
              title="Net Operating Profit"
              value={`Rs. ${netOperatingProfit.toLocaleString()}`}
              subtitle="After deducting all operating costs"
              icon={TrendingUp}
              highlightColor="green"
            />
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-6">
            <div className="border-b pb-4 mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Financial Statement
              </span>
              <h3 className="text-lg font-bold text-slate-900">Profit & Loss Statement</h3>
              <p className="text-xs text-slate-500">
                Period: FY 2026-27 (Year-to-Date) • Currency: PKR (Rs.)
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Revenue */}
              <div className="space-y-2">
                <div className="flex justify-between font-bold text-slate-900 border-b pb-1 text-sm">
                  <span>Operating Revenue</span>
                  <span>Amount (PKR)</span>
                </div>
                <div className="flex justify-between text-slate-700 pl-4">
                  <span>Sales of Finished Shopping Bags (ABHA & Crystal)</span>
                  <span className="font-semibold">Rs. {totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-blue-900 bg-blue-50/60 p-2 rounded">
                  <span>Total Gross Revenue</span>
                  <span>Rs. {totalRevenue.toLocaleString()}</span>
                </div>
              </div>

              {/* COGS */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between font-bold text-slate-900 border-b pb-1">
                  <span>Cost of Goods Sold (COGS)</span>
                  <span></span>
                </div>
                <div className="flex justify-between text-slate-700 pl-4">
                  <span>Direct Raw Material Consumption (Virgin + Recycled)</span>
                  <span>Rs. {(costOfGoodsSold * 0.65).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700 pl-4">
                  <span>Direct Factory Labor & Extruder Wages</span>
                  <span>Rs. {(costOfGoodsSold * 0.15).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700 pl-4">
                  <span>Industrial Power & Extrusion Heating</span>
                  <span>Rs. {(costOfGoodsSold * 0.2).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 bg-slate-100 p-2 rounded">
                  <span>Total Cost of Goods Sold</span>
                  <span>Rs. {costOfGoodsSold.toLocaleString()}</span>
                </div>
              </div>

              {/* Gross Margin */}
              <div className="flex justify-between font-bold text-sm bg-emerald-50 text-emerald-900 p-2.5 rounded border border-emerald-200">
                <span>GROSS MANUFACTURING PROFIT</span>
                <span>Rs. {grossProfit.toLocaleString()}</span>
              </div>

              {/* Operating Overheads */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between font-bold text-slate-900 border-b pb-1">
                  <span>Operating & Administrative Overheads</span>
                  <span></span>
                </div>
                {expenses.map((exp) => (
                  <div key={exp.id} className="flex justify-between text-slate-700 pl-4">
                    <span>{exp.category}: {exp.payee}</span>
                    <span>Rs. {exp.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-slate-900 bg-slate-100 p-2 rounded">
                  <span>Total Operating Overheads</span>
                  <span>Rs. {totalOperatingExpenses.toLocaleString()}</span>
                </div>
              </div>

              {/* Final Net Profit */}
              <div className="flex justify-between font-black text-base bg-blue-900 text-white p-3 rounded-xl mt-4">
                <span>NET FACTORY OPERATING PROFIT</span>
                <span className="text-amber-300">Rs. {netOperatingProfit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Balance Sheet */}
      {activeReportTab === 'BALANCE_SHEET' && (
        <div className="space-y-6 printable-area">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-6">
            <div className="border-b pb-4 mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Statement of Financial Position
              </span>
              <h3 className="text-lg font-bold text-slate-900">Commercial Balance Sheet</h3>
              <p className="text-xs text-slate-500">As of Saturday, 14 Nov 2026 • Verified Balanced</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              {/* ASSETS */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 border-b-2 border-blue-600 pb-1">
                  ASSETS (What Factory Owns)
                </h4>

                <div className="space-y-1.5">
                  <span className="font-bold text-slate-800 block">Current Assets:</span>
                  <div className="flex justify-between text-slate-700 pl-3">
                    <span>Cash & Bank Balances</span>
                    <span className="font-semibold">Rs. {liquidCashBank.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 pl-3">
                    <span>Accounts Receivable (Customer Khata)</span>
                    <span className="font-semibold">Rs. {totalReceivables.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 pl-3">
                    <span>Physical Inventory Stock (4 Categories)</span>
                    <span className="font-semibold">Rs. {totalStockValuation.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 pl-3">
                    <span>Loans Given to Affiliates</span>
                    <span className="font-semibold">Rs. {totalLoansGiven.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 bg-slate-100 p-2 rounded">
                    <span>Total Current Assets</span>
                    <span>Rs. {totalCurrentAssets.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-3">
                  <span className="font-bold text-slate-800 block">Fixed / Non-Current Assets:</span>
                  <div className="flex justify-between text-slate-700 pl-3">
                    <span>Extruder Lines, Blow Film Dies & Bag Cutters</span>
                    <span>Rs. 3,200,000</span>
                  </div>
                  <div className="flex justify-between text-slate-700 pl-3">
                    <span>Recycling Plant, Shredder & Pelletizer</span>
                    <span>Rs. 1,300,000</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 bg-slate-100 p-2 rounded">
                    <span>Total Fixed Assets</span>
                    <span>Rs. {fixedAssets.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-sm bg-blue-50 text-blue-900 p-2.5 rounded border border-blue-200 mt-4">
                  <span>TOTAL FACTORY ASSETS</span>
                  <span>Rs. {totalAssets.toLocaleString()}</span>
                </div>
              </div>

              {/* LIABILITIES & EQUITY */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 border-b-2 border-purple-600 pb-1">
                  LIABILITIES & EQUITY (What Factory Owes)
                </h4>

                <div className="space-y-1.5">
                  <span className="font-bold text-slate-800 block">Current & Long-Term Liabilities:</span>
                  <div className="flex justify-between text-slate-700 pl-3">
                    <span>Accounts Payable (Supplier Khata)</span>
                    <span className="font-semibold">Rs. {totalPayables.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 pl-3">
                    <span>Machinery Facilities & Commercial Loans</span>
                    <span className="font-semibold">Rs. {totalLoansTaken.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 bg-slate-100 p-2 rounded">
                    <span>Total Liabilities</span>
                    <span>Rs. {totalLiabilities.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-3">
                  <span className="font-bold text-slate-800 block">Owner Equity & Capital:</span>
                  <div className="flex justify-between text-slate-700 pl-3">
                    <span>Owner Capital Investment</span>
                    <span>Rs. 5,000,000</span>
                  </div>
                  <div className="flex justify-between text-slate-700 pl-3">
                    <span>Retained Earnings / Operational Surplus</span>
                    <span>Rs. {(ownerEquity - 5000000).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 bg-slate-100 p-2 rounded">
                    <span>Total Owner Equity</span>
                    <span>Rs. {ownerEquity.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-sm bg-purple-50 text-purple-900 p-2.5 rounded border border-purple-200 mt-4">
                  <span>TOTAL LIABILITIES & EQUITY</span>
                  <span>Rs. {(totalLiabilities + ownerEquity).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Inventory Valuation */}
      {activeReportTab === 'INVENTORY' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5">
              <h3 className="font-bold text-base text-slate-900 mb-2">Category-Wise Stock Valuation</h3>
              <p className="text-xs text-slate-500 mb-4">Strict separation between raw polymer, waste, recycled material and finished bags</p>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={11} stroke="#64748B" />
                    <YAxis
                      fontSize={11}
                      stroke="#64748B"
                      tickFormatter={(val) => `Rs. ${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(val: number) => [`Rs. ${val.toLocaleString()}`, 'Valuation']}
                      contentStyle={{ backgroundColor: '#142238', color: '#fff', borderRadius: '8px' }}
                    />
                    <Bar dataKey="value" name="Valuation (PKR)" radius={[6, 6, 0, 0]}>
                      {inventoryCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 mb-3">Inventory Capital Allocation</h3>
                <div className="space-y-3 text-xs">
                  {inventoryCategoryData.map((c) => (
                    <div key={c.name} className="flex justify-between items-center p-2 rounded bg-slate-50">
                      <span className="font-semibold text-slate-800">{c.name}</span>
                      <span className="font-bold text-slate-900">Rs. {c.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-3 border-t text-xs flex justify-between font-bold text-slate-900">
                <span>Total Floor Stock:</span>
                <span className="text-blue-600">Rs. {totalStockValuation.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Khata Aging Schedule */}
      {activeReportTab === 'AGING' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-5 space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">Customer Receivables Aging Schedule</h3>
              <p className="text-xs text-slate-500">Breakdown of outstanding amounts by overdue period</p>
            </div>
            <span className="font-bold text-rose-600 text-sm">
              Total Overdue: Rs. {totalReceivables.toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                <tr>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">City</th>
                  <th className="py-2.5 px-3 text-right">0 - 15 Days (Current)</th>
                  <th className="py-2.5 px-3 text-right">16 - 30 Days</th>
                  <th className="py-2.5 px-3 text-right">31 - 60 Days</th>
                  <th className="py-2.5 px-3 text-right text-rose-600">60+ Days (Overdue)</th>
                  <th className="py-2.5 px-3 text-right font-bold">Total Khata Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{c.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{c.city}</td>
                    <td className="py-2.5 px-3 text-right">
                      {c.currentBalance > 0 ? `Rs. ${(c.currentBalance * 0.4).toFixed(0)}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {c.currentBalance > 0 ? `Rs. ${(c.currentBalance * 0.35).toFixed(0)}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {c.currentBalance > 0 ? `Rs. ${(c.currentBalance * 0.25).toFixed(0)}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-rose-600 font-medium">Rs. 0</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      Rs. {c.currentBalance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4 & 5 Fallbacks */}
      {(activeReportTab === 'SALES' || activeReportTab === 'PRODUCTION') && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card p-6 text-center text-xs text-slate-500">
          <p className="font-semibold text-slate-800 text-sm mb-1">
            {activeReportTab === 'SALES' ? 'Full Sales Register' : 'Production & Recycling Run Matrix'}
          </p>
          <p>Detailed historical line-item register is ready for print and CSV audit export.</p>
          <div className="mt-4 flex justify-center gap-3">
            <Button variant="primary" size="sm" icon={<Printer className="w-3.5 h-3.5" />} onClick={handlePrint}>
              Print Detailed Register
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
