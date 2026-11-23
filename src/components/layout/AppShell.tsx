'use client';

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
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
import { PurchasesOverviewView } from '../views/PurchasesOverviewView';
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
      case 'purchases':
        return <PurchasesOverviewView />;
      case 'customers':
        return <CustomerManagementView />;
      case 'suppliers':
        return <SupplierManagementView />;
      case 'khata':
        return <CustomerKhataView />;
      case 'expenses':
        return <ExpensesManagementView />;
      case 'employees':
      case 'salaries':
        return <EmployeeManagementView />;
      case 'loans':
        return <LoansManagementView />;
      case 'cash-bank':
        return <CashBankView />;
      case 'reports':
        return <ReportsAnalyticsView />;
      case 'documents':
        return <DocumentsView />;
      case 'users':
      case 'settings':
        return <SettingsView />;
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
      {/* Sidebar */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        {/* Topbar */}
        <Topbar
          onOpenNewSale={() => setIsQuickSaleOpen(true)}
          onOpenNewProduction={() => setIsQuickProductionOpen(true)}
          onOpenNewRecycling={() => setIsQuickRecyclingOpen(true)}
          onOpenNewPurchase={() => setIsQuickPurchaseOpen(true)}
        />

        {/* Page Content Viewport */}
        <main className="flex-1 mt-16 p-4 sm:p-6 lg:p-8 max-w-[1700px] w-full mx-auto">
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
