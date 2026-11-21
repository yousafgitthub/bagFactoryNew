'use client';

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { LoanRecord } from '../../types/erp';
import { KPICard } from '../common/KPICard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Landmark, Plus, ArrowUpRight, ArrowDownRight, ShieldCheck } from 'lucide-react';

export function LoansManagementView() {
  const { loans, accounts, searchQuery } = useERP();
  const [activeTab, setActiveTab] = useState<'TAKEN' | 'GIVEN'>('TAKEN');

  const loansTaken = loans.filter((l) => l.type === 'TAKEN');
  const loansGiven = loans.filter((l) => l.type === 'GIVEN');

  const totalTakenOutstanding = loansTaken.reduce((acc, l) => acc + l.outstandingBalance, 0);
  const totalGivenOutstanding = loansGiven.reduce((acc, l) => acc + l.outstandingBalance, 0);

  const displayedLoans = (activeTab === 'TAKEN' ? loansTaken : loansGiven).filter((l) => {
    return (
      searchQuery === '' ||
      l.loanNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.counterparty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.purpose.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B] tracking-tight">Factory Loans & Financial Facilities</h2>
          <p className="text-xs text-[#64748B]">
            Strict separation: Loans Taken are Liabilities; Loans Given are Receivables. Principal repayments do not alter P&L.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('TAKEN')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'TAKEN' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Loans Taken (Liabilities)
          </button>
          <button
            onClick={() => setActiveTab('GIVEN')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'GIVEN' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Loans Given (Assets / Receivables)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          title="Total Loans Taken (Liability)"
          value={`Rs. ${totalTakenOutstanding.toLocaleString()}`}
          subtitle="Owed to banks & capital partners"
          icon={Landmark}
          highlightColor="red"
        />
        <KPICard
          title="Total Loans Given (Asset)"
          value={`Rs. ${totalGivenOutstanding.toLocaleString()}`}
          subtitle="Receivable from trade affiliates"
          icon={Landmark}
          highlightColor="green"
        />
        <KPICard
          title="Active Loan Agreements"
          value={loans.length}
          subtitle="Recorded legal agreements"
          icon={ShieldCheck}
          highlightColor="navy"
        />
      </div>

      {/* Accounting Notice Banner */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-slate-700">
            <span className="font-bold">Accounting Rule (BR-012/013):</span> Loan proceeds and
            principal repayments are balance-sheet balance movements, never recognized as sales
            income or operating expenses.
          </span>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            {activeTab === 'TAKEN'
              ? 'External Loans Taken (Business Liabilities)'
              : 'Affiliate Loans Given (Business Assets)'}
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            {displayedLoans.length} Active Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1E293B]">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Loan #</th>
                <th className="py-3 px-3">Counterparty / Lender / Borrower</th>
                <th className="py-3 px-3">Purpose / Notes</th>
                <th className="py-3 px-3 text-right">Principal Amount</th>
                <th className="py-3 px-3 text-right">Repaid Amount</th>
                <th className="py-3 px-3 text-right font-bold text-slate-900">Outstanding Balance</th>
                <th className="py-3 px-3 text-center">Interest Rate</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedLoans.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-600">{l.loanNumber}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{l.counterparty}</td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{l.purpose}</td>
                  <td className="py-3 px-3 text-right font-medium">Rs. {l.principal.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right font-medium text-emerald-700">
                    Rs. {l.repaidAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-sm">
                    <span className={activeTab === 'TAKEN' ? 'text-rose-600' : 'text-blue-700'}>
                      Rs. {l.outstandingBalance.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-medium">
                    {l.interestRatePct === 0 ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        0% (Qarz-e-Hasana)
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-800">{l.interestRatePct}% p.a.</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-500">{l.dueDate}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="success">{l.status}</Badge>
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
