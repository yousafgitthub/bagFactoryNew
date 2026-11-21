'use client';

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { KhataEntry } from '../../types/erp';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  BookOpen,
  Plus,
  Printer,
  Calendar,
  Building2,
  DollarSign,
  Phone,
  MapPin,
  TrendingUp,
} from 'lucide-react';

export function CustomerKhataView() {
  const { customers, customerKhata, selectedEntityId, setSelectedEntityId, recordCustomerPayment } =
    useERP();

  const [activeCustomerId, setActiveCustomerId] = useState<string>(
    selectedEntityId || customers[0]?.id || ''
  );

  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(50000);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer (Meezan Bank)');
  const [referenceNo, setReferenceNo] = useState(`RCP-${Math.floor(600 + Math.random() * 300)}`);
  const [paymentNotes, setPaymentNotes] = useState('');

  const currentCustomer =
    customers.find((c) => c.id === activeCustomerId) || customers[0];

  const ledgerEntries = customerKhata[currentCustomer?.id || ''] || [
    {
      id: 'k-default',
      date: '2026-10-01',
      referenceNo: 'OB-2026',
      description: 'Opening Balance as per register',
      type: 'OPENING_BALANCE',
      debit: currentCustomer?.openingBalance || 0,
      credit: 0,
      runningBalance: currentCustomer?.openingBalance || 0,
    },
  ];

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer || paymentAmount <= 0) return;

    recordCustomerPayment(
      currentCustomer.id,
      paymentAmount,
      paymentMethod,
      referenceNo,
      paymentNotes
    );
    setIsRecordPaymentOpen(false);
    setPaymentAmount(0);
    setPaymentNotes('');
  };

  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Customer Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B] tracking-tight">Customer Khata (Digital Ledger)</h2>
          <p className="text-xs text-[#64748B]">
            Double-entry verified customer running balance with payment tracking & printable statements
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={<Printer className="w-3.5 h-3.5" />}
            onClick={handlePrintStatement}
          >
            Print Statement
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsRecordPaymentOpen(true)}
          >
            Record Payment Receipt
          </Button>
        </div>
      </div>

      {/* Customer Selector Card */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Active Customer Ledger
            </label>
            <select
              value={activeCustomerId}
              onChange={(e) => {
                setActiveCustomerId(e.target.value);
                setSelectedEntityId(e.target.value);
              }}
              className="text-sm font-bold text-slate-900 border border-slate-300 rounded-lg p-1.5 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — Balance: Rs. {c.currentBalance.toLocaleString()} ({c.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {currentCustomer && (
          <div className="flex items-center gap-6 text-xs text-slate-600 flex-wrap">
            <div>
              <span className="text-slate-400 block text-[10px]">Company / Shop</span>
              <span className="font-semibold text-slate-800">{currentCustomer.companyName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">City / Location</span>
              <span className="font-semibold text-slate-800">{currentCustomer.city}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Phone Contact</span>
              <span className="font-semibold text-slate-800">{currentCustomer.phone}</span>
            </div>
          </div>
        )}
      </div>

      {/* Khata Summary Cards */}
      {currentCustomer && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl shadow-card">
            <span className="text-slate-500 text-xs font-medium block">Opening Balance</span>
            <span className="text-xl font-bold text-slate-800 mt-1 block">
              Rs. {currentCustomer.openingBalance.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">Brought forward at go-live</span>
          </div>

          <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl shadow-card">
            <span className="text-slate-500 text-xs font-medium block">Total Invoiced (Debit)</span>
            <span className="text-xl font-bold text-blue-600 mt-1 block">
              Rs. {currentCustomer.totalSales.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">All purchases made by customer</span>
          </div>

          <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl shadow-card">
            <span className="text-slate-500 text-xs font-medium block">Payments Received (Credit)</span>
            <span className="text-xl font-bold text-emerald-600 mt-1 block">
              Rs. {currentCustomer.paymentsReceived.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">Total cash & bank deposits</span>
          </div>

          <div className="p-4 bg-gradient-to-br from-slate-900 to-[#142238] text-white rounded-xl shadow-card flex flex-col justify-between">
            <div>
              <span className="text-slate-300 text-xs font-semibold block uppercase tracking-wider">
                Current Khata Balance
              </span>
              <span className="text-2xl font-black text-amber-300 mt-1 block tracking-tight">
                Rs. {currentCustomer.currentBalance.toLocaleString()}
              </span>
            </div>
            <span className="text-[11px] text-slate-300 mt-2 font-medium bg-white/10 px-2 py-0.5 rounded w-fit">
              Customer owes us: Rs. {currentCustomer.currentBalance.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Running Ledger Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden printable-area">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Transaction Ledger Statement: {currentCustomer?.name}
            </h3>
            <p className="text-xs text-slate-500">
              Chronological running debit, credit, and balance entries
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            {ledgerEntries.length} Ledger Entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1E293B]">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-3">Reference #</th>
                <th className="py-3 px-3">Description / Particulars</th>
                <th className="py-3 px-3 text-right text-blue-700">Debit (Billed)</th>
                <th className="py-3 px-3 text-right text-emerald-700">Credit (Paid)</th>
                <th className="py-3 px-4 text-right font-bold text-slate-900">Running Balance (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledgerEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 text-slate-500 font-medium">{entry.date}</td>
                  <td className="py-3 px-3 font-bold text-blue-600">{entry.referenceNo}</td>
                  <td className="py-3 px-3 font-medium text-slate-800">
                    {entry.description}
                    {entry.notes && (
                      <span className="block text-[10px] text-slate-400">{entry.notes}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-blue-700">
                    {entry.debit > 0 ? `Rs. ${entry.debit.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-emerald-700">
                    {entry.credit > 0 ? `Rs. ${entry.credit.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                    Rs. {entry.runningBalance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ledger Bottom Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
          <span>Official computerized statement of accounts. All amounts in PKR (Rs.)</span>
          <div className="flex gap-4 font-bold text-slate-900">
            <span>Closing Net Receivable:</span>
            <span className="text-rose-600 font-black">
              Rs. {currentCustomer?.currentBalance.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        title="Record Customer Payment Receipt"
        subtitle={`Crediting payment for: ${currentCustomer?.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-blue-900 block font-medium">Current Outstanding Balance:</span>
            <span className="text-xl font-bold text-blue-700">
              Rs. {currentCustomer?.currentBalance.toLocaleString()}
            </span>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Receipt Reference # *</label>
            <input
              type="text"
              required
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Amount Received (PKR) *</label>
            <input
              type="number"
              min="1"
              required
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold text-base text-emerald-700"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Deposit Account / Method *</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900"
            >
              <option value="Bank Transfer (Meezan Bank)">Meezan Bank Ltd (A/C: 0289-0103492819)</option>
              <option value="Bank Transfer (HBL)">Habib Bank Limited - HBL (A/C: 1104-7901238491)</option>
              <option value="Cash (Factory Safe)">Factory Main Cash Safe (Cash Receipt)</option>
              <option value="Mobile Wallet (JazzCash)">JazzCash Corporate Wallet</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Payment Particulars / Memo</label>
            <input
              type="text"
              placeholder="e.g. Cleared via online bank slip #59102"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" type="button" onClick={() => setIsRecordPaymentOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Credit Customer Khata
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
