'use client';

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { SalesInvoice } from '../../types/erp';
import { KPICard } from '../common/KPICard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { CreateSalesInvoiceModal, InvoiceDetailModal } from './CreateSalesInvoiceModal';
import { ShoppingBag, Plus, Eye, Printer, BookOpen, Search, ArrowRight, Download, FileSpreadsheet } from 'lucide-react';
import { exportSalesRegisterCSV, generateInvoicePDF } from '../../utils/exportUtils';

export function SalesOverviewView() {
  const { salesInvoices, searchQuery, setCurrentView, setSelectedEntityId } = useERP();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Paid' | 'Partial' | 'Unpaid'>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(null);

  const totalSalesRevenue = salesInvoices.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalVolumeKg = salesInvoices.reduce(
    (acc, s) => acc + s.items.reduce((sum, i) => sum + i.qtyKg, 0),
    0
  );
  const totalReceived = salesInvoices.reduce((acc, s) => acc + s.amountReceived, 0);
  const totalPending = salesInvoices.reduce((acc, s) => acc + s.remainingBalance, 0);

  const filteredInvoices = salesInvoices.filter((inv) => {
    const matchesStatus = statusFilter === 'ALL' || inv.paymentStatus === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B] tracking-tight">Sales & Commercial Invoices</h2>
          <p className="text-xs text-[#64748B]">
            Shopping bags sold in kilograms • Instant integration with Customer Khata & Warehouse Inventory
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
            onClick={() => exportSalesRegisterCSV(filteredInvoices)}
          >
            Export Excel / CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsCreateOpen(true)}
          >
            New Sales Invoice
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Sales Invoiced"
          value={`Rs. ${totalSalesRevenue.toLocaleString()}`}
          subtitle="Gross commercial sales"
          icon={ShoppingBag}
          highlightColor="blue"
        />
        <KPICard
          title="Total Bags Sold"
          value={`${totalVolumeKg.toLocaleString()} kg`}
          subtitle="Physical weight dispatched"
          icon={ShoppingBag}
          highlightColor="navy"
        />
        <KPICard
          title="Payments Collected"
          value={`Rs. ${totalReceived.toLocaleString()}`}
          subtitle="Realized into cash & bank"
          icon={ShoppingBag}
          highlightColor="green"
        />
        <KPICard
          title="Outstanding Receivables"
          value={`Rs. ${totalPending.toLocaleString()}`}
          subtitle="Pending customer collection"
          icon={ShoppingBag}
          highlightColor="red"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-card flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Status:</span>
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs">
            {['ALL', 'Paid', 'Partial', 'Unpaid'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  statusFilter === status
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setCurrentView('khata')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <BookOpen className="w-3.5 h-3.5" /> View Full Customer Khata Ledger &rarr;
        </button>
      </div>

      {/* Sales Invoices Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1E293B]">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Products & Variants</th>
                <th className="py-3 px-3 text-right">Qty (kg)</th>
                <th className="py-3 px-3 text-right">Grand Total (PKR)</th>
                <th className="py-3 px-3 text-right">Received</th>
                <th className="py-3 px-3 text-right">Balance</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => {
                const totalKg = inv.items.reduce((sum, i) => sum + i.qtyKg, 0);

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-600">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3 text-slate-500">{inv.saleDate}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{inv.customerName}</td>
                    <td className="py-3 px-3 text-slate-600">
                      <div className="truncate max-w-[200px]">
                        {inv.items.map((i) => `${i.productName} (${i.color})`).join(', ')}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">{totalKg} kg</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      Rs. {inv.grandTotal.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-emerald-700">
                      Rs. {inv.amountReceived.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-rose-600">
                      Rs. {inv.remainingBalance.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge
                        variant={
                          inv.paymentStatus === 'Paid'
                            ? 'success'
                            : inv.paymentStatus === 'Partial'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {inv.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          title="Print / View Invoice"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEntityId(inv.customerId);
                            setCurrentView('khata');
                          }}
                          title="View Customer Khata"
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        >
                          <BookOpen className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <CreateSalesInvoiceModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <InvoiceDetailModal
        invoice={selectedInvoice}
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
}
