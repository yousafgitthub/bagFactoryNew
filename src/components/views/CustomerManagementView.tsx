'use client';

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { KPICard } from '../common/KPICard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Users, Plus, Phone, MapPin, BookOpen, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';

export function CustomerManagementView() {
  const { customers, searchQuery, setCurrentView, setSelectedEntityId } = useERP();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const totalReceivables = customers.reduce((acc, c) => acc + c.currentBalance, 0);
  const totalSalesToDate = customers.reduce((acc, c) => acc + c.totalSales, 0);

  const filteredCustomers = customers.filter((c) => {
    return (
      searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B] tracking-tight">Customer Management</h2>
          <p className="text-xs text-[#64748B]">
            Maintain client directories, credit limits, total business, and digital Khata accounts
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<BookOpen className="w-3.5 h-3.5" />}
            onClick={() => setCurrentView('khata')}
          >
            Open Khata Ledger
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsAddOpen(true)}
          >
            Add Customer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Total Active Customers"
          value={customers.length}
          subtitle="Commercial wholesale buyers"
          icon={Users}
          highlightColor="blue"
        />
        <KPICard
          title="Total Lifetime Invoiced"
          value={`Rs. ${totalSalesToDate.toLocaleString()}`}
          subtitle="Gross business with clients"
          icon={Users}
          highlightColor="navy"
        />
        <KPICard
          title="Total Current Receivables"
          value={`Rs. ${totalReceivables.toLocaleString()}`}
          subtitle="Uncollected Khata balance"
          icon={Users}
          highlightColor="red"
        />
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1E293B]">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-3">Customer / Business Name</th>
                <th className="py-3 px-3">City & Address</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3 text-right">Credit Limit</th>
                <th className="py-3 px-3 text-right">Total Invoiced</th>
                <th className="py-3 px-3 text-right">Total Paid</th>
                <th className="py-3 px-3 text-right">Khata Balance</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((cust) => {
                const isOverLimit = cust.creditLimit > 0 && cust.currentBalance > cust.creditLimit;

                return (
                  <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-600">{cust.code}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{cust.name}</span>
                      <span className="text-[10px] text-slate-400">{cust.companyName}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <span className="font-medium text-slate-800">{cust.city}</span>
                      <span className="block text-[10px] text-slate-400 truncate max-w-[180px]">
                        {cust.address}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{cust.phone}</td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700">
                      Rs. {cust.creditLimit.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-900">
                      Rs. {cust.totalSales.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-emerald-700">
                      Rs. {cust.paymentsReceived.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-bold">
                      <span className={cust.currentBalance > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                        Rs. {cust.currentBalance.toLocaleString()}
                      </span>
                      {isOverLimit && (
                        <span className="block text-[9px] text-rose-500 font-bold uppercase">
                          Over Limit!
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant="success">{cust.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs py-1 px-2.5"
                        icon={<BookOpen className="w-3.5 h-3.5 text-blue-600" />}
                        onClick={() => {
                          setSelectedEntityId(cust.id);
                          setCurrentView('khata');
                        }}
                      >
                        Khata
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
