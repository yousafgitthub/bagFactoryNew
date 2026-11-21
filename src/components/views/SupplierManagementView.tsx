'use client';

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { KPICard } from '../common/KPICard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Truck, Plus, DollarSign, Phone, MapPin, Building2, CheckCircle2 } from 'lucide-react';
import { Supplier } from '../../types/erp';

export function SupplierManagementView() {
  const { suppliers, recordSupplierPayment, searchQuery } = useERP();

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(100000);
  const [paymentAccount, setPaymentAccount] = useState('Meezan Bank Ltd');
  const [referenceNo, setReferenceNo] = useState(`PAY-${Math.floor(100 + Math.random() * 900)}`);

  const totalPayables = suppliers.reduce((acc, s) => acc + s.currentPayable, 0);
  const totalPurchases = suppliers.reduce((acc, s) => acc + s.totalPurchases, 0);
  const totalPaid = suppliers.reduce((acc, s) => acc + s.paymentsMade, 0);

  const filteredSuppliers = suppliers.filter((s) => {
    return (
      searchQuery === '' ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || payAmount <= 0) return;

    recordSupplierPayment(selectedSupplier.id, payAmount, paymentAccount, referenceNo);
    setIsPayOpen(false);
    setSelectedSupplier(null);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B] tracking-tight">Supplier Directory & Payables</h2>
          <p className="text-xs text-[#64748B]">
            Raw material importers, scrap plastic vendors, and factory supplies ledgers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Active Suppliers"
          value={suppliers.length}
          subtitle="Polymer & scrap vendors"
          icon={Truck}
          highlightColor="blue"
        />
        <KPICard
          title="Total Purchases Incurred"
          value={`Rs. ${totalPurchases.toLocaleString()}`}
          subtitle="Cumulative procurement"
          icon={Truck}
          highlightColor="navy"
        />
        <KPICard
          title="Total Outstanding Payables"
          value={`Rs. ${totalPayables.toLocaleString()}`}
          subtitle="We owe to suppliers"
          icon={Truck}
          highlightColor="red"
        />
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1E293B]">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-3">Supplier Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">City & Address</th>
                <th className="py-3 px-3">Contact Person</th>
                <th className="py-3 px-3 text-right">Total Purchases</th>
                <th className="py-3 px-3 text-right">Total Paid</th>
                <th className="py-3 px-3 text-right font-bold text-slate-900">Current Payable</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.map((sup) => (
                <tr key={sup.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-purple-700">{sup.code}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{sup.name}</td>
                  <td className="py-3 px-3">
                    <Badge variant={sup.category.includes('New') ? 'new' : 'warning'}>
                      {sup.category}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    <span className="font-semibold text-slate-800">{sup.city}</span>
                    <span className="block text-[10px] text-slate-400 truncate max-w-[160px]">
                      {sup.address}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    <span className="font-medium text-slate-900 block">{sup.contactPerson}</span>
                    <span className="text-[10px] text-slate-500">{sup.phone}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-900">
                    Rs. {sup.totalPurchases.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-emerald-700">
                    Rs. {sup.paymentsMade.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-rose-600 text-sm">
                    Rs. {sup.currentPayable.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Badge variant="success">{sup.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs py-1 px-2.5"
                      onClick={() => {
                        setSelectedSupplier(sup);
                        setPayAmount(Math.min(sup.currentPayable, 100000));
                        setIsPayOpen(true);
                      }}
                    >
                      Pay Supplier
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Supplier Modal */}
      <Modal
        isOpen={isPayOpen}
        onClose={() => {
          setIsPayOpen(false);
          setSelectedSupplier(null);
        }}
        title="Disburse Supplier Payment"
        subtitle={`Paying: ${selectedSupplier?.name}`}
        maxWidth="md"
      >
        <form onSubmit={handlePaySubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
            <span className="text-rose-900 block font-medium">Outstanding Bill Balance We Owe:</span>
            <span className="text-xl font-bold text-rose-700">
              Rs. {selectedSupplier?.currentPayable.toLocaleString()}
            </span>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Payment Reference # *</label>
            <input
              type="text"
              required
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Payment Amount (PKR) *</label>
            <input
              type="number"
              min="1"
              required
              value={payAmount}
              onChange={(e) => setPayAmount(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold text-base"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Disburse From Account *</label>
            <select
              value={paymentAccount}
              onChange={(e) => setPaymentAccount(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900"
            >
              <option value="Meezan Bank Ltd">Meezan Bank Ltd (A/C: 0289-0103492819)</option>
              <option value="Habib Bank Limited - HBL">Habib Bank Limited - HBL (A/C: 1104-7901238491)</option>
              <option value="Factory Main Cash Safe">Factory Main Cash Safe</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsPayOpen(false);
                setSelectedSupplier(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm & Post Payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
