'use client';

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Employee, SalaryPayment } from '../../types/erp';
import { KPICard } from '../common/KPICard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { UserCheck, Wallet, Plus, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';

export function EmployeeManagementView() {
  const { employees, salaryPayments, paySalary, recordAdvance, searchQuery } = useERP();

  const [activeTab, setActiveTab] = useState<'EMPLOYEES' | 'SALARIES'>('EMPLOYEES');
  const [isPaySalaryOpen, setIsPaySalaryOpen] = useState(false);
  const [isAdvanceOpen, setIsAdvanceOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Salary form states
  const [period, setPeriod] = useState('November 2026');
  const [basePay, setBasePay] = useState<number>(65000);
  const [overtime, setOvertime] = useState<number>(5000);
  const [advanceDeduction, setAdvanceDeduction] = useState<number>(10000);
  const [otherDeductions, setOtherDeductions] = useState<number>(0);
  const [paymentAccount, setPaymentAccount] = useState('Meezan Bank Ltd');

  // Advance form state
  const [advanceAmount, setAdvanceAmount] = useState<number>(5000);

  const totalMonthlyPayroll = employees
    .filter((e) => e.wageType === 'Monthly Salary')
    .reduce((acc, e) => acc + e.baseRate, 0);
  const totalActiveAdvances = employees.reduce((acc, e) => acc + e.activeAdvances, 0);

  const netPayableCalc = Math.max(0, basePay + overtime - advanceDeduction - otherDeductions);

  const handleOpenSalaryModal = (emp: Employee) => {
    setSelectedEmployee(emp);
    setBasePay(emp.baseRate);
    setOvertime(0);
    setAdvanceDeduction(Math.min(emp.activeAdvances, 10000));
    setOtherDeductions(0);
    setIsPaySalaryOpen(true);
  };

  const handleSalarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    paySalary({
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      period,
      basePay,
      overtime,
      advanceDeduction, // Deducted from advance ledger without double counting per BR-016
      otherDeductions,
      netPayable: netPayableCalc,
      paidAmount: netPayableCalc,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentAccount,
    });

    setIsPaySalaryOpen(false);
    setSelectedEmployee(null);
  };

  const handleAdvanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || advanceAmount <= 0) return;

    recordAdvance(selectedEmployee.id, advanceAmount);
    setIsAdvanceOpen(false);
    setSelectedEmployee(null);
  };

  const filteredEmployees = employees.filter((e) => {
    return (
      searchQuery === '' ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B] tracking-tight">Employees, Wages & Payroll</h2>
          <p className="text-xs text-[#64748B]">
            Manage factory labor roster, extrusion masters, monthly salaries, daily wages, and advance recovery
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('EMPLOYEES')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'EMPLOYEES' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Employee Roster ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab('SALARIES')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'SALARIES' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Salary Disbursements ({salaryPayments.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Active Workforce"
          value={employees.length}
          subtitle="Masters, operators & labor"
          icon={UserCheck}
          highlightColor="blue"
        />
        <KPICard
          title="Monthly Payroll Base"
          value={`Rs. ${totalMonthlyPayroll.toLocaleString()}`}
          subtitle="Fixed monthly wage obligations"
          icon={Wallet}
          highlightColor="navy"
        />
        <KPICard
          title="Unsettled Salary Advances"
          value={`Rs. ${totalActiveAdvances.toLocaleString()}`}
          subtitle="Pre-paid employee advances"
          icon={Wallet}
          highlightColor="amber"
        />
      </div>

      {activeTab === 'EMPLOYEES' ? (
        /* Employee Roster Table */
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1E293B]">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-3">Employee Name</th>
                  <th className="py-3 px-3">Role & Designation</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Wage Basis</th>
                  <th className="py-3 px-3 text-right">Base Rate</th>
                  <th className="py-3 px-3 text-right">Active Advances</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-600">{emp.code}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {emp.name}
                      <span className="block text-[10px] text-slate-400 font-normal">{emp.phone}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{emp.role}</td>
                    <td className="py-3 px-3 text-slate-600">{emp.department}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {emp.wageType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      Rs. {emp.baseRate.toLocaleString()}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">
                        {emp.wageType === 'Daily Wage' ? '/ day' : '/ mo'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-amber-600">
                      {emp.activeAdvances > 0 ? `Rs. ${emp.activeAdvances.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant="success">{emp.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs py-1 px-2 text-amber-700 hover:bg-amber-50"
                          onClick={() => {
                            setSelectedEmployee(emp);
                            setAdvanceAmount(5000);
                            setIsAdvanceOpen(true);
                          }}
                        >
                          + Advance
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          className="text-xs py-1 px-2.5"
                          onClick={() => handleOpenSalaryModal(emp)}
                        >
                          Pay Salary
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Salary Payment History Table */
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1E293B]">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Disbursement #</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Employee</th>
                  <th className="py-3 px-3">Pay Period</th>
                  <th className="py-3 px-3 text-right">Base Pay</th>
                  <th className="py-3 px-3 text-right">Overtime</th>
                  <th className="py-3 px-3 text-right text-amber-700">Advance Deducted</th>
                  <th className="py-3 px-3 text-right font-bold">Net Disbursed (PKR)</th>
                  <th className="py-3 px-3">Bank / Account</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salaryPayments.map((sal) => (
                  <tr key={sal.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-600">{sal.salaryId}</td>
                    <td className="py-3 px-3 text-slate-500">{sal.paymentDate}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{sal.employeeName}</td>
                    <td className="py-3 px-3 text-slate-600">{sal.period}</td>
                    <td className="py-3 px-3 text-right font-medium">Rs. {sal.basePay.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-medium text-emerald-700">
                      {sal.overtime > 0 ? `+ Rs. ${sal.overtime.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-amber-700">
                      {sal.advanceDeduction > 0 ? `- Rs. ${sal.advanceDeduction.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 text-sm">
                      Rs. {sal.paidAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{sal.paymentAccount}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="success">{sal.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pay Salary Modal */}
      <Modal
        isOpen={isPaySalaryOpen}
        onClose={() => {
          setIsPaySalaryOpen(false);
          setSelectedEmployee(null);
        }}
        title="Disburse Salary & Settle Advances"
        subtitle={`Preparing payroll for: ${selectedEmployee?.name} (${selectedEmployee?.role})`}
        maxWidth="lg"
      >
        <form onSubmit={handleSalarySubmit} className="space-y-4 text-xs">
          {/* BR-016 Notice */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-blue-900 leading-relaxed">
              <span className="font-bold">Zero Double-Count Accounting (BR-016):</span> Advance
              deductions recover pre-paid employee receivables and do not recognize salary expense twice.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Payroll Period *</label>
              <input
                type="text"
                required
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Payment Account *</label>
              <select
                value={paymentAccount}
                onChange={(e) => setPaymentAccount(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900"
              >
                <option value="Meezan Bank Ltd">Meezan Bank Ltd</option>
                <option value="Habib Bank Limited - HBL">Habib Bank Limited - HBL</option>
                <option value="Factory Main Cash Safe">Factory Main Cash Safe</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Base Salary (PKR) *</label>
              <input
                type="number"
                min="0"
                required
                value={basePay}
                onChange={(e) => setBasePay(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Overtime Allowance (PKR)</label>
              <input
                type="number"
                min="0"
                value={overtime}
                onChange={(e) => setOvertime(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold text-emerald-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Advance Recovery Deduction (PKR)
              </label>
              <input
                type="number"
                min="0"
                max={selectedEmployee?.activeAdvances || 0}
                value={advanceDeduction}
                onChange={(e) => setAdvanceDeduction(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold text-amber-700"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Total advance balance: Rs. {selectedEmployee?.activeAdvances.toLocaleString()}
              </span>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Other Deductions (PKR)</label>
              <input
                type="number"
                min="0"
                value={otherDeductions}
                onChange={(e) => setOtherDeductions(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          {/* Net summary */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
            <span className="font-bold text-blue-950 text-sm">Net Payable Disbursed:</span>
            <span className="text-xl font-black text-blue-700">
              Rs. {netPayableCalc.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsPaySalaryOpen(false);
                setSelectedEmployee(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm & Disburse Salary
            </Button>
          </div>
        </form>
      </Modal>

      {/* Record Advance Modal */}
      <Modal
        isOpen={isAdvanceOpen}
        onClose={() => {
          setIsAdvanceOpen(false);
          setSelectedEmployee(null);
        }}
        title="Issue Salary Advance"
        subtitle={`Issuing advance to: ${selectedEmployee?.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleAdvanceSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block">Current Active Advances:</span>
            <span className="text-lg font-bold text-amber-600">
              Rs. {selectedEmployee?.activeAdvances.toLocaleString()}
            </span>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Advance Amount (PKR) *</label>
            <input
              type="number"
              min="500"
              required
              value={advanceAmount}
              onChange={(e) => setAdvanceAmount(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold text-base"
            />
          </div>

          <p className="text-[11px] text-slate-500">
            Advance will be disbursed in cash from the Factory Main Cash Safe and recorded as an asset
            receivable from the employee.
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsAdvanceOpen(false);
                setSelectedEmployee(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Issue Advance
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
