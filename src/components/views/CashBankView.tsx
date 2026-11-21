'use client';

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { CashBankAccount, BankTransaction } from '../../types/erp';
import { KPICard } from '../common/KPICard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { CreditCard, ArrowRightLeft, Plus, Building2, Wallet, CheckCircle2, History } from 'lucide-react';

export function CashBankView() {
  const { accounts, bankTransactions, transferCashBank, searchQuery } = useERP();

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [fromAccId, setFromAccId] = useState(accounts[0]?.id || '');
  const [toAccId, setToAccId] = useState(accounts[2]?.id || '');
  const [transferAmount, setTransferAmount] = useState<number>(50000);
  const [reference, setReference] = useState(`TRF-${Math.floor(100 + Math.random() * 900)}`);
  const [memo, setMemo] = useState('Petty cash replenishment');

  const totalLiquidFunds = accounts.reduce((acc, a) => acc + a.currentBalance, 0);
  const bankBalances = accounts
    .filter((a) => a.accountType === 'Bank')
    .reduce((acc, a) => acc + a.currentBalance, 0);
  const cashInHand = accounts
    .filter((a) => a.accountType === 'Cash')
    .reduce((acc, a) => acc + a.currentBalance, 0);

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromAccId === toAccId || transferAmount <= 0) return;

    transferCashBank(fromAccId, toAccId, transferAmount, reference, memo);
    setIsTransferOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B] tracking-tight">Cash & Bank Accounts</h2>
          <p className="text-xs text-[#64748B]">
            Commercial bank books, safe cashbook, deposits, withdrawals, and inter-account fund transfers
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<ArrowRightLeft className="w-3.5 h-3.5" />}
          onClick={() => setIsTransferOpen(true)}
        >
          Transfer Between Accounts
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Total Liquid Funds"
          value={`Rs. ${totalLiquidFunds.toLocaleString()}`}
          subtitle="Combined cash & bank"
          icon={Wallet}
          highlightColor="green"
        />
        <KPICard
          title="Commercial Bank Balances"
          value={`Rs. ${bankBalances.toLocaleString()}`}
          subtitle="Meezan & HBL corporate"
          icon={Building2}
          highlightColor="blue"
        />
        <KPICard
          title="Cash in Hand / Safe"
          value={`Rs. ${cashInHand.toLocaleString()}`}
          subtitle="Factory safe for daily expenses"
          icon={CreditCard}
          highlightColor="navy"
        />
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-card flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {acc.accountType}
                </span>
                <Badge variant="success">{acc.status}</Badge>
              </div>
              <h4 className="font-bold text-slate-900 text-sm truncate">{acc.name}</h4>
              {acc.accountNumber && (
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">A/C: {acc.accountNumber}</p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Balance:</span>
              <span className="text-base font-black text-slate-900">
                Rs. {acc.currentBalance.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Cashbook / Bankbook Ledger Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <History className="w-4 h-4 text-blue-600" />
              Cashbook & Bankbook Statement Ledger
            </h3>
            <p className="text-xs text-slate-500">Chronological fund receipts, payments, and internal transfers</p>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            {bankTransactions.length} Logged Transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1E293B]">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-3">Reference #</th>
                <th className="py-3 px-3">Account</th>
                <th className="py-3 px-3">Transaction Type</th>
                <th className="py-3 px-3">Description / Memo</th>
                <th className="py-3 px-3 text-right">Amount (PKR)</th>
                <th className="py-3 px-4 text-right font-bold">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bankTransactions.map((tx) => {
                const isOut = tx.type === 'PAYMENT' || tx.type === 'TRANSFER_OUT';

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-500">{tx.date}</td>
                    <td className="py-3 px-3 font-bold text-blue-600">{tx.referenceNo}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{tx.accountName}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isOut ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {tx.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {tx.description}
                      {tx.counterAccountName && (
                        <span className="block text-[10px] text-slate-400">
                          Transfer counter-account: {tx.counterAccountName}
                        </span>
                      )}
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-bold ${
                        isOut ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      {isOut ? `- Rs. ${tx.amount.toLocaleString()}` : `+ Rs. ${tx.amount.toLocaleString()}`}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      Rs. {tx.runningBalance.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inter-Account Transfer Modal */}
      <Modal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        title="Inter-Account Fund Transfer"
        subtitle="Transfer funds between bank accounts and factory cash safe"
        maxWidth="md"
      >
        <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
          {/* Rule banner */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-blue-900 leading-relaxed">
              <span className="font-bold">BR-014 Balance Sheet Neutrality:</span> Transfers between
              the business&apos;s own accounts do not recognize revenue or expense.
            </p>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Source Account (From) *</label>
            <select
              value={fromAccId}
              onChange={(e) => setFromAccId(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-bold"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — Balance: Rs. {a.currentBalance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Destination Account (To) *
            </label>
            <select
              value={toAccId}
              onChange={(e) => setToAccId(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-bold"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — Balance: Rs. {a.currentBalance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Transfer Amount (PKR) *</label>
              <input
                type="number"
                min="1"
                required
                value={transferAmount}
                onChange={(e) => setTransferAmount(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold text-sm"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Transfer Reference #</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Memo / Purpose</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" type="button" onClick={() => setIsTransferOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Complete Transfer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
