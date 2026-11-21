'use client';

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { KPICard } from '../common/KPICard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { CreatePurchaseModal } from './CreatePurchaseModal';
import { ShoppingCart, Plus, FileText, Truck } from 'lucide-react';

export function PurchasesOverviewView() {
  const { purchaseBills, searchQuery, setCurrentView } = useERP();
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'NEW_BRANDED' | 'WASTE_PLASTIC'>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const totalPurchases = purchaseBills.reduce((acc, p) => acc + p.totalAmount, 0);
  const totalVolumeKg = purchaseBills.reduce((acc, p) => acc + p.quantityKg, 0);
  const totalPaid = purchaseBills.reduce((acc, p) => acc + p.paidAmount, 0);
  const totalPayable = purchaseBills.reduce((acc, p) => acc + p.remainingPayable, 0);

  const filteredBills = purchaseBills.filter((bill) => {
    const matchesCat = categoryFilter === 'ALL' || bill.category === categoryFilter;
    const matchesSearch =
      searchQuery === '' ||
      bill.purchaseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.materialName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B] tracking-tight">Purchases & Supplier Bills</h2>
          <p className="text-xs text-[#64748B]">
            Procurement of virgin polymer resin, waste plastic scrap, and factory consumables
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsCreateOpen(true)}
        >
          New Purchase Bill
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Purchases"
          value={`Rs. ${totalPurchases.toLocaleString()}`}
          subtitle="Gross raw material bills"
          icon={ShoppingCart}
          highlightColor="blue"
        />
        <KPICard
          title="Total Weight Procured"
          value={`${totalVolumeKg.toLocaleString()} kg`}
          subtitle="Received at weighbridge"
          icon={Truck}
          highlightColor="navy"
        />
        <KPICard
          title="Total Paid to Suppliers"
          value={`Rs. ${totalPaid.toLocaleString()}`}
          subtitle="Disbursed via bank & cash"
          icon={ShoppingCart}
          highlightColor="green"
        />
        <KPICard
          title="Supplier Payables"
          value={`Rs. ${totalPayable.toLocaleString()}`}
          subtitle="Outstanding liabilities"
          icon={ShoppingCart}
          highlightColor="red"
        />
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-card flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Category:</span>
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                categoryFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              All Purchases
            </button>
            <button
              onClick={() => setCategoryFilter('NEW_BRANDED')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                categoryFilter === 'NEW_BRANDED' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              New Polymer
            </button>
            <button
              onClick={() => setCategoryFilter('WASTE_PLASTIC')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                categoryFilter === 'WASTE_PLASTIC' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              Waste Scrap
            </button>
          </div>
        </div>

        <button
          onClick={() => setCurrentView('suppliers')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800"
        >
          View Supplier Directory & Balances &rarr;
        </button>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1E293B]">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Purchase #</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Supplier</th>
                <th className="py-3 px-3">Material Category</th>
                <th className="py-3 px-3">Material Name</th>
                <th className="py-3 px-3 text-right">Quantity (kg)</th>
                <th className="py-3 px-3 text-right">Rate / kg</th>
                <th className="py-3 px-3 text-right">Total Bill (PKR)</th>
                <th className="py-3 px-3 text-right">Paid</th>
                <th className="py-3 px-3 text-right">Balance</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-purple-700">{bill.purchaseNumber}</td>
                  <td className="py-3 px-3 text-slate-500">{bill.purchaseDate}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{bill.supplierName}</td>
                  <td className="py-3 px-3">
                    <Badge variant={bill.category === 'NEW_BRANDED' ? 'new' : 'warning'}>
                      {bill.category.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-800">{bill.materialName}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">{bill.quantityKg} kg</td>
                  <td className="py-3 px-3 text-right font-medium text-slate-600">Rs. {bill.ratePerKg}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    Rs. {bill.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-emerald-700">
                    Rs. {bill.paidAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-rose-600">
                    Rs. {bill.remainingPayable.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Badge variant={bill.paymentStatus === 'Paid' ? 'success' : bill.paymentStatus === 'Partial' ? 'warning' : 'danger'}>
                      {bill.paymentStatus}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreatePurchaseModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
