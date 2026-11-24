'use client';

import React, { useEffect, useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ModuleSubnav } from './ModuleSubnav';
import { ToastContainer } from '../common/Toast';

// Views
import { LoginView } from '../views/LoginView';
import { DashboardView } from '../views/DashboardView';
import { InvOverviewView } from '../views/inventory/InvOverviewView';
import { InvAllInventoryView } from '../views/inventory/InvAllInventoryView';
import { InvLowStockView } from '../views/inventory/InvLowStockView';
import { InvIssueView } from '../views/inventory/InvIssueView';
import { InvNewRawView } from '../views/inventory/InvNewRawView';
import { InvWasteView } from '../views/inventory/InvWasteView';
import { InvRecycledView } from '../views/inventory/InvRecycledView';
import { InvFinishedView } from '../views/inventory/InvFinishedView';
import { InvReceiveView } from '../views/inventory/InvReceiveView';
import { InvTransferView } from '../views/inventory/InvTransferView';
import { InvAdjustmentsView } from '../views/inventory/InvAdjustmentsView';
import { InvMovementsView } from '../views/inventory/InvMovementsView';
import { InvWarehousesView } from '../views/inventory/InvWarehousesView';
import { InvReportsView } from '../views/inventory/InvReportsView';
import { InvSettingsView } from '../views/inventory/InvSettingsView';
import { ProductionOverviewView } from '../views/production/ProductionOverviewView';
import { ProductionPlanningView } from '../views/production/ProductionPlanningView';
import { ProductionOrdersView } from '../views/production/ProductionOrdersView';
import { ProductionCreateBatchView } from '../views/production/ProductionCreateBatchView';
import { ProductionActiveView, ProductionCompletedView } from '../views/production/ProductionListViews';
import {
  ProductionConsumptionView,
  ProductionOutputView,
  ProductionLossView,
  ProductionCostsView,
  ProductionReportsView,
  ProductionSettingsView,
} from '../views/production/ProductionHistoryViews';
import { ProductionBatchDetailView } from '../views/production/ProductionBatchDetailView';
import { RecyclingOverviewView } from '../views/RecyclingOverviewView';
import { RecyclingBatchesView } from '../views/recycling/RecyclingBatchesView';
import { RecyclingCreateBatchView } from '../views/recycling/RecyclingCreateBatchView';
import { RecyclingBatchDetailView } from '../views/recycling/RecyclingBatchDetailView';
import {
  RecyclingInputsView,
  RecyclingOutputsView,
  RecyclingLossView,
  RecyclingCostsView,
  RecyclingReportsView,
  RecyclingSettingsView,
} from '../views/recycling/RecyclingHistoryViews';
import { SalesOverviewView } from '../views/SalesOverviewView';
import { SalesAllInvoicesView, SalesOutstandingView, SalesPaymentsView, SalesReturnsView } from '../views/sales/SalesListViews';
import { SalesCreateInvoiceView } from '../views/sales/SalesCreateInvoiceView';
import { SalesInvoiceDetailView } from '../views/sales/SalesInvoiceDetailView';
import { SalesReportsView } from '../views/sales/SalesReportsView';
import { SalesSettingsView } from '../views/sales/SalesSettingsView';
import { PurchasesOverviewView } from '../views/PurchasesOverviewView';
import { PurchasingCreateView } from '../views/purchasing/PurchasingCreateView';
import { PurchasingDetailView } from '../views/purchasing/PurchasingDetailView';
import { PurchasingReportsView } from '../views/purchasing/PurchasingReportsView';
import { PurchasingSettingsView } from '../views/purchasing/PurchasingSettingsView';
import { SupplierDetailView } from '../views/purchasing/SupplierDetailView';
import { SupplierStatementView } from '../views/purchasing/SupplierStatementView';
import {
  PurchasesAllView,
  PurchasesOutstandingView,
  PurchasesPaymentsView,
  PurchasesReturnsView,
  PurchasesReceiveView,
  PurchaseSuppliersView,
} from '../views/purchasing/PurchasingListViews';
import { CustomerManagementView } from '../views/CustomerManagementView';
import { CustomerKhataView } from '../views/CustomerKhataView';
import { SupplierManagementView } from '../views/SupplierManagementView';
import { ExpensesManagementView } from '../views/ExpensesManagementView';
import { EmployeeManagementView } from '../views/EmployeeManagementView';
import { LoansManagementView } from '../views/LoansManagementView';
import { CashBankView } from '../views/CashBankView';
import { ReportsAnalyticsView } from '../views/ReportsAnalyticsView';
import { DocumentsView } from '../views/DocumentsView';
import { SettingsView } from '../views/SettingsView';

// Modals
import { CreateSalesInvoiceModal } from '../views/CreateSalesInvoiceModal';
import { CreateProductionBatchModal } from '../views/CreateProductionBatchModal';
import { CreateRecyclingBatchModal } from '../views/CreateRecyclingBatchModal';
import { CreatePurchaseModal } from '../views/CreatePurchaseModal';

export function AppShell() {
  const { currentView, isSidebarCollapsed } = useERP();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [currentView]);

  // Global Quick Action Modals
  const [isQuickSaleOpen, setIsQuickSaleOpen] = useState(false);
  const [isQuickProductionOpen, setIsQuickProductionOpen] = useState(false);
  const [isQuickRecyclingOpen, setIsQuickRecyclingOpen] = useState(false);
  const [isQuickPurchaseOpen, setIsQuickPurchaseOpen] = useState(false);

  // If on login view, render clean full-screen login
  if (currentView === 'login') {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            onOpenNewSale={() => setIsQuickSaleOpen(true)}
            onOpenNewProduction={() => setIsQuickProductionOpen(true)}
            onOpenNewRecycling={() => setIsQuickRecyclingOpen(true)}
          />
        );
      case 'inventory':
      case 'inv-overview':
        return <InvOverviewView />;
      case 'inv-all':
        return <InvAllInventoryView />;
      case 'inv-low-stock':
        return <InvLowStockView />;
      case 'inv-issue':
        return <InvIssueView />;
      case 'inv-new-raw':
        return <InvNewRawView />;
      case 'inv-waste':
        return <InvWasteView />;
      case 'inv-recycled':
        return <InvRecycledView />;
      case 'inv-finished':
        return <InvFinishedView />;
      case 'inv-receive':
        return <InvReceiveView />;
      case 'inv-transfer':
        return <InvTransferView />;
      case 'inv-adjustments':
        return <InvAdjustmentsView />;
      case 'inv-movements':
        return <InvMovementsView />;
      case 'inv-warehouses':
        return <InvWarehousesView />;
      case 'inv-reports':
        return <InvReportsView />;
      case 'inv-settings':
        return <InvSettingsView />;
      case 'production':
        return <ProductionOverviewView />;
      case 'production-planning':
        return <ProductionPlanningView />;
      case 'production-orders':
        return <ProductionOrdersView />;
      case 'production-create':
        return <ProductionCreateBatchView />;
      case 'production-active':
        return <ProductionActiveView />;
      case 'production-completed':
        return <ProductionCompletedView />;
      case 'production-consumption':
        return <ProductionConsumptionView />;
      case 'production-output':
        return <ProductionOutputView />;
      case 'production-loss':
        return <ProductionLossView />;
      case 'production-costs':
        return <ProductionCostsView />;
      case 'production-reports':
        return <ProductionReportsView />;
      case 'production-settings':
        return <ProductionSettingsView />;
      case 'production-batch-detail':
        return <ProductionBatchDetailView />;
      case 'recycling':
        return <RecyclingOverviewView />;
      case 'recycling-batches':
        return <RecyclingBatchesView />;
      case 'recycling-create':
        return <RecyclingCreateBatchView />;
      case 'recycling-batch-detail':
        return <RecyclingBatchDetailView />;
      case 'recycling-inputs':
        return <RecyclingInputsView />;
      case 'recycling-outputs':
        return <RecyclingOutputsView />;
      case 'recycling-loss':
        return <RecyclingLossView />;
      case 'recycling-costs':
        return <RecyclingCostsView />;
      case 'recycling-reports':
        return <RecyclingReportsView />;
      case 'recycling-settings':
        return <RecyclingSettingsView />;
      case 'sales':
        return <SalesOverviewView />;
      case 'sales-all':
        return <SalesAllInvoicesView />;
      case 'sales-create':
        return <SalesCreateInvoiceView />;
      case 'sales-returns':
        return <SalesReturnsView />;
      case 'sales-payments':
        return <SalesPaymentsView />;
      case 'sales-outstanding':
        return <SalesOutstandingView />;
      case 'sales-reports':
        return <SalesReportsView />;
      case 'sales-settings':
        return <SalesSettingsView />;
      case 'sales-invoice-detail':
        return <SalesInvoiceDetailView />;
      case 'purchases':
        return <PurchasesOverviewView />;
      case 'purchases-all':
        return <PurchasesAllView />;
      case 'purchases-create':
        return <PurchasingCreateView />;
      case 'purchases-receive':
        return <PurchasesReceiveView />;
      case 'purchases-returns':
        return <PurchasesReturnsView />;
      case 'purchases-payments':
        return <PurchasesPaymentsView />;
      case 'purchases-outstanding':
        return <PurchasesOutstandingView />;
      case 'purchases-reports':
        return <PurchasingReportsView />;
      case 'purchases-settings':
        return <PurchasingSettingsView />;
      case 'purchases-detail':
        return <PurchasingDetailView />;
      case 'purchase-suppliers':
        return <PurchaseSuppliersView />;
      case 'purchase-supplier-detail':
        return <SupplierDetailView />;
      case 'purchase-supplier-statement':
        return <SupplierStatementView />;
      case 'customers':
        return <CustomerManagementView />;
      case 'suppliers':
        return <SupplierManagementView />;
      case 'khata':
        return <CustomerKhataView />;
      case 'expenses':
        return <ExpensesManagementView />;
      case 'employees':
        return <EmployeeManagementView focus="EMPLOYEES" />;
      case 'salaries':
        return <EmployeeManagementView focus="SALARIES" />;
      case 'loans':
        return <LoansManagementView />;
      case 'cash-bank':
        return <CashBankView />;
      case 'reports':
        return <ReportsAnalyticsView />;
      case 'documents':
        return <DocumentsView />;
      case 'users':
        return <SettingsView section="users" />;
      case 'settings':
        return <SettingsView section="general" />;
      default:
        return (
          <DashboardView
            onOpenNewSale={() => setIsQuickSaleOpen(true)}
            onOpenNewProduction={() => setIsQuickProductionOpen(true)}
            onOpenNewRecycling={() => setIsQuickRecyclingOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex">
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div
        className={`flex-1 flex flex-col min-w-0 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Topbar
          onOpenMenu={() => setMobileNavOpen(true)}
          onOpenNewSale={() => setIsQuickSaleOpen(true)}
          onOpenNewProduction={() => setIsQuickProductionOpen(true)}
          onOpenNewRecycling={() => setIsQuickRecyclingOpen(true)}
          onOpenNewPurchase={() => setIsQuickPurchaseOpen(true)}
        />

        <main className="flex-1 mt-16 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <ModuleSubnav />
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Quick Action Modals */}
      <CreateSalesInvoiceModal
        isOpen={isQuickSaleOpen}
        onClose={() => setIsQuickSaleOpen(false)}
      />
      <CreateProductionBatchModal
        isOpen={isQuickProductionOpen}
        onClose={() => setIsQuickProductionOpen(false)}
      />
      <CreateRecyclingBatchModal
        isOpen={isQuickRecyclingOpen}
        onClose={() => setIsQuickRecyclingOpen(false)}
      />
      <CreatePurchaseModal
        isOpen={isQuickPurchaseOpen}
        onClose={() => setIsQuickPurchaseOpen(false)}
      />

      {/* Global Notifications */}
      <ToastContainer />
    </div>
  );
}
