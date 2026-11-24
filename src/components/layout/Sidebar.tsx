'use client';

import React from 'react';
import { useERP, ActiveView } from '../../context/ERPContext';
import { sidebarSections } from './navigation';
import {
  LayoutDashboard,
  Boxes,
  Factory,
  Recycle,
  ShoppingBag,
  ShoppingCart,
  Users,
  Truck,
  BookOpen,
  Receipt,
  UserCheck,
  Landmark,
  CreditCard,
  BarChart3,
  FileText,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  sales: ShoppingBag,
  purchases: ShoppingCart,
  khata: BookOpen,
  suppliers: Truck,
  'inv-overview': Boxes,
  production: Factory,
  recycling: Recycle,
  customers: Users,
  'purchase-suppliers': Truck,
  employees: UserCheck,
  expenses: Receipt,
  'cash-bank': CreditCard,
  loans: Landmark,
  reports: BarChart3,
  documents: FileText,
  users: ShieldCheck,
  settings: Settings,
};

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const {
    currentView,
    setCurrentView,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    inventory,
    salesInvoices,
    currentUser,
  } = useERP();

  const lowStockCount = inventory.filter((i) => i.status === 'Low Stock' || i.status === 'Critical').length;
  const unpaidSalesCount = salesInvoices.filter(
    (s) => s.paymentStatus !== 'Paid' && s.invoiceStatus !== 'Draft' && s.invoiceStatus !== 'Cancelled'
  ).length;

  const badgeFor = (id: string) => {
    if ((id === 'inv-overview' || id === 'inventory') && lowStockCount > 0) return lowStockCount;
    if (id === 'sales' && unpaidSalesCount > 0) return unpaidSalesCount;
    return undefined;
  };

  const openView = (id: ActiveView) => {
    setCurrentView(id);
    onClose();
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[#142238] text-slate-300 flex flex-col border-r border-[#1b2c47] transition-transform duration-200 w-64 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1b2c47]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center text-white flex-shrink-0">
            <Factory className="w-5 h-5" />
          </div>
          <div className={`min-w-0 ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>
            <p className="font-semibold text-sm text-white leading-tight">Bag Factory</p>
            <p className="text-[11px] text-slate-400 truncate">Shop & production</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 hidden lg:block"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {sidebarSections.map((section) => (
          <div key={section.title}>
            <p className={`px-3 mb-1 text-[11px] font-medium text-slate-500 ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = ICONS[item.id] ?? LayoutDashboard;
                const active = item.isActive(currentView);
                const badge = badgeFor(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openView(item.id)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      active ? 'bg-[#2563EB] text-white font-medium' : 'text-slate-300 hover:bg-[#1b2c47] hover:text-white'
                    } ${isSidebarCollapsed ? 'lg:justify-center lg:px-0' : ''}`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span className={`flex-1 text-left truncate ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                    {badge !== undefined && (
                      <span className={`text-[10px] font-semibold min-w-[1.25rem] text-center px-1.5 py-0.5 rounded-full bg-white/15 ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-[#1b2c47]">
        <div className={`flex items-center justify-between gap-2 ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs flex-shrink-0">
              {currentUser?.name.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-slate-400 capitalize truncate">{currentUser?.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openView('login')}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-rose-300 rounded-md"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        {isSidebarCollapsed && (
          <div className="hidden lg:flex justify-center">
            <button
              type="button"
              onClick={() => openView('login')}
              title="Sign out"
              className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
