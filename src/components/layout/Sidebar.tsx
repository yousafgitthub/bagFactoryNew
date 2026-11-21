'use client';

import React from 'react';
import { useERP, ActiveView } from '../../context/ERPContext';
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
  Wallet,
  Landmark,
  CreditCard,
  BarChart3,
  FileText,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Layers,
  Plus,
  ArrowRightLeft,
  SlidersHorizontal,
  History,
  Warehouse,
  AlertTriangle,
  List,
  PackageMinus,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: number;
  badgeColor?: string;
  badgeText?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function Sidebar() {
  const {
    currentView,
    setCurrentView,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    inventory,
    salesInvoices,
    currentUser,
    setCurrentUser,
  } = useERP();

  // Dynamic counts for badges
  const lowStockCount = inventory.filter((i) => i.status === 'Low Stock' || i.status === 'Critical').length;
  const unpaidSalesCount = salesInvoices.filter((s) => s.paymentStatus !== 'Paid').length;

  const inventoryNavItems: NavItem[] = [
    { id: 'inv-overview', label: 'Overview Hub', icon: Boxes },
    { id: 'inv-all', label: 'All Inventory', icon: List },
    { id: 'inv-low-stock', label: 'Low Stock Alerts', icon: AlertTriangle },
    { id: 'inv-issue', label: 'Issue Stock', icon: PackageMinus },
    { id: 'inv-new-raw', label: 'New Raw Material', icon: Layers },
    { id: 'inv-waste', label: 'Waste Plastic', icon: Layers },
    { id: 'inv-recycled', label: 'Recycled Material', icon: Layers },
    { id: 'inv-finished', label: 'Finished Goods', icon: Layers },
    { id: 'inv-receive', label: 'Receive Stock', icon: Plus },
    { id: 'inv-transfer', label: 'Transfers', icon: ArrowRightLeft },
    { id: 'inv-adjustments', label: 'Adjustments', icon: SlidersHorizontal },
    { id: 'inv-movements', label: 'Movement Ledger', icon: History },
    { id: 'inv-warehouses', label: 'Warehouses', icon: Warehouse },
    { id: 'inv-reports', label: 'Inventory Reports', icon: BarChart3 },
    { id: 'inv-settings', label: 'Inventory Settings', icon: Settings },
  ];

  const navGroups: NavGroup[] = [
    {
      title: 'WORKSPACE',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'production', label: 'Production', icon: Factory },
        { id: 'recycling', label: 'Recycling', icon: Recycle, badgeText: 'Eco' },
      ],
    },
    {
      title: 'INVENTORY MANAGEMENT',
      items: inventoryNavItems.map((item) => {
        if (lowStockCount > 0 && (item.id === 'inv-overview' || item.id === 'inv-low-stock')) {
          return { ...item, badge: lowStockCount, badgeColor: 'bg-amber-500' };
        }
        return item;
      }),
    },
    {
      title: 'BUSINESS',
      items: [
        { id: 'sales', label: 'Sales', icon: ShoppingBag, badge: unpaidSalesCount > 0 ? unpaidSalesCount : undefined },
        { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'suppliers', label: 'Suppliers', icon: Truck },
        { id: 'khata', label: 'Khata / Ledgers', icon: BookOpen },
        { id: 'expenses', label: 'Expenses', icon: Receipt },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        { id: 'employees', label: 'Employees', icon: UserCheck },
        { id: 'salaries', label: 'Salaries', icon: Wallet },
        { id: 'loans', label: 'Loans', icon: Landmark },
        { id: 'cash-bank', label: 'Cash & Bank', icon: CreditCard },
        { id: 'reports', label: 'Reports', icon: BarChart3 },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'users', label: 'Users & Roles', icon: ShieldCheck },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[#142238] text-slate-300 flex flex-col transition-all duration-300 ease-in-out border-r border-[#1b2c47] ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1b2c47] bg-[#0c1524]/60">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#2563EB] to-blue-400 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
            <Factory className="w-5 h-5 text-white" />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-base text-white tracking-tight leading-none flex items-center gap-1.5">
                BagFactory <span className="text-[10px] bg-blue-600/30 text-blue-300 px-1.5 py-0.5 rounded font-medium border border-blue-500/30">ERP</span>
              </span>
              <span className="text-[11px] text-slate-400 mt-1 truncate">Shopping Bag Mfg.</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors hidden lg:block"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {!isSidebarCollapsed ? (
              <p className="px-3 text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                {group.title}
              </p>
            ) : (
              <div className="h-2" />
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  currentView === item.id || (item.id === 'inv-overview' && currentView === 'inventory');

                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as ActiveView)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative ${
                      isActive
                        ? 'bg-[#2563EB] text-white shadow-sm font-semibold'
                        : 'text-slate-300 hover:bg-[#1b2c47] hover:text-white'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />

                    {!isSidebarCollapsed && (
                      <span className="flex-1 text-left truncate">{item.label}</span>
                    )}

                    {!isSidebarCollapsed && item.badge !== undefined && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full text-white ${item.badgeColor || 'bg-blue-500'}`}>
                        {item.badge}
                      </span>
                    )}

                    {!isSidebarCollapsed && item.badgeText && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {item.badgeText}
                      </span>
                    )}

                    {/* Tooltip for collapsed mode */}
                    {isSidebarCollapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#0c1524] text-white text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-slate-700">
                        {item.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer & Status */}
      <div className="p-3 border-t border-[#1b2c47] bg-[#0c1524]/40">
        {!isSidebarCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium text-xs flex-shrink-0 border border-slate-600">
                {currentUser?.name.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-400 capitalize truncate">
                  {currentUser?.role.replace('_', ' ')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('login')}
              title="Sign out / Switch user"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => setCurrentView('login')}
              title="Sign out / Switch user"
              className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs hover:bg-rose-900 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-300" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
