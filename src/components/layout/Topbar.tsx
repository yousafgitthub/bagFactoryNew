'use client';

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  AlertTriangle,
  Shield,
  ArrowRight,
  Menu,
} from 'lucide-react';
import { viewMeta } from './navigation';

interface TopbarProps {
  onOpenMenu?: () => void;
  onOpenNewSale?: () => void;
  onOpenNewProduction?: () => void;
  onOpenNewRecycling?: () => void;
  onOpenNewPurchase?: () => void;
}

export function Topbar({
  onOpenMenu,
  onOpenNewSale,
  onOpenNewProduction,
  onOpenNewRecycling,
  onOpenNewPurchase,
}: TopbarProps) {
  const {
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    currentUser,
    setCurrentUser,
    isSidebarCollapsed,
    inventory,
    salesInvoices,
  } = useERP();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Derive notifications
  const lowStockAlerts = inventory.filter((i) => i.status === 'Low Stock' || i.status === 'Critical');
  const pendingReceivables = salesInvoices.filter((s) => s.paymentStatus !== 'Paid');
  const totalAlertCount = lowStockAlerts.length + pendingReceivables.length;
  const currentInfo = viewMeta(currentView);

  const handleRoleSwitch = (role: 'owner_admin' | 'accountant' | 'production_mgr' | 'inventory_mgr' | 'sales_staff') => {
    if (!currentUser) return;
    const names = {
      owner_admin: 'Tariq Mehmood (Owner)',
      accountant: 'Bilal Farooqi (Chief Accountant)',
      production_mgr: 'Muhammad Rafiq (Production Master)',
      inventory_mgr: 'Farhan Zaidi (Inventory Officer)',
      sales_staff: 'Shahid Mehmood (Sales Exec)',
    };
    setCurrentUser({
      ...currentUser,
      role,
      name: names[role],
    });
    setShowUserDropdown(false);
  };

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between gap-3 px-4 sm:px-6 left-0 ${
        isSidebarCollapsed ? 'lg:left-20' : 'lg:left-64'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onOpenMenu}
          className="lg:hidden p-2 -ml-1 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <p className="text-[11px] text-[#64748B] truncate">{currentInfo.section}</p>
          <h1 className="text-base font-semibold text-[#1E293B] truncate">{currentInfo.title}</h1>
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="hidden md:flex items-center w-72 lg:w-96 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search items, invoices, customers, batches..."
          className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-lg text-[#1E293B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Action Button */}
        <div className="relative">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Action</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {showQuickActions && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-2 z-50 text-xs">
              <p className="px-3 py-1 font-semibold text-slate-400 uppercase text-[10px]">Operations</p>
              <button
                onClick={() => {
                  setShowQuickActions(false);
                  if (onOpenNewSale) onOpenNewSale();
                  else setCurrentView('sales');
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-[#1E293B]"
              >
                <span>+ Sales Invoice</span>
                <span className="text-[10px] text-blue-600 font-medium">Customer</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickActions(false);
                  if (onOpenNewProduction) onOpenNewProduction();
                  else setCurrentView('production');
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-[#1E293B]"
              >
                <span>+ Production Batch</span>
                <span className="text-[10px] text-emerald-600 font-medium">NEW or RECYCLED</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickActions(false);
                  if (onOpenNewRecycling) onOpenNewRecycling();
                  else setCurrentView('recycling');
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-[#1E293B]"
              >
                <span>+ Recycling Batch</span>
                <span className="text-[10px] text-purple-600 font-medium">Waste Processing</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickActions(false);
                  if (onOpenNewPurchase) onOpenNewPurchase();
                  else setCurrentView('purchases');
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-[#1E293B]"
              >
                <span>+ Purchase Bill</span>
                <span className="text-[10px] text-slate-500 font-medium">Supplier</span>
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => {
                  setShowQuickActions(false);
                  setCurrentView('expenses');
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-[#1E293B]"
              >
                + Record Expense
              </button>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {totalAlertCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E2E8F0] p-4 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                <span className="font-bold text-sm text-[#1E293B]">Factory Alerts</span>
                <span className="text-[10px] font-semibold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">
                  {totalAlertCount} Active
                </span>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                {lowStockAlerts.length > 0 && (
                  <div className="bg-amber-50/70 border border-amber-200 p-2.5 rounded-lg">
                    <p className="font-semibold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Low Stock Warning ({lowStockAlerts.length} items)
                    </p>
                    <ul className="mt-1 space-y-1 text-amber-800 text-[11px]">
                      {lowStockAlerts.slice(0, 2).map((item) => (
                        <li key={item.id} className="truncate">
                          • {item.name}: only <span className="font-bold">{item.availableKg} kg</span> left
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {pendingReceivables.length > 0 && (
                  <div className="bg-blue-50/70 border border-blue-200 p-2.5 rounded-lg">
                    <p className="font-semibold text-blue-900 flex items-center gap-1.5">
                      <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                      Customer Receivables Pending
                    </p>
                    <p className="text-[11px] text-blue-800 mt-0.5">
                      {pendingReceivables.length} invoices awaiting payment collection.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[#142238] text-white flex items-center justify-center font-bold text-xs">
              {currentUser?.name.charAt(0) || 'T'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#1E293B] leading-none">{currentUser?.name}</span>
              <span className="text-[10px] text-[#64748B] capitalize mt-0.5 leading-none">
                {currentUser?.role.replace('_', ' ')}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-semibold text-[#1E293B]">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-400">{currentUser?.email}</p>
              </div>

              <div className="px-3 py-2">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Switch Role Preview
                </p>
                <div className="space-y-1">
                  {[
                    { role: 'owner_admin', label: 'Factory Owner (All Access)' },
                    { role: 'accountant', label: 'Chief Accountant' },
                    { role: 'production_mgr', label: 'Production Manager' },
                    { role: 'inventory_mgr', label: 'Inventory Manager' },
                    { role: 'sales_staff', label: 'Sales Executive' },
                  ].map((r) => (
                    <button
                      key={r.role}
                      onClick={() => handleRoleSwitch(r.role as any)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between text-xs transition-colors ${
                        currentUser?.role === r.role
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{r.label}</span>
                      {currentUser?.role === r.role && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    setCurrentView('settings');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700"
                >
                  System Settings
                </button>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    setCurrentView('login');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 font-medium"
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
