'use client';

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ExpenseCategory, ExpenseRecord } from '../../types/erp';
import { KPICard } from '../common/KPICard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Receipt, Plus, FileText, CheckCircle2, Zap, DollarSign, Tag } from 'lucide-react';

export function ExpensesManagementView() {
  const { expenses, addExpense, searchQuery } = useERP();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [category, setCategory] = useState<ExpenseCategory>('Electricity');
  const [payee, setPayee] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(15000);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Cheque'>('Bank Transfer');
  const [status, setStatus] = useState<'Paid' | 'Unpaid'>('Paid');
  const [costCenter, setCostCenter] = useState('Factory Operations');
  const [receiptAttached, setReceiptAttached] = useState(true);

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const powerExpenses = expenses
    .filter((e) => e.category === 'Electricity')
    .reduce((acc, e) => acc + e.amount, 0);
  const maintenanceExpenses = expenses
    .filter((e) => e.category === 'Maintenance')
    .reduce((acc, e) => acc + e.amount, 0);

  const filteredExpenses = expenses.filter((e) => {
    const matchesCat = categoryFilter === 'ALL' || e.category === categoryFilter;
    const matchesSearch =
      searchQuery === '' ||
      e.voucherNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.payee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payee || amount <= 0) return;

    addExpense({
      date: new Date().toISOString().split('T')[0],
      category,
      payee,
      description,
      amount,
      paymentMethod,
      status,
      costCenter,
      receiptAttached,
      enteredBy: 'Tariq Mehmood',
    });

    setIsAddOpen(false);
    setPayee('');
    setDescription('');
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B] tracking-tight">Factory Operating Expenses</h2>
          <p className="text-xs text-[#64748B]">
            Track 3-phase electricity, transport freight, machinery maintenance, rent, kitchen, and office overheads
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsAddOpen(true)}
        >
          Add Expense Voucher
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Total Operating Expenses"
          value={`Rs. ${totalExpenses.toLocaleString()}`}
          subtitle="All overhead vouchers"
          icon={Receipt}
          highlightColor="blue"
        />
        <KPICard
          title="Industrial Power / Electricity"
          value={`Rs. ${powerExpenses.toLocaleString()}`}
          subtitle="LESCO / K-Electric bills"
          icon={Zap}
          highlightColor="amber"
        />
        <KPICard
          title="Plant Maintenance & Spares"
          value={`Rs. ${maintenanceExpenses.toLocaleString()}`}
          subtitle="Extruder screw & parts"
          icon={Receipt}
          highlightColor="navy"
        />
      </div>

      {/* Categories Filter Tabs */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-card flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
        {[
          'ALL',
          'Electricity',
          'Labor',
          'Transport',
          'Maintenance',
          'Rent',
          'Internet',
          'Kitchen',
          'Office',
          'Other',
        ].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
              categoryFilter === cat
                ? 'bg-[#142238] text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1E293B]">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Voucher #</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Payee / Vendor</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Payment Method</th>
                <th className="py-3 px-3 text-right">Amount (PKR)</th>
                <th className="py-3 px-3 text-center">Receipt</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-600">{exp.voucherNumber}</td>
                  <td className="py-3 px-3 text-slate-500">{exp.date}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-800">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{exp.payee}</td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{exp.description}</td>
                  <td className="py-3 px-3 text-slate-600 font-medium">{exp.paymentMethod}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    Rs. {exp.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {exp.receiptAttached ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Attached
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">None</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={exp.status === 'Paid' ? 'success' : 'warning'}>
                      {exp.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Record Expense Voucher"
        subtitle="Capture factory operating costs with receipt attachments"
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Expense Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-bold"
              >
                <option value="Electricity">Electricity & Power</option>
                <option value="Labor">Labor & Factory Wages</option>
                <option value="Transport">Transport & Inbound Freight</option>
                <option value="Maintenance">Machinery Maintenance & Spares</option>
                <option value="Rent">Factory / Godown Rent</option>
                <option value="Internet">Internet & Telecom</option>
                <option value="Kitchen">Kitchen, Tea & Staff Welfare</option>
                <option value="Office">Office Stationery & Admin</option>
                <option value="Other">Other Expenses</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Amount (PKR) *</label>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Payee / Recipient Vendor *</label>
            <input
              type="text"
              required
              placeholder="e.g. K-Electric, Khan Transport, Hardware Store..."
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Expense Description *</label>
            <input
              type="text"
              required
              placeholder="Particulars of expense incurred"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900"
              >
                <option value="Bank Transfer">Bank Transfer (Meezan / HBL)</option>
                <option value="Cash">Cash (Factory Cash Safe)</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Cost Center</label>
              <input
                type="text"
                value={costCenter}
                onChange={(e) => setCostCenter(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="receiptCheck"
              checked={receiptAttached}
              onChange={(e) => setReceiptAttached(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="receiptCheck" className="text-slate-700 font-medium">
              Physical bill / invoice receipt attached to voucher
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Post Expense Voucher
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
