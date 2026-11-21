'use client';

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { UserRole } from '../../types/erp';
import { Button } from '../common/Button';
import { Factory, Shield, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export function LoginView() {
  const { setCurrentUser, setCurrentView } = useERP();

  const [email, setEmail] = useState('owner@bagfactory.com.pk');
  const [password, setPassword] = useState('••••••••••••');

  const handleQuickLogin = (role: UserRole, name: string, dept: string) => {
    setCurrentUser({
      id: 'usr-' + role,
      name,
      email: `${role}@bagfactory.com.pk`,
      role,
      department: dept,
    });
    setCurrentView('dashboard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQuickLogin('owner_admin', 'Tariq Mehmood (Owner)', 'Executive Management');
  };

  return (
    <div className="min-h-screen bg-[#0c1524] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background glow and subtle mesh */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Brand logo */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-blue-400 mx-auto flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-blue-500/20 mb-4">
          <Factory className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">BagFactory ERP</h2>
        <p className="text-xs text-slate-400 mt-1">
          Shopping Bag Manufacturing & Business Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-[#142238] py-8 px-6 sm:px-8 shadow-2xl rounded-2xl border border-slate-700/60 backdrop-blur-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Business Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Account Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5 text-sm font-bold shadow-lg shadow-blue-600/30"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Factory Dashboard
            </Button>
          </form>

          {/* Quick Demo Role Switcher */}
          <div className="pt-4 border-t border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center mb-3">
              1-Click Demo Persona Sign-In
            </span>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() =>
                  handleQuickLogin('owner_admin', 'Tariq Mehmood', 'Executive Management')
                }
                className="w-full text-left p-2.5 rounded-lg bg-slate-900/50 hover:bg-slate-800 border border-slate-700/80 transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-blue-400 block">
                    Tariq Mehmood (Factory Owner)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Full Administrative & Financial Oversight
                  </span>
                </div>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 font-semibold">
                  Owner
                </span>
              </button>

              <button
                onClick={() =>
                  handleQuickLogin('production_mgr', 'Muhammad Rafiq', 'Production Plant')
                }
                className="w-full text-left p-2.5 rounded-lg bg-slate-900/50 hover:bg-slate-800 border border-slate-700/80 transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-emerald-400 block">
                    Muhammad Rafiq (Extrusion Master)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Production & Recycling Batches Specialist
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
                  Production
                </span>
              </button>

              <button
                onClick={() =>
                  handleQuickLogin('accountant', 'Bilal Farooqi', 'Finance & Accounts')
                }
                className="w-full text-left p-2.5 rounded-lg bg-slate-900/50 hover:bg-slate-800 border border-slate-700/80 transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-purple-400 block">
                    Bilal Farooqi (Chief Accountant)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Khata, Ledgers, Bankbook & Profit & Loss
                  </span>
                </div>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 font-semibold">
                  Accounts
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Commercial Footnote */}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
          <p>BagFactory ERP • Commercial Edition v1.0</p>
          <p className="text-[11px] text-slate-600">
            Compliant with Pakistani Industrial Manufacturing & Digital Khata Standards
          </p>
        </div>
      </div>
    </div>
  );
}
