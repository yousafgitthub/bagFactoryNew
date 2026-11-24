'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  InventoryItem,
  StockMovement,
  ProductionBatch,
  ProductionPlan,
  ProductionOrder,
  ProductionSettings,
  ProductionMachine,
  ProductionOperator,
  ProductionBatchTimelineEvent,
  ProductionPriority,
  ProductionPlanStatus,
  ProductionOrderStatus,
  RecyclingBatch,
  SalesInvoice,
  SalesInvoiceItem,
  SalesReturn,
  SalesSettings,
  CustomerPayment,
  CustomerPaymentMethod,
  DiscountType,
  InvoiceStatus,
  PurchaseBill,
  PaymentStatus,
  Customer,
  Supplier,
  KhataEntry,
  ExpenseRecord,
  Employee,
  SalaryPayment,
  LoanRecord,
  CashBankAccount,
  BankTransaction,
  FactoryDocument,
  RecyclingOutputTypeMaster,
  RecyclingSettings,
  ProcessingMachine,
  RecyclingOperator,
  RecyclingOutputLine,
  RecyclingBatchTimelineEvent,
  WarehouseMaster,
  StockAdjustmentRecord,
  StockTransferRecord,
  InventoryModuleSettings,
} from '../types/erp';
import {
  INITIAL_USER,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_INVENTORY,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_PRODUCTION_BATCHES,
  INITIAL_RECYCLING_BATCHES,
  INITIAL_SALES_INVOICES,
  INITIAL_PURCHASE_BILLS,
  INITIAL_CUSTOMER_KHATA,
  INITIAL_EXPENSES,
  INITIAL_EMPLOYEES,
  INITIAL_SALARY_PAYMENTS,
  INITIAL_LOANS,
  INITIAL_ACCOUNTS,
  INITIAL_BANK_TRANSACTIONS,
  INITIAL_DOCUMENTS,
  INITIAL_RECYCLING_OUTPUT_TYPES,
} from '../data/sampleData';
import {
  INITIAL_WAREHOUSES,
  INVENTORY_BRANDS,
  INVENTORY_COLORS,
  DEFAULT_REORDER_KG,
} from '../data/inventory';
import {
  applyReceiveToInventory,
  applyTransfer,
  computeStockStatus,
  ReceiveStockInput,
} from '../inventory/inventoryUtils';
import {
  DEFAULT_RECYCLING_SETTINGS,
  INITIAL_PROCESSING_MACHINES,
  INITIAL_RECYCLING_OPERATORS,
} from '../data/recycling';
import {
  allocateOutputCosts,
  computeRecyclingMetrics,
  computeWasteMaterialCost,
  generateRecyclingBatchNumber,
  validateOutputAgainstInput,
} from '../recycling/recyclingUtils';
import {
  buildRecyclingMovements,
  deductWasteStock,
  postRecycledOutputs,
  restoreWasteStock,
} from '../recycling/recyclingStock';
import {
  DEFAULT_PRODUCTION_SETTINGS,
  INITIAL_PRODUCTION_MACHINES,
  INITIAL_PRODUCTION_OPERATORS,
  INITIAL_PRODUCTION_PLANS,
  INITIAL_PRODUCTION_ORDERS,
} from '../data/production';
import {
  computeProductionMetrics,
  generateProductionBatchNumber,
  generateProductionOrderNumber,
  generateProductionPlanNumber,
  normalizeLegacyBatch,
  validateProductionOutput,
  validateRawMaterialForSource,
  estimateInputFromPlan,
} from '../production/productionUtils';
import {
  buildProductionMovements,
  deductRawMaterialStock,
  postFinishedGoodsOutput,
  refreshBatchCosts,
  restoreRawMaterialStock,
  reverseFinishedGoodsOutput,
} from '../production/productionStock';
import { DEFAULT_SALES_SETTINGS, INITIAL_CUSTOMER_PAYMENTS, INITIAL_SALES_RETURNS } from '../data/sales';
import {
  computeInvoiceTotals,
  generateInvoiceNumber,
  normalizeLegacyInvoice,
  refreshInvoicePaymentFields,
  validateReturnQuantity,
  validateSaleLines,
} from '../sales/salesUtils';
import {
  buildSalesDispatchMovements,
  buildSalesRestoreMovements,
  buildSalesReturnMovements,
  deductFinishedGoodsForSale,
  postSaleableReturnStock,
  restoreFinishedGoodsForCancel,
} from '../sales/salesStock';

export type ProductionBatchFormInput = {
  id?: string;
  batchNumber?: string;
  productName: string;
  color: string;
  materialSource: 'NEW' | 'RECYCLED';
  rawMaterialBatchId: string;
  rawMaterialName?: string;
  inputWarehouse: string;
  rawMaterialQtyKg: number;
  plannedInputQtyKg?: number;
  finishedGoodsOutputKg: number;
  rejectedOutputKg: number;
  reusableByproductKg: number;
  finishedGoodsWarehouse: string;
  productionDate: string;
  laborCost: number;
  electricityCost: number;
  machineCost: number;
  maintenanceCost: number;
  packagingCost: number;
  transportCost: number;
  otherCosts: number;
  operator: string;
  machineId?: string;
  machineName?: string;
  shift?: string;
  notes?: string;
  outputBatchNumber?: string;
  productionOrderRef?: string;
  productionPlanRef?: string;
};

export type SalesInvoiceFormInput = {
  id?: string;
  invoiceNumber?: string;
  customerId: string;
  saleDate: string;
  dueDate: string;
  items: SalesInvoiceItem[];
  discountType: DiscountType;
  discountValue: number;
  amountReceived: number;
  paymentMethod?: CustomerPaymentMethod;
  dispatchWarehouse?: string;
  salesperson?: string;
  notes?: string;
};

export type RecyclingBatchFormInput = {
  id?: string;
  batchNumber?: string;
  batchName?: string;
  wasteInputBatchId: string;
  inputWasteQtyKg: number;
  outputs: Omit<RecyclingOutputLine, 'allocatedCost' | 'costPerKg'>[];
  laborCost: number;
  electricityCost: number;
  machineCost: number;
  transportCost: number;
  maintenanceCost: number;
  otherCosts: number;
  processingDate: string;
  operator: string;
  machineId?: string;
  machineName?: string;
  notes?: string;
  destinationWarehouse: string;
};

export type ActiveView =
  | 'login'
  | 'dashboard'
  | 'inventory'
  | 'inv-overview'
  | 'inv-all'
  | 'inv-low-stock'
  | 'inv-issue'
  | 'inv-new-raw'
  | 'inv-waste'
  | 'inv-recycled'
  | 'inv-finished'
  | 'inv-receive'
  | 'inv-transfer'
  | 'inv-adjustments'
  | 'inv-movements'
  | 'inv-warehouses'
  | 'inv-reports'
  | 'inv-settings'
  | 'production'
  | 'production-planning'
  | 'production-orders'
  | 'production-create'
  | 'production-active'
  | 'production-completed'
  | 'production-consumption'
  | 'production-output'
  | 'production-loss'
  | 'production-costs'
  | 'production-reports'
  | 'production-settings'
  | 'production-batch-detail'
  | 'recycling'
  | 'recycling-batches'
  | 'recycling-create'
  | 'recycling-inputs'
  | 'recycling-outputs'
  | 'recycling-loss'
  | 'recycling-costs'
  | 'recycling-reports'
  | 'recycling-settings'
  | 'recycling-batch-detail'
  | 'sales'
  | 'sales-all'
  | 'sales-create'
  | 'sales-returns'
  | 'sales-payments'
  | 'sales-outstanding'
  | 'sales-reports'
  | 'sales-settings'
  | 'sales-invoice-detail'
  | 'purchases'
  | 'customers'
  | 'khata'
  | 'suppliers'
  | 'expenses'
  | 'employees'
  | 'salaries'
  | 'loans'
  | 'cash-bank'
  | 'reports'
  | 'documents'
  | 'users'
  | 'settings';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface ERPContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  currentView: ActiveView;
  setCurrentView: (view: ActiveView) => void;
  selectedEntityId: string | null;
  setSelectedEntityId: (id: string | null) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Data collections
  inventory: InventoryItem[];
  stockMovements: StockMovement[];
  productionBatches: ProductionBatch[];
  productionPlans: ProductionPlan[];
  productionOrders: ProductionOrder[];
  productionSettings: ProductionSettings;
  productionMachines: ProductionMachine[];
  productionOperators: ProductionOperator[];
  recyclingBatches: RecyclingBatch[];
  salesInvoices: SalesInvoice[];
  customerPayments: CustomerPayment[];
  salesReturns: SalesReturn[];
  salesSettings: SalesSettings;
  purchaseBills: PurchaseBill[];
  customers: Customer[];
  suppliers: Supplier[];
  customerKhata: Record<string, KhataEntry[]>;
  expenses: ExpenseRecord[];
  employees: Employee[];
  salaryPayments: SalaryPayment[];
  loans: LoanRecord[];
  accounts: CashBankAccount[];
  bankTransactions: BankTransaction[];
  documents: FactoryDocument[];
  recyclingOutputTypes: RecyclingOutputTypeMaster[];
  recyclingSettings: RecyclingSettings;
  processingMachines: ProcessingMachine[];
  recyclingOperators: RecyclingOperator[];
  warehouses: WarehouseMaster[];
  inventoryModuleSettings: InventoryModuleSettings;
  stockAdjustmentRecords: StockAdjustmentRecord[];
  stockTransferRecords: StockTransferRecord[];

  // Toast System
  toasts: ToastMessage[];
  showToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
  removeToast: (id: string) => void;

  // Operations
  addStock: (stock: Omit<InventoryItem, 'id' | 'totalValue' | 'lastUpdated'>) => void;
  receiveStock: (input: ReceiveStockInput) => void;
  issueStock: (itemId: string, qtyKg: number, reason: string, referenceNo?: string, notes?: string) => void;
  adjustStock: (itemId: string, newQtyKg: number, reason: string) => void;
  transferStock: (itemId: string, fromWarehouse: string, toWarehouse: string, qtyKg: number) => void;
  setWarehouseStatus: (warehouseId: string, status: 'Active' | 'Inactive') => void;
  updateInventoryModuleSettings: (settings: InventoryModuleSettings) => void;
  createProductionBatch: (batchData: Omit<ProductionBatch, 'id' | 'processingLossKg' | 'yieldPercentage' | 'totalCost' | 'costPerKg'>) => void;
  saveProductionBatchDraft: (input: ProductionBatchFormInput) => string;
  updateProductionBatchDraft: (batchId: string, input: ProductionBatchFormInput) => void;
  startProductionBatch: (batchId: string) => void;
  completeProductionBatch: (batchId: string) => void;
  completeProductionFromInput: (input: ProductionBatchFormInput) => string;
  cancelProductionBatch: (batchId: string, reason: string) => void;
  upsertProductionPlan: (plan: Omit<ProductionPlan, 'id' | 'planNumber'> & { id?: string; planNumber?: string }) => void;
  updateProductionPlanStatus: (planId: string, status: ProductionPlanStatus, cancelReason?: string) => void;
  upsertProductionOrder: (order: Omit<ProductionOrder, 'id' | 'orderNumber' | 'linkedBatchIds'> & { id?: string; orderNumber?: string }) => void;
  updateProductionOrderStatus: (orderId: string, status: ProductionOrderStatus, cancelReason?: string) => void;
  convertPlanToBatch: (planId: string) => string;
  convertOrderToBatch: (orderId: string) => string;
  updateProductionSettings: (settings: ProductionSettings) => void;
  upsertProductionMachine: (machine: ProductionMachine) => void;
  upsertProductionOperator: (operator: ProductionOperator) => void;
  createRecyclingBatch: (
    batchData: Omit<
      RecyclingBatch,
      | 'id'
      | 'processingLossKg'
      | 'yieldPercentage'
      | 'totalProcessingCost'
      | 'totalBatchCost'
      | 'costPerKg'
      | 'outputQtyKg'
      | 'outputMaterialType'
      | 'wasteStockDeducted'
      | 'outputStockPosted'
      | 'timeline'
      | 'outputs'
    > & { outputs: Omit<RecyclingOutputLine, 'allocatedCost' | 'costPerKg'>[] }
  ) => void;
  saveRecyclingBatchDraft: (input: RecyclingBatchFormInput) => string;
  updateRecyclingBatchDraft: (batchId: string, input: RecyclingBatchFormInput) => void;
  startRecyclingBatch: (batchId: string) => void;
  completeRecyclingBatch: (batchId: string) => void;
  cancelRecyclingBatch: (batchId: string, reason: string) => void;
  updateRecyclingSettings: (settings: RecyclingSettings) => void;
  upsertProcessingMachine: (machine: ProcessingMachine) => void;
  upsertRecyclingOperator: (operator: RecyclingOperator) => void;
  toggleRecyclingOutputType: (id: string, active: boolean) => void;
  createSalesInvoice: (
    invoiceData: Omit<
      SalesInvoice,
      'id' | 'remainingBalance' | 'paymentStatus' | 'invoiceStatus' | 'stockDeducted' | 'taxAmount' | 'discountType'
    > & { discountType?: DiscountType; taxAmount?: number; invoiceStatus?: InvoiceStatus }
  ) => void;
  saveSalesInvoiceDraft: (input: SalesInvoiceFormInput) => string;
  updateSalesInvoiceDraft: (invoiceId: string, input: SalesInvoiceFormInput) => void;
  confirmSalesInvoice: (invoiceId: string) => void;
  cancelSalesInvoice: (invoiceId: string, reason: string) => void;
  recordInvoicePayment: (
    invoiceId: string,
    amount: number,
    paymentMethod: CustomerPaymentMethod,
    paymentReference: string,
    transactionRef?: string,
    notes?: string
  ) => void;
  saveSalesReturn: (
    payload: Omit<SalesReturn, 'id' | 'status' | 'stockRestored'> & { status?: SalesReturn['status'] }
  ) => string;
  updateSalesReturnStatus: (returnId: string, status: SalesReturn['status']) => void;
  completeSalesReturn: (returnId: string) => void;
  updateSalesSettings: (settings: SalesSettings) => void;
  recordCustomerPayment: (customerId: string, amount: number, paymentMethod: string, referenceNo: string, notes?: string) => void;
  createPurchaseBill: (billData: Omit<PurchaseBill, 'id' | 'remainingPayable' | 'paymentStatus'>) => void;
  recordSupplierPayment: (supplierId: string, amount: number, paymentAccount: string, referenceNo: string) => void;
  addExpense: (expense: Omit<ExpenseRecord, 'id' | 'voucherNumber'>) => void;
  paySalary: (payment: Omit<SalaryPayment, 'id' | 'salaryId' | 'status'>) => void;
  recordAdvance: (employeeId: string, amount: number) => void;
  transferCashBank: (fromAccId: string, toAccId: string, amount: number, reference: string, memo: string) => void;
  addRecyclingOutputType: (name: string, description: string) => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export function ERPProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(INITIAL_USER);
  const [currentView, setCurrentView] = useState<ActiveView>('dashboard');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Collections
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(INITIAL_STOCK_MOVEMENTS);
  const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>(() =>
    INITIAL_PRODUCTION_BATCHES.map(normalizeLegacyBatch)
  );
  const [productionPlans, setProductionPlans] = useState<ProductionPlan[]>(INITIAL_PRODUCTION_PLANS);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(INITIAL_PRODUCTION_ORDERS);
  const [productionSettings, setProductionSettings] = useState<ProductionSettings>(DEFAULT_PRODUCTION_SETTINGS);
  const [productionMachines, setProductionMachines] = useState<ProductionMachine[]>(INITIAL_PRODUCTION_MACHINES);
  const [productionOperators, setProductionOperators] = useState<ProductionOperator[]>(INITIAL_PRODUCTION_OPERATORS);
  const [recyclingBatches, setRecyclingBatches] = useState<RecyclingBatch[]>(INITIAL_RECYCLING_BATCHES);
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>(() =>
    INITIAL_SALES_INVOICES.map(normalizeLegacyInvoice)
  );
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>(INITIAL_CUSTOMER_PAYMENTS);
  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>(INITIAL_SALES_RETURNS);
  const [salesSettings, setSalesSettings] = useState<SalesSettings>(DEFAULT_SALES_SETTINGS);
  const [purchaseBills, setPurchaseBills] = useState<PurchaseBill[]>(INITIAL_PURCHASE_BILLS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [customerKhata, setCustomerKhata] = useState<Record<string, KhataEntry[]>>(INITIAL_CUSTOMER_KHATA);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>(INITIAL_SALARY_PAYMENTS);
  const [loans, setLoans] = useState<LoanRecord[]>(INITIAL_LOANS);
  const [accounts, setAccounts] = useState<CashBankAccount[]>(INITIAL_ACCOUNTS);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(INITIAL_BANK_TRANSACTIONS);
  const [documents, setDocuments] = useState<FactoryDocument[]>(INITIAL_DOCUMENTS);
  const [recyclingOutputTypes, setRecyclingOutputTypes] = useState<RecyclingOutputTypeMaster[]>(INITIAL_RECYCLING_OUTPUT_TYPES);
  const [recyclingSettings, setRecyclingSettings] = useState<RecyclingSettings>(DEFAULT_RECYCLING_SETTINGS);
  const [processingMachines, setProcessingMachines] = useState<ProcessingMachine[]>(INITIAL_PROCESSING_MACHINES);
  const [recyclingOperators, setRecyclingOperators] = useState<RecyclingOperator[]>(INITIAL_RECYCLING_OPERATORS);
  const [warehouses, setWarehouses] = useState<WarehouseMaster[]>(INITIAL_WAREHOUSES);
  const [inventoryModuleSettings, setInventoryModuleSettings] = useState<InventoryModuleSettings>({
    brands: [...INVENTORY_BRANDS],
    colors: [...INVENTORY_COLORS],
    reorderLevelsKg: { ...DEFAULT_REORDER_KG },
  });
  const [stockAdjustmentRecords, setStockAdjustmentRecords] = useState<StockAdjustmentRecord[]>([]);
  const [stockTransferRecords, setStockTransferRecords] = useState<StockTransferRecord[]>([]);

  const syncWarehouseLoads = (items: InventoryItem[]) => {
    setWarehouses((prev) =>
      prev.map((w) => ({
        ...w,
        currentLoadKg: items.filter((i) => i.warehouse === w.name).reduce((a, i) => a + i.availableKg, 0),
      }))
    );
  };

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => {
    const id = 'toast-' + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Add Stock
  const addStock = (data: Omit<InventoryItem, 'id' | 'totalValue' | 'lastUpdated'>) => {
    const newItem: InventoryItem = {
      ...data,
      id: 'inv-' + Date.now(),
      totalValue: data.availableKg * data.unitCost,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setInventory((prev) => {
      const next = [newItem, ...prev];
      syncWarehouseLoads(next);
      return next;
    });

    // Create Stock Movement
    const movement: StockMovement = {
      id: 'sm-' + Date.now(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'IN',
      itemId: newItem.id,
      itemName: newItem.name,
      batchNumber: newItem.batchNumber,
      warehouse: newItem.warehouse,
      qtyKg: newItem.availableKg,
      unitCost: newItem.unitCost,
      totalCost: newItem.totalValue,
      referenceNo: 'MANUAL-ADD-' + Math.floor(1000 + Math.random() * 9000),
      operator: currentUser?.name || 'Administrator',
      notes: 'Direct stock entry into warehouse',
    };
    setStockMovements((prev) => [movement, ...prev]);
    showToast('success', 'Stock Added Successfully', `${data.name} (${data.availableKg} kg) added to ${data.warehouse}`);
  };

  const receiveStock = (input: ReceiveStockInput) => {
    const targetWh = warehouses.find((w) => w.name === input.warehouse);
    if (!targetWh || targetWh.status !== 'Active') {
      showToast('error', 'Receive Blocked', 'Cannot post receipt to an inactive or unknown warehouse');
      return;
    }
    const todayIso = new Date().toISOString().split('T')[0];
    const { inventory: nextInv, item, isNewLine } = applyReceiveToInventory(
      inventory,
      {
        ...input,
        reorderLevelKg: input.reorderLevelKg ?? inventoryModuleSettings.reorderLevelsKg[input.category],
      },
      currentUser?.name || 'Administrator',
      todayIso
    );
    setInventory(nextInv);
    syncWarehouseLoads(nextInv);

    const movement: StockMovement = {
      id: 'sm-' + Date.now(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'IN',
      itemId: item.id,
      itemName: item.name,
      batchNumber: item.batchNumber,
      warehouse: item.warehouse,
      qtyKg: input.qtyKg,
      unitCost: item.unitCost,
      totalCost: Math.round(input.qtyKg * input.unitCostPkr),
      referenceNo: input.referenceNo,
      operator: currentUser?.name || 'Administrator',
      notes: input.notes ?? (isNewLine ? 'New stock line receipt' : 'Weighted-average merge receipt'),
    };
    setStockMovements((prev) => [movement, ...prev]);
    showToast(
      'success',
      'Receipt Posted',
      `${input.qtyKg} kg of ${input.name} — avg cost Rs. ${item.unitCost}/kg`
    );
  };

  const issueStock = (
    itemId: string,
    qtyKg: number,
    reason: string,
    referenceNo?: string,
    notes?: string
  ) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) {
      showToast('error', 'Issue Failed', 'Stock line not found');
      return;
    }
    if (qtyKg <= 0) {
      showToast('error', 'Issue Failed', 'Quantity must be greater than zero');
      return;
    }
    if (qtyKg > item.availableKg) {
      showToast('error', 'Insufficient Stock', `Only ${item.availableKg} kg available`);
      return;
    }

    const newQty = item.availableKg - qtyKg;
    const todayIso = new Date().toISOString().split('T')[0];
    const updated = inventory.map((i) => {
      if (i.id !== itemId) return i;
      return {
        ...i,
        availableKg: newQty,
        totalValue: Math.round(newQty * i.unitCost),
        lastUpdated: todayIso,
        status: computeStockStatus(newQty, i.reorderLevelKg),
      };
    });
    setInventory(updated);
    syncWarehouseLoads(updated);

    const ref = referenceNo ?? `ISS-${Date.now().toString().slice(-6)}`;
    const movement: StockMovement = {
      id: 'sm-' + Date.now(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'OUT',
      itemId: item.id,
      itemName: item.name,
      batchNumber: item.batchNumber,
      warehouse: item.warehouse,
      qtyKg,
      unitCost: item.unitCost,
      totalCost: Math.round(qtyKg * item.unitCost),
      referenceNo: ref,
      operator: currentUser?.name || 'Administrator',
      notes: notes ? `${reason}: ${notes}` : reason,
    };
    setStockMovements((prev) => [movement, ...prev]);
    showToast('success', 'Stock Issued', `${qtyKg} kg of ${item.name} posted as OUT`);
  };

  const setWarehouseStatus = (warehouseId: string, status: 'Active' | 'Inactive') => {
    setWarehouses((prev) => prev.map((w) => (w.id === warehouseId ? { ...w, status } : w)));
    showToast(
      'info',
      'Warehouse Updated',
      `${status === 'Active' ? 'Activated' : 'Deactivated'} warehouse — receipts and transfers respect this flag`
    );
  };

  const updateInventoryModuleSettings = (settings: InventoryModuleSettings) => {
    setInventoryModuleSettings(settings);
    setInventory((prev) => {
      const next = prev.map((item) => {
        const reorder = settings.reorderLevelsKg[item.category];
        return {
          ...item,
          reorderLevelKg: reorder,
          status: computeStockStatus(item.availableKg, reorder),
        };
      });
      syncWarehouseLoads(next);
      return next;
    });
    showToast('success', 'Inventory Settings Saved', 'Brands, colors, reorder defaults, and SKU thresholds updated');
  };

  // 2. Adjust Stock
  const adjustStock = (itemId: string, newQtyKg: number, reason: string) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;

    const diff = newQtyKg - item.availableKg;
    const updated = inventory.map((i) => {
      if (i.id === itemId) {
        return {
          ...i,
          availableKg: newQtyKg,
          totalValue: newQtyKg * i.unitCost,
          lastUpdated: new Date().toISOString().split('T')[0],
          status: newQtyKg <= 0 ? ('Critical' as const) : newQtyKg < i.reorderLevelKg ? ('Low Stock' as const) : ('Healthy' as const),
        };
      }
      return i;
    });
    setInventory(updated);
    syncWarehouseLoads(updated);

    const refNo = 'ADJ-' + Date.now().toString().slice(-6);
    const adjRecord: StockAdjustmentRecord = {
      id: 'adj-' + Date.now(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      itemId: item.id,
      itemName: item.name,
      warehouse: item.warehouse,
      previousQtyKg: item.availableKg,
      newQtyKg,
      deltaKg: diff,
      reason,
      referenceNo: refNo,
      operator: currentUser?.name || 'Administrator',
    };
    setStockAdjustmentRecords((prev) => [adjRecord, ...prev]);

    const movement: StockMovement = {
      id: 'sm-' + Date.now(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'ADJUSTMENT',
      itemId: item.id,
      itemName: item.name,
      batchNumber: item.batchNumber,
      warehouse: item.warehouse,
      qtyKg: Math.abs(diff),
      unitCost: item.unitCost,
      totalCost: Math.abs(diff) * item.unitCost,
      referenceNo: 'ADJ-' + Date.now().toString().slice(-4),
      operator: currentUser?.name || 'Administrator',
      notes: `Stock count adjustment (${diff >= 0 ? '+' : ''}${diff} kg): ${reason}`,
    };
    setStockMovements((prev) => [movement, ...prev]);
    showToast('info', 'Stock Adjusted', `${item.name} quantity adjusted to ${newQtyKg} kg`);
  };

  // 3. Transfer Stock (destination line created or merged)
  const transferStock = (itemId: string, fromWarehouse: string, toWarehouse: string, qtyKg: number) => {
    const destWh = warehouses.find((w) => w.name === toWarehouse);
    if (!destWh || destWh.status !== 'Active') {
      showToast('error', 'Transfer Blocked', 'Destination warehouse is inactive or unknown');
      return;
    }
    const result = applyTransfer(inventory, { itemId, fromWarehouse, toWarehouse, qtyKg });
    if ('error' in result) {
      showToast('error', 'Transfer Failed', result.error);
      return;
    }

    setInventory(result.inventory);
    syncWarehouseLoads(result.inventory);

    const refNo = 'TRF-' + Date.now().toString().slice(-6);
    const trfRecord: StockTransferRecord = {
      id: 'trf-' + Date.now(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      itemId: result.source.id,
      itemName: result.source.name,
      batchNumber: result.source.batchNumber,
      fromWarehouse,
      toWarehouse,
      qtyKg,
      unitCost: result.source.unitCost,
      referenceNo: refNo,
      operator: currentUser?.name || 'Staff',
      status: 'Completed',
    };
    setStockTransferRecords((prev) => [trfRecord, ...prev]);

    const movement: StockMovement = {
      id: 'sm-' + Date.now(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'TRANSFER',
      itemId: result.source.id,
      itemName: result.source.name,
      batchNumber: result.source.batchNumber,
      warehouse: `${fromWarehouse} ➔ ${toWarehouse}`,
      qtyKg,
      unitCost: result.source.unitCost,
      totalCost: qtyKg * result.source.unitCost,
      referenceNo: refNo,
      operator: currentUser?.name || 'Staff',
      notes: `Transfer to destination line ${result.dest.id}`,
    };
    setStockMovements((prev) => [movement, ...prev]);
    showToast('success', 'Transfer Completed', `Transferred ${qtyKg} kg to ${toWarehouse}`);
  };

  const buildProductionBatchFromForm = (
    input: ProductionBatchFormInput,
    status: ProductionBatch['status'],
    flags: { rawStockDeducted: boolean; finishedStockPosted: boolean },
    timeline: ProductionBatchTimelineEvent[]
  ): ProductionBatch | null => {
    const rawItem = input.rawMaterialBatchId
      ? inventory.find((i) => i.id === input.rawMaterialBatchId)
      : undefined;
    if (input.rawMaterialBatchId || status !== 'Draft') {
      const sourceCheck = validateRawMaterialForSource(rawItem, input.materialSource);
      if (!sourceCheck.valid) {
        showToast('error', 'Source Violation', sourceCheck.message);
        return null;
      }
      if (!rawItem) return null;
    }

    const outputCheck = validateProductionOutput(
      input.rawMaterialQtyKg,
      input.finishedGoodsOutputKg,
      input.rejectedOutputKg,
      input.reusableByproductKg
    );
    if (!outputCheck.valid && status === 'Completed') {
      showToast('error', 'Validation Failed', outputCheck.message);
      return null;
    }

    if (rawItem && status !== 'Draft' && rawItem.availableKg < input.rawMaterialQtyKg && !flags.rawStockDeducted) {
      showToast('error', 'Insufficient Stock', `Only ${rawItem.availableKg} kg available`);
      return null;
    }

    const batchNumber =
      input.batchNumber || generateProductionBatchNumber(productionBatches, productionSettings);
    const rawCostPerKg = rawItem?.unitCost || 0;
    let batch: ProductionBatch = {
      id: input.id || 'prd-' + Date.now(),
      batchNumber,
      productName: input.productName,
      color: input.color,
      materialSource: input.materialSource,
      rawMaterialName: input.rawMaterialName || rawItem?.name || '—',
      rawMaterialBatchId: rawItem?.id || input.rawMaterialBatchId,
      inputWarehouse: input.inputWarehouse || rawItem?.warehouse || '',
      rawMaterialQtyKg: input.rawMaterialQtyKg,
      plannedInputQtyKg: input.plannedInputQtyKg,
      rawMaterialCostPerKg: rawCostPerKg,
      finishedGoodsOutputKg: input.finishedGoodsOutputKg,
      rejectedOutputKg: input.rejectedOutputKg,
      reusableByproductKg: input.reusableByproductKg,
      processingLossKg: 0,
      yieldPercentage: 0,
      productionDate: input.productionDate,
      laborCost: input.laborCost,
      electricityCost: input.electricityCost,
      machineCost: input.machineCost,
      maintenanceCost: input.maintenanceCost,
      packagingCost: input.packagingCost,
      transportCost: input.transportCost,
      otherCosts: input.otherCosts,
      totalCost: 0,
      costPerKg: 0,
      operator: input.operator,
      machineId: input.machineId,
      machineName: input.machineName,
      shift: input.shift,
      status,
      notes: input.notes,
      outputBatchNumber:
        input.outputBatchNumber ||
        `FG-${input.productName.slice(0, 4).toUpperCase()}-${input.color.slice(0, 1)}-${Date.now().toString().slice(-4)}`,
      finishedGoodsWarehouse: input.finishedGoodsWarehouse,
      productionOrderRef: input.productionOrderRef,
      productionPlanRef: input.productionPlanRef,
      rawStockDeducted: flags.rawStockDeducted,
      finishedStockPosted: flags.finishedStockPosted,
      timeline,
    };
    batch = refreshBatchCosts(batch, rawItem);
    return batch;
  };

  const saveProductionBatchDraft = (input: ProductionBatchFormInput): string => {
    const timeline: ProductionBatchTimelineEvent[] = [
      {
        id: 'tl-' + Date.now(),
        at: new Date().toISOString(),
        label: 'Created',
        detail: 'Draft saved — inventory unchanged',
      },
    ];
    const batch = buildProductionBatchFromForm(
      input,
      'Draft',
      { rawStockDeducted: false, finishedStockPosted: false },
      timeline
    );
    if (!batch) return '';
    setProductionBatches((prev) => [batch, ...prev]);
    showToast('success', 'Draft Saved', `Batch ${batch.batchNumber} saved`);
    return batch.id;
  };

  const updateProductionBatchDraft = (batchId: string, input: ProductionBatchFormInput) => {
    const existing = productionBatches.find((b) => b.id === batchId);
    if (!existing || existing.status !== 'Draft') {
      showToast('error', 'Cannot Edit', 'Only draft batches can be edited');
      return;
    }
    const updated = buildProductionBatchFromForm(
      { ...input, id: batchId, batchNumber: existing.batchNumber },
      'Draft',
      { rawStockDeducted: false, finishedStockPosted: false },
      [...existing.timeline, { id: 'tl-' + Date.now(), at: new Date().toISOString(), label: 'Draft updated' }]
    );
    if (!updated) return;
    setProductionBatches((prev) => prev.map((b) => (b.id === batchId ? updated : b)));
    showToast('success', 'Draft Updated', updated.batchNumber);
  };

  const startProductionBatch = (batchId: string) => {
    const batch = productionBatches.find((b) => b.id === batchId);
    if (!batch) return;
    if (batch.status !== 'Draft') {
      showToast('error', 'Invalid Transition', 'Only draft batches can be started');
      return;
    }
    if (batch.rawStockDeducted) {
      showToast('info', 'Already Started', 'Raw material already deducted');
      return;
    }
    const rawItem = inventory.find((i) => i.id === batch.rawMaterialBatchId);
    if (!rawItem || rawItem.availableKg < batch.rawMaterialQtyKg) {
      showToast('error', 'Insufficient Stock', 'Cannot start — not enough raw material');
      return;
    }
    setInventory((prev) => {
      const next = deductRawMaterialStock(prev, rawItem.id, batch.rawMaterialQtyKg);
      syncWarehouseLoads(next);
      return next;
    });
    setProductionBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? {
              ...b,
              status: 'In Progress',
              rawStockDeducted: true,
              timeline: [
                ...b.timeline,
                {
                  id: 'tl-start-' + Date.now(),
                  at: new Date().toISOString(),
                  label: 'Production started',
                  detail: `${batch.rawMaterialQtyKg} kg deducted from ${b.inputWarehouse}`,
                },
              ],
            }
          : b
      )
    );
    showToast('success', 'Production Started', batch.batchNumber);
  };

  const completeProductionBatch = (batchId: string) => {
    const batch = productionBatches.find((b) => b.id === batchId);
    if (!batch) return;
    if (batch.status === 'Completed') {
      showToast('error', 'Already Completed', 'Batch cannot be completed twice');
      return;
    }
    if (batch.finishedStockPosted) {
      showToast('error', 'Already Posted', 'Finished goods already posted');
      return;
    }
    const outputCheck = validateProductionOutput(
      batch.rawMaterialQtyKg,
      batch.finishedGoodsOutputKg,
      batch.rejectedOutputKg,
      batch.reusableByproductKg
    );
    if (!outputCheck.valid) {
      showToast('error', 'Validation Failed', outputCheck.message);
      return;
    }
    if (batch.finishedGoodsOutputKg <= 0) {
      showToast('error', 'No Output', 'Record saleable finished output before completing');
      return;
    }

    const rawItem = inventory.find((i) => i.id === batch.rawMaterialBatchId);
    if (!rawItem) return;

    if (!batch.rawStockDeducted) {
      if (rawItem.availableKg < batch.rawMaterialQtyKg) {
        showToast('error', 'Insufficient Stock', 'Not enough raw material to complete');
        return;
      }
      setInventory((prev) => deductRawMaterialStock(prev, rawItem.id, batch.rawMaterialQtyKg));
    }

    const finalized = refreshBatchCosts(batch, rawItem);
    setInventory((prev) => {
      const next = postFinishedGoodsOutput(
        prev,
        finalized,
        finalized.finishedGoodsOutputKg,
        finalized.costPerKg
      );
      syncWarehouseLoads(next);
      return next;
    });

    const movements = buildProductionMovements(finalized, rawItem, batch.operator);
    setStockMovements((prev) => [...movements, ...prev]);

    setProductionBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? {
              ...finalized,
              status: 'Completed',
              rawStockDeducted: true,
              finishedStockPosted: true,
              completedAt: new Date().toISOString(),
              timeline: [
                ...b.timeline,
                {
                  id: 'tl-complete-' + Date.now(),
                  at: new Date().toISOString(),
                  label: 'Production completed',
                  detail: `${finalized.finishedGoodsOutputKg} kg finished goods posted`,
                },
              ],
            }
          : b
      )
    );
    showToast('success', 'Production Completed', `${batch.batchNumber} — Rs. ${finalized.costPerKg}/kg`);
  };

  const cancelProductionBatch = (batchId: string, reason: string) => {
    const batch = productionBatches.find((b) => b.id === batchId);
    if (!batch) return;
    if (batch.status === 'Completed') {
      showToast('error', 'Cannot Cancel', 'Completed batches cannot be cancelled');
      return;
    }
  if (batch.rawStockDeducted && !batch.finishedStockPosted) {
      setInventory((prev) => {
        const next = restoreRawMaterialStock(prev, batch.rawMaterialBatchId, batch.rawMaterialQtyKg);
        syncWarehouseLoads(next);
        return next;
      });
    }
    if (batch.finishedStockPosted) {
      setInventory((prev) => {
        const next = reverseFinishedGoodsOutput(prev, batch, batch.finishedGoodsOutputKg);
        syncWarehouseLoads(next);
        return next;
      });
    }
    setProductionBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? {
              ...b,
              status: 'Cancelled',
              cancelledAt: new Date().toISOString(),
              cancelReason: reason,
              timeline: [
                ...b.timeline,
                { id: 'tl-cancel-' + Date.now(), at: new Date().toISOString(), label: 'Cancelled', detail: reason },
              ],
            }
          : b
      )
    );
    showToast('warning', 'Batch Cancelled', reason);
  };

  const completeProductionFromInput = (input: ProductionBatchFormInput): string => {
    const timeline: ProductionBatchTimelineEvent[] = [
      { id: 'tl-' + Date.now(), at: new Date().toISOString(), label: 'Created' },
      { id: 'tl-c-' + Date.now(), at: new Date().toISOString(), label: 'Production completed' },
    ];
    const draft = buildProductionBatchFromForm(
      input,
      'Draft',
      { rawStockDeducted: false, finishedStockPosted: false },
      timeline
    );
    if (!draft) return '';
    const rawItem = inventory.find((i) => i.id === draft.rawMaterialBatchId);
    if (!rawItem || rawItem.availableKg < draft.rawMaterialQtyKg) {
      showToast('error', 'Insufficient Stock', 'Cannot complete production');
      return '';
    }
    const finalized = refreshBatchCosts(draft, rawItem);
    setInventory((prev) => {
      let next = deductRawMaterialStock(prev, rawItem.id, finalized.rawMaterialQtyKg);
      next = postFinishedGoodsOutput(next, finalized, finalized.finishedGoodsOutputKg, finalized.costPerKg);
      syncWarehouseLoads(next);
      return next;
    });
    setStockMovements((prev) => [...buildProductionMovements(finalized, rawItem, draft.operator), ...prev]);
    const id = draft.id;
    setProductionBatches((prev) => [
      {
        ...finalized,
        id,
        status: 'Completed',
        rawStockDeducted: true,
        finishedStockPosted: true,
        completedAt: new Date().toISOString(),
        timeline,
      },
      ...prev.filter((b) => b.id !== id),
    ]);
    showToast('success', 'Production Completed', finalized.batchNumber);
    return id;
  };

  const createProductionBatch = (
    data: Omit<ProductionBatch, 'id' | 'processingLossKg' | 'yieldPercentage' | 'totalCost' | 'costPerKg'>
  ) => {
    const input: ProductionBatchFormInput = {
      batchNumber: data.batchNumber,
      productName: data.productName,
      color: data.color,
      materialSource: data.materialSource,
      rawMaterialBatchId: data.rawMaterialBatchId,
      rawMaterialName: data.rawMaterialName,
      inputWarehouse: data.inputWarehouse || '',
      rawMaterialQtyKg: data.rawMaterialQtyKg,
      finishedGoodsOutputKg: data.finishedGoodsOutputKg,
      rejectedOutputKg: data.rejectedOutputKg ?? 0,
      reusableByproductKg: data.reusableByproductKg ?? 0,
      finishedGoodsWarehouse: data.finishedGoodsWarehouse || 'Finished Goods Hall D',
      productionDate: data.productionDate,
      laborCost: data.laborCost,
      electricityCost: data.electricityCost,
      machineCost: data.machineCost,
      maintenanceCost: data.maintenanceCost ?? 0,
      packagingCost: data.packagingCost ?? 0,
      transportCost: data.transportCost ?? 0,
      otherCosts: data.otherCosts,
      operator: data.operator,
      machineId: data.machineId,
      machineName: data.machineName,
      shift: data.shift,
      notes: data.notes,
      outputBatchNumber: data.outputBatchNumber,
    };
    completeProductionFromInput(input);
  };

  const upsertProductionPlan = (
    plan: Omit<ProductionPlan, 'id' | 'planNumber'> & { id?: string; planNumber?: string }
  ) => {
    if (plan.id) {
      setProductionPlans((prev) =>
        prev.map((p) =>
          p.id === plan.id
            ? {
                ...p,
                ...plan,
                requiredRawMaterialQtyKg: estimateInputFromPlan(plan.plannedOutputQtyKg, plan.targetYieldPct),
              }
            : p
        )
      );
      showToast('success', 'Plan Updated', plan.planNumber || plan.id);
      return;
    }
    const planNumber = plan.planNumber || generateProductionPlanNumber(productionPlans, productionSettings);
    const newPlan: ProductionPlan = {
      ...(plan as ProductionPlan),
      id: 'plan-' + Date.now(),
      planNumber,
      requiredRawMaterialQtyKg: estimateInputFromPlan(plan.plannedOutputQtyKg, plan.targetYieldPct),
      status: plan.status || 'Draft',
    };
    setProductionPlans((prev) => [newPlan, ...prev]);
    showToast('success', 'Plan Created', planNumber);
  };

  const updateProductionPlanStatus = (planId: string, status: ProductionPlanStatus, cancelReason?: string) => {
    setProductionPlans((prev) =>
      prev.map((p) =>
        p.id === planId ? { ...p, status, cancelReason: cancelReason || p.cancelReason } : p
      )
    );
  };

  const upsertProductionOrder = (
    order: Omit<ProductionOrder, 'id' | 'orderNumber' | 'linkedBatchIds'> & { id?: string; orderNumber?: string }
  ) => {
    if (order.id) {
      setProductionOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, ...order, linkedBatchIds: o.linkedBatchIds } : o)));
      return;
    }
    const orderNumber = order.orderNumber || generateProductionOrderNumber(productionOrders, productionSettings);
    const newOrder: ProductionOrder = {
      ...(order as ProductionOrder),
      id: 'ord-' + Date.now(),
      orderNumber,
      linkedBatchIds: [],
      status: order.status || 'Draft',
    };
    setProductionOrders((prev) => [newOrder, ...prev]);
    showToast('success', 'Order Created', orderNumber);
  };

  const updateProductionOrderStatus = (orderId: string, status: ProductionOrderStatus, cancelReason?: string) => {
    setProductionOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, cancelReason: cancelReason || o.cancelReason } : o))
    );
  };

  const convertPlanToBatch = (planId: string): string => {
    const plan = productionPlans.find((p) => p.id === planId);
    if (!plan || plan.status !== 'Approved') {
      showToast('error', 'Plan Not Approved', 'Only approved plans can convert to batches');
      return '';
    }
    const id = saveProductionBatchDraft({
      productName: plan.brand,
      color: plan.color,
      materialSource: plan.materialSource,
      rawMaterialBatchId: '',
      inputWarehouse: '',
      rawMaterialQtyKg: plan.requiredRawMaterialQtyKg,
      plannedInputQtyKg: plan.requiredRawMaterialQtyKg,
      finishedGoodsOutputKg: 0,
      rejectedOutputKg: 0,
      reusableByproductKg: 0,
      finishedGoodsWarehouse: 'Finished Goods Hall D',
      productionDate: plan.plannedProductionDate,
      laborCost: 0,
      electricityCost: 0,
      machineCost: 0,
      maintenanceCost: 0,
      packagingCost: 0,
      transportCost: 0,
      otherCosts: 0,
      operator: plan.assignedOperator,
      productionPlanRef: plan.planNumber,
    });
    if (id) {
      updateProductionPlanStatus(planId, 'In Progress');
      setProductionPlans((prev) => prev.map((p) => (p.id === planId ? { ...p, linkedBatchId: id } : p)));
    }
    return id;
  };

  const convertOrderToBatch = (orderId: string): string => {
    const order = productionOrders.find((o) => o.id === orderId);
    if (!order) return '';
    const active = productionBatches.find(
      (b) => b.productionOrderRef === order.orderNumber && b.status !== 'Completed' && b.status !== 'Cancelled'
    );
    if (active) {
      showToast('error', 'Duplicate Batch', 'An active batch already exists for this order');
      return '';
    }
    const id = saveProductionBatchDraft({
      productName: order.brand,
      color: order.color,
      materialSource: order.materialSource,
      rawMaterialBatchId: '',
      inputWarehouse: '',
      rawMaterialQtyKg: 0,
      plannedInputQtyKg: 0,
      finishedGoodsOutputKg: 0,
      rejectedOutputKg: 0,
      reusableByproductKg: 0,
      finishedGoodsWarehouse: 'Finished Goods Hall D',
      productionDate: order.plannedProductionDate,
      laborCost: 0,
      electricityCost: 0,
      machineCost: 0,
      maintenanceCost: 0,
      packagingCost: 0,
      transportCost: 0,
      otherCosts: 0,
      operator: productionOperators[0]?.name || 'Staff',
      productionOrderRef: order.orderNumber,
    });
    if (id) {
      setProductionOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: 'In Progress', linkedBatchIds: [...o.linkedBatchIds, id] } : o
        )
      );
    }
    return id;
  };

  const updateProductionSettings = (settings: ProductionSettings) => {
    setProductionSettings(settings);
    showToast('success', 'Production Settings Saved', 'Configuration updated');
  };

  const upsertProductionMachine = (machine: ProductionMachine) => {
    setProductionMachines((prev) => {
      const exists = prev.some((m) => m.id === machine.id);
      return exists ? prev.map((m) => (m.id === machine.id ? machine : m)) : [...prev, machine];
    });
  };

  const upsertProductionOperator = (operator: ProductionOperator) => {
    setProductionOperators((prev) => {
      const exists = prev.some((o) => o.id === operator.id);
      return exists ? prev.map((o) => (o.id === operator.id ? operator : o)) : [...prev, operator];
    });
  };

  const buildBatchFromForm = (
    input: RecyclingBatchFormInput,
    status: RecyclingBatch['status'],
    flags: { wasteStockDeducted: boolean; outputStockPosted: boolean },
    timeline: RecyclingBatchTimelineEvent[]
  ): RecyclingBatch | null => {
    const wasteItem = inventory.find((i) => i.id === input.wasteInputBatchId);
    if (!wasteItem) {
      showToast('error', 'Invalid Waste Batch', 'Only Waste Plastic inventory can be used as recycling input');
      return null;
    }
    if (wasteItem.category !== 'WASTE_PLASTIC') {
      showToast('error', 'Invalid Category', 'Recycling input must be Waste Plastic stock');
      return null;
    }

    const validation = validateOutputAgainstInput(input.inputWasteQtyKg, input.outputs);
    if (!validation.valid) {
      showToast('error', 'Validation Failed', validation.message);
      return null;
    }

    if (status !== 'Draft' && wasteItem.availableKg < input.inputWasteQtyKg) {
      showToast('error', 'Insufficient Waste Stock', `Only ${wasteItem.availableKg} kg available in yard`);
      return null;
    }

    const wasteMaterialCost = computeWasteMaterialCost(input.inputWasteQtyKg, wasteItem.unitCost);
    const provisionalOutputs: RecyclingOutputLine[] = input.outputs.map((o) => ({
      ...o,
      allocatedCost: 0,
      costPerKg: 0,
    }));
    const metrics = computeRecyclingMetrics(input.inputWasteQtyKg, provisionalOutputs, {
      wasteMaterialCost,
      laborCost: input.laborCost,
      electricityCost: input.electricityCost,
      machineCost: input.machineCost,
      transportCost: input.transportCost,
      maintenanceCost: input.maintenanceCost,
      otherCosts: input.otherCosts,
    });
    const outputs = allocateOutputCosts(metrics.totalBatchCost, input.outputs);
    const primaryOutput = outputs[0];

    const batchNumber =
      input.batchNumber ||
      generateRecyclingBatchNumber(recyclingBatches, recyclingSettings);

    return {
      id: input.id || 'rec-' + Date.now(),
      batchNumber,
      batchName: input.batchName,
      wasteInputBatchId: wasteItem.id,
      wasteInputName: wasteItem.name,
      inputWarehouse: wasteItem.warehouse,
      inputWasteQtyKg: input.inputWasteQtyKg,
      wasteCostPerKg: wasteItem.unitCost,
      outputMaterialType: primaryOutput?.materialName || '',
      outputQtyKg: metrics.totalOutputKg,
      outputs,
      processingLossKg: metrics.processingLossKg,
      yieldPercentage: metrics.yieldPercentage,
      laborCost: input.laborCost,
      electricityCost: input.electricityCost,
      machineCost: input.machineCost,
      transportCost: input.transportCost,
      maintenanceCost: input.maintenanceCost,
      otherCosts: input.otherCosts,
      totalProcessingCost: metrics.totalProcessingCost,
      totalBatchCost: metrics.totalBatchCost,
      costPerKg: metrics.blendedCostPerKg,
      processingDate: input.processingDate,
      operator: input.operator,
      machineId: input.machineId,
      machineName: input.machineName,
      status,
      notes: input.notes,
      destinationWarehouse: input.destinationWarehouse || primaryOutput?.outputWarehouse || wasteItem.warehouse,
      wasteStockDeducted: flags.wasteStockDeducted,
      outputStockPosted: flags.outputStockPosted,
      timeline,
    };
  };

  const saveRecyclingBatchDraft = (input: RecyclingBatchFormInput): string => {
    const timeline: RecyclingBatchTimelineEvent[] = [
      {
        id: 'tl-' + Date.now(),
        at: new Date().toISOString(),
        label: 'Created',
        detail: 'Batch saved as draft — inventory not affected',
      },
    ];
    const batch = buildBatchFromForm(
      input,
      'Draft',
      { wasteStockDeducted: false, outputStockPosted: false },
      timeline
    );
    if (!batch) return '';
    setRecyclingBatches((prev) => [batch, ...prev]);
    showToast('success', 'Draft Saved', `Batch ${batch.batchNumber} saved without stock impact`);
    return batch.id;
  };

  const updateRecyclingBatchDraft = (batchId: string, input: RecyclingBatchFormInput) => {
    const existing = recyclingBatches.find((b) => b.id === batchId);
    if (!existing || existing.status !== 'Draft') {
      showToast('error', 'Cannot Edit', 'Only draft batches can be edited');
      return;
    }
    const updated = buildBatchFromForm(
      { ...input, id: batchId, batchNumber: existing.batchNumber },
      'Draft',
      { wasteStockDeducted: false, outputStockPosted: false },
      [
        ...existing.timeline,
        { id: 'tl-' + Date.now(), at: new Date().toISOString(), label: 'Draft updated' },
      ]
    );
    if (!updated) return;
    setRecyclingBatches((prev) => prev.map((b) => (b.id === batchId ? updated : b)));
    showToast('success', 'Draft Updated', `Batch ${updated.batchNumber} revised`);
  };

  const startRecyclingBatch = (batchId: string) => {
    const batch = recyclingBatches.find((b) => b.id === batchId);
    if (!batch) return;
    if (batch.status !== 'Draft' && batch.status !== 'In Progress') {
      showToast('error', 'Invalid Transition', 'Only draft batches can start processing');
      return;
    }
    if (batch.wasteStockDeducted) {
      showToast('info', 'Already Started', 'Waste stock already deducted for this batch');
      return;
    }

    const wasteItem = inventory.find((i) => i.id === batch.wasteInputBatchId);
    if (!wasteItem || wasteItem.availableKg < batch.inputWasteQtyKg) {
      showToast('error', 'Insufficient Waste', 'Cannot start — not enough waste plastic available');
      return;
    }

    setInventory((prev) => {
      const next = deductWasteStock(prev, wasteItem.id, batch.inputWasteQtyKg);
      syncWarehouseLoads(next);
      return next;
    });

    setRecyclingBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? {
              ...b,
              status: 'In Progress',
              wasteStockDeducted: true,
              timeline: [
                ...b.timeline,
                {
                  id: 'tl-start-' + Date.now(),
                  at: new Date().toISOString(),
                  label: 'Processing started',
                  detail: `${batch.inputWasteQtyKg} kg waste deducted from ${b.inputWarehouse}`,
                },
              ],
            }
          : b
      )
    );
    showToast('success', 'Processing Started', `Waste deducted for ${batch.batchNumber}`);
  };

  const completeRecyclingBatch = (batchId: string) => {
    const batch = recyclingBatches.find((b) => b.id === batchId);
    if (!batch) return;
    if (batch.status === 'Completed') {
      showToast('error', 'Already Completed', 'Batch cannot be completed twice');
      return;
    }
    if (batch.outputStockPosted) {
      showToast('error', 'Already Posted', 'Output stock already posted');
      return;
    }
    const totalOut = batch.outputs.reduce((a, o) => a + o.outputQtyKg, 0);
    if (totalOut <= 0) {
      showToast('error', 'No Output', 'Cannot complete a batch with zero output quantity');
      return;
    }

    const wasteItem = inventory.find((i) => i.id === batch.wasteInputBatchId);
    if (!wasteItem) return;

    // If never started, deduct waste now (atomic complete from quick action)
    if (!batch.wasteStockDeducted) {
      if (wasteItem.availableKg < batch.inputWasteQtyKg) {
        showToast('error', 'Insufficient Waste', 'Not enough waste plastic to complete batch');
        return;
      }
      setInventory((prev) => deductWasteStock(prev, wasteItem.id, batch.inputWasteQtyKg));
    }

    setInventory((prev) => {
      const next = postRecycledOutputs(prev, batch, batch.outputs);
      syncWarehouseLoads(next);
      return next;
    });

    const movements = buildRecyclingMovements(batch, wasteItem, batch.outputs, batch.operator);
    setStockMovements((prev) => [...movements, ...prev]);

    setRecyclingBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? {
              ...b,
              status: 'Completed',
              wasteStockDeducted: true,
              outputStockPosted: true,
              completedAt: new Date().toISOString(),
              timeline: [
                ...b.timeline,
                {
                  id: 'tl-complete-' + Date.now(),
                  at: new Date().toISOString(),
                  label: 'Completed',
                  detail: 'Recycled outputs posted to inventory',
                },
              ],
            }
          : b
      )
    );
    showToast(
      'success',
      'Batch Completed',
      `${batch.batchNumber}: ${totalOut} kg recycled material at Rs. ${batch.costPerKg}/kg`
    );
  };

  const cancelRecyclingBatch = (batchId: string, reason: string) => {
    const batch = recyclingBatches.find((b) => b.id === batchId);
    if (!batch) return;
    if (batch.status === 'Completed') {
      showToast('error', 'Cannot Cancel', 'Completed batches require reversal workflow — not silent delete');
      return;
    }
    if (batch.outputStockPosted) {
      showToast('error', 'Cannot Cancel', 'Output already posted');
      return;
    }

    if (batch.wasteStockDeducted) {
      setInventory((prev) => {
        const next = restoreWasteStock(prev, batch.wasteInputBatchId, batch.inputWasteQtyKg);
        syncWarehouseLoads(next);
        return next;
      });
    }

    setRecyclingBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? {
              ...b,
              status: 'Cancelled',
              cancelReason: reason,
              cancelledAt: new Date().toISOString(),
              timeline: [
                ...b.timeline,
                {
                  id: 'tl-cancel-' + Date.now(),
                  at: new Date().toISOString(),
                  label: 'Cancelled',
                  detail: reason,
                },
              ],
            }
          : b
      )
    );
    showToast('warning', 'Batch Cancelled', batch.batchNumber);
  };

  // Quick complete: create + start + complete in one operation (global modal)
  const createRecyclingBatch = (
    data: Omit<
      RecyclingBatch,
      | 'id'
      | 'processingLossKg'
      | 'yieldPercentage'
      | 'totalProcessingCost'
      | 'totalBatchCost'
      | 'costPerKg'
      | 'outputQtyKg'
      | 'outputMaterialType'
      | 'wasteStockDeducted'
      | 'outputStockPosted'
      | 'timeline'
      | 'outputs'
    > & { outputs: Omit<RecyclingOutputLine, 'allocatedCost' | 'costPerKg'>[] }
  ) => {
    const formInput: RecyclingBatchFormInput = {
      wasteInputBatchId: data.wasteInputBatchId,
      inputWasteQtyKg: data.inputWasteQtyKg,
      outputs: data.outputs,
      laborCost: data.laborCost,
      electricityCost: data.electricityCost,
      machineCost: data.machineCost,
      transportCost: data.transportCost ?? 0,
      maintenanceCost: data.maintenanceCost ?? 0,
      otherCosts: data.otherCosts,
      processingDate: data.processingDate,
      operator: data.operator,
      machineId: data.machineId,
      machineName: data.machineName,
      notes: data.notes,
      destinationWarehouse: data.destinationWarehouse,
      batchName: data.batchName,
    };
    const batch = buildBatchFromForm(
      formInput,
      'In Progress',
      { wasteStockDeducted: false, outputStockPosted: false },
      [
        {
          id: 'tl-' + Date.now(),
          at: new Date().toISOString(),
          label: 'Created',
          detail: 'Quick batch from modal',
        },
      ]
    );
    if (!batch) return;
    const wasteItem = inventory.find((i) => i.id === batch.wasteInputBatchId);
    if (!wasteItem || wasteItem.availableKg < batch.inputWasteQtyKg) return;

    setInventory((prev) => {
      let next = deductWasteStock(prev, wasteItem.id, batch.inputWasteQtyKg);
      next = postRecycledOutputs(next, batch, batch.outputs);
      syncWarehouseLoads(next);
      return next;
    });
    const movements = buildRecyclingMovements(batch, wasteItem, batch.outputs, batch.operator);
    setStockMovements((prev) => [...movements, ...prev]);

    const completed: RecyclingBatch = {
      ...batch,
      status: 'Completed',
      wasteStockDeducted: true,
      outputStockPosted: true,
      completedAt: new Date().toISOString(),
      timeline: [
        ...batch.timeline,
        {
          id: 'tl-complete-' + Date.now(),
          at: new Date().toISOString(),
          label: 'Completed',
          detail: 'Quick complete from recycling modal',
        },
      ],
    };
    setRecyclingBatches((prev) => [completed, ...prev]);
    showToast(
      'success',
      'Recycling Batch Completed',
      `${completed.batchNumber}: ${completed.outputQtyKg} kg output at Rs. ${completed.costPerKg}/kg`
    );
  };

  const updateRecyclingSettings = (settings: RecyclingSettings) => {
    setRecyclingSettings(settings);
    showToast('success', 'Recycling Settings Saved', 'Configuration updated');
  };

  const upsertProcessingMachine = (machine: ProcessingMachine) => {
    setProcessingMachines((prev) => {
      const exists = prev.some((m) => m.id === machine.id);
      return exists ? prev.map((m) => (m.id === machine.id ? machine : m)) : [...prev, machine];
    });
  };

  const upsertRecyclingOperator = (operator: RecyclingOperator) => {
    setRecyclingOperators((prev) => {
      const exists = prev.some((o) => o.id === operator.id);
      return exists ? prev.map((o) => (o.id === operator.id ? operator : o)) : [...prev, operator];
    });
  };

  const toggleRecyclingOutputType = (id: string, active: boolean) => {
    setRecyclingOutputTypes((prev) => prev.map((t) => (t.id === id ? { ...t, active } : t)));
  };

  const buildInvoiceFromForm = (
    input: SalesInvoiceFormInput,
    existing?: SalesInvoice
  ): { invoice: Omit<SalesInvoice, 'id'>; customer: Customer } | null => {
    const customer = customers.find((c) => c.id === input.customerId);
    if (!customer) {
      showToast('error', 'Customer required', 'Select a valid customer.');
      return null;
    }
    const totals = computeInvoiceTotals(
      input.items,
      input.discountType,
      input.discountType === 'Percent' ? input.discountValue : input.discountValue,
      salesSettings.taxEnabled,
      salesSettings.taxRatePct
    );
    const discount = totals.discount;
    const base: Omit<SalesInvoice, 'id'> = {
      invoiceNumber: input.invoiceNumber || existing?.invoiceNumber || generateInvoiceNumber(salesInvoices, salesSettings),
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      saleDate: input.saleDate,
      dueDate: input.dueDate,
      items: input.items,
      subtotal: totals.subtotal,
      discountType: input.discountType,
      discount,
      discountPercent: input.discountType === 'Percent' ? input.discountValue : undefined,
      taxAmount: totals.taxAmount,
      grandTotal: totals.grandTotal,
      amountReceived: input.amountReceived,
      remainingBalance: Math.max(0, totals.grandTotal - input.amountReceived),
      paymentStatus: 'Unpaid',
      invoiceStatus: 'Draft',
      stockDeducted: false,
      dispatchWarehouse: input.dispatchWarehouse || 'Finished Goods Hall D',
      salesperson: input.salesperson,
      paymentMethod: input.paymentMethod,
      notes: input.notes,
      confirmedAt: undefined,
    };
    const refreshed = refreshInvoicePaymentFields({ ...base, id: 'tmp' } as SalesInvoice);
    return {
      invoice: { ...base, ...refreshed },
      customer,
    };
  };

  const postKhataForConfirm = (invoice: SalesInvoice, customerId: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            totalSales: c.totalSales + invoice.grandTotal,
            paymentsReceived: c.paymentsReceived + invoice.amountReceived,
            currentBalance: c.currentBalance + invoice.remainingBalance,
          };
        }
        return c;
      })
    );
    const existingLedger = customerKhata[customerId] || [];
    const lastRunning = existingLedger.length > 0 ? existingLedger[existingLedger.length - 1].runningBalance : 0;
    const invoiceDebit = lastRunning + invoice.grandTotal;
    const invoiceEntry: KhataEntry = {
      id: 'k-' + Date.now(),
      date: invoice.saleDate,
      referenceNo: invoice.invoiceNumber,
      description: `Sales Invoice ${invoice.invoiceNumber} - ${invoice.items.map((i) => `${i.productName} (${i.qtyKg}kg)`).join(', ')}`,
      type: 'INVOICE',
      debit: invoice.grandTotal,
      credit: 0,
      runningBalance: invoiceDebit,
    };
    let updatedLedger = [...existingLedger, invoiceEntry];
    if (invoice.amountReceived > 0) {
      updatedLedger.push({
        id: 'k-' + (Date.now() + 1),
        date: invoice.saleDate,
        referenceNo: 'RCP-' + invoice.invoiceNumber,
        description: `Payment received against ${invoice.invoiceNumber} (${invoice.paymentMethod || 'Cash'})`,
        type: 'PAYMENT',
        debit: 0,
        credit: invoice.amountReceived,
        runningBalance: invoiceDebit - invoice.amountReceived,
      });
      const targetType = invoice.paymentMethod === 'Cash' ? 'Cash' : 'Bank';
      setAccounts((prev) =>
        prev.map((a) =>
          a.accountType === targetType ? { ...a, currentBalance: a.currentBalance + invoice.amountReceived } : a
        )
      );
      setCustomerPayments((prev) => [
        {
          id: 'pay-' + Date.now(),
          paymentReference: 'RCP-' + invoice.invoiceNumber,
          paymentDate: invoice.saleDate,
          customerId: invoice.customerId,
          customerName: invoice.customerName,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.amountReceived,
          paymentMethod: invoice.paymentMethod || 'Cash',
        },
        ...prev,
      ]);
    }
    setCustomerKhata((prev) => ({ ...prev, [customerId]: updatedLedger }));
  };

  const applyConfirmStock = (invoice: SalesInvoice) => {
    const validation = validateSaleLines(invoice.items, inventory, 'Confirmed');
    if (!validation.valid) {
      showToast('error', 'Stock validation failed', validation.message);
      return false;
    }
    setInventory((prev) => {
      const next = deductFinishedGoodsForSale(prev, invoice.items, invoice.dispatchWarehouse);
      syncWarehouseLoads(next);
      return next;
    });
    const moves = buildSalesDispatchMovements(
      invoice,
      invoice.items,
      inventory,
      currentUser?.name || 'Sales Staff'
    );
    setStockMovements((prev) => [...moves, ...prev]);
    return true;
  };

  const saveSalesInvoiceDraft = (input: SalesInvoiceFormInput): string => {
    const validation = validateSaleLines(input.items, inventory, 'Draft');
    if (!validation.valid) {
      showToast('error', 'Cannot save draft', validation.message);
      return '';
    }
    const built = buildInvoiceFromForm(input);
    if (!built) return '';
    const id = input.id || 'inv-' + Date.now();
    const invoice: SalesInvoice = { ...built.invoice, id, invoiceStatus: 'Draft', stockDeducted: false };
    setSalesInvoices((prev) => {
      const exists = prev.some((i) => i.id === id);
      if (exists) return prev.map((i) => (i.id === id ? { ...invoice, invoiceStatus: 'Draft', stockDeducted: false } : i));
      return [invoice, ...prev];
    });
    showToast('success', 'Draft saved', `Invoice ${invoice.invoiceNumber} saved as draft (no stock movement).`);
    return id;
  };

  const updateSalesInvoiceDraft = (invoiceId: string, input: SalesInvoiceFormInput) => {
    const existing = salesInvoices.find((i) => i.id === invoiceId);
    if (!existing || existing.invoiceStatus !== 'Draft') {
      showToast('error', 'Update blocked', 'Only draft invoices can be edited.');
      return;
    }
    saveSalesInvoiceDraft({ ...input, id: invoiceId, invoiceNumber: existing.invoiceNumber });
  };

  const confirmSalesInvoice = (invoiceId: string) => {
    const invoice = salesInvoices.find((i) => i.id === invoiceId);
    if (!invoice) return;
    if (invoice.invoiceStatus === 'Cancelled') {
      showToast('error', 'Cannot confirm', 'Cancelled invoices cannot be confirmed.');
      return;
    }
    if (invoice.stockDeducted) {
      showToast('info', 'Already confirmed', 'Stock was already deducted for this invoice.');
      return;
    }
    const validation = validateSaleLines(invoice.items, inventory, 'Confirmed');
    if (!validation.valid) {
      showToast('error', 'Confirm failed', validation.message);
      return;
    }
    if (!applyConfirmStock(invoice)) return;
    const refreshed = refreshInvoicePaymentFields({ ...invoice, invoiceStatus: 'Confirmed' });
    const confirmed: SalesInvoice = {
      ...invoice,
      ...refreshed,
      stockDeducted: true,
      confirmedAt: new Date().toISOString(),
    };
    setSalesInvoices((prev) => prev.map((i) => (i.id === invoiceId ? confirmed : i)));
    if (invoice.invoiceStatus === 'Draft') {
      postKhataForConfirm(confirmed, invoice.customerId);
    }
    setSalesSettings((s) => ({
      ...s,
      invoiceNumberNextSeq: s.invoiceNumberNextSeq + 1,
    }));
    showToast('success', 'Invoice confirmed', `${confirmed.invoiceNumber} posted. Finished goods reduced once.`);
  };

  const cancelSalesInvoice = (invoiceId: string, reason: string) => {
    const invoice = salesInvoices.find((i) => i.id === invoiceId);
    if (!invoice || invoice.invoiceStatus === 'Cancelled') return;
    if (invoice.stockDeducted) {
      setInventory((prev) => {
        const next = restoreFinishedGoodsForCancel(prev, invoice.items, invoice.dispatchWarehouse);
        syncWarehouseLoads(next);
        return next;
      });
      const moves = buildSalesRestoreMovements(
        invoice,
        invoice.items,
        inventory,
        currentUser?.name || 'Sales Staff'
      );
      setStockMovements((prev) => [...moves, ...prev]);
    }
    setSalesInvoices((prev) =>
      prev.map((i) =>
        i.id === invoiceId
          ? {
              ...i,
              invoiceStatus: 'Cancelled',
              cancelReason: reason,
              cancelledAt: new Date().toISOString(),
              stockDeducted: false,
            }
          : i
      )
    );
    showToast('success', 'Invoice cancelled', reason);
  };

  const createSalesInvoice = (
    data: Omit<
      SalesInvoice,
      'id' | 'remainingBalance' | 'paymentStatus' | 'invoiceStatus' | 'stockDeducted' | 'taxAmount' | 'discountType'
    > & { discountType?: DiscountType; taxAmount?: number; invoiceStatus?: InvoiceStatus }
  ) => {
    const discountType = data.discountType || 'Fixed';
    const id = saveSalesInvoiceDraft({
      customerId: data.customerId,
      saleDate: data.saleDate,
      dueDate: data.dueDate,
      items: data.items,
      discountType,
      discountValue: discountType === 'Percent' ? data.discountPercent || 0 : data.discount,
      amountReceived: data.amountReceived,
      paymentMethod: data.paymentMethod,
      dispatchWarehouse: data.dispatchWarehouse,
      salesperson: data.salesperson,
      notes: data.notes,
      invoiceNumber: data.invoiceNumber,
    });
    if (!id) return;
    if (data.invoiceStatus === 'Draft') return;
    confirmSalesInvoice(id);
  };

  const recordInvoicePayment = (
    invoiceId: string,
    amount: number,
    paymentMethod: CustomerPaymentMethod,
    paymentReference: string,
    transactionRef?: string,
    notes?: string
  ) => {
    if (amount <= 0) {
      showToast('error', 'Invalid payment', 'Amount must be greater than zero.');
      return;
    }
    const invoice = salesInvoices.find((i) => i.id === invoiceId);
    if (!invoice || invoice.invoiceStatus === 'Draft' || invoice.invoiceStatus === 'Cancelled') {
      showToast('error', 'Payment blocked', 'Confirm the invoice before recording payments.');
      return;
    }
    if (amount > invoice.remainingBalance + 0.01) {
      showToast('error', 'Exceeds balance', 'Payment cannot exceed remaining invoice balance.');
      return;
    }
    const dup = customerPayments.some(
      (p) => p.paymentReference === paymentReference && p.invoiceId === invoiceId
    );
    if (dup) {
      showToast('error', 'Duplicate payment', 'This payment reference was already recorded.');
      return;
    }
    const updatedReceived = invoice.amountReceived + amount;
    const refreshed = refreshInvoicePaymentFields({ ...invoice, amountReceived: updatedReceived });
    setSalesInvoices((prev) => prev.map((i) => (i.id === invoiceId ? { ...i, ...refreshed, amountReceived: updatedReceived } : i)));
    setCustomerPayments((prev) => [
      {
        id: 'pay-' + Date.now(),
        paymentReference,
        paymentDate: new Date().toISOString().split('T')[0],
        customerId: invoice.customerId,
        customerName: invoice.customerName,
        invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        amount,
        paymentMethod,
        transactionRef,
        notes,
      },
      ...prev,
    ]);
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === invoice.customerId
          ? {
              ...c,
              paymentsReceived: c.paymentsReceived + amount,
              currentBalance: Math.max(0, c.currentBalance - amount),
            }
          : c
      )
    );
    const existingLedger = customerKhata[invoice.customerId] || [];
    const lastRunning = existingLedger.length > 0 ? existingLedger[existingLedger.length - 1].runningBalance : 0;
    setCustomerKhata((prev) => ({
      ...prev,
      [invoice.customerId]: [
        ...existingLedger,
        {
          id: 'k-' + Date.now(),
          date: new Date().toISOString().split('T')[0],
          referenceNo: paymentReference,
          description: `Payment against ${invoice.invoiceNumber} via ${paymentMethod}`,
          type: 'PAYMENT',
          debit: 0,
          credit: amount,
          runningBalance: Math.max(0, lastRunning - amount),
          notes,
        },
      ],
    }));
    const targetType = paymentMethod === 'Cash' ? 'Cash' : 'Bank';
    setAccounts((prev) =>
      prev.map((a) => (a.accountType === targetType ? { ...a, currentBalance: a.currentBalance + amount } : a))
    );
    showToast('success', 'Payment recorded', `Rs. ${amount.toLocaleString()} applied to ${invoice.invoiceNumber}`);
  };

  const saveSalesReturn = (
    payload: Omit<SalesReturn, 'id' | 'status' | 'stockRestored'> & { status?: SalesReturn['status'] }
  ): string => {
    const invoice = salesInvoices.find((i) => i.id === payload.invoiceId);
    if (!invoice || (invoice.invoiceStatus !== 'Confirmed' && invoice.invoiceStatus !== 'Completed')) {
      showToast('error', 'Return blocked', 'Returns require a confirmed invoice.');
      return '';
    }
    for (const item of payload.items) {
      const check = validateReturnQuantity(invoice, item.invoiceItemId, item.qtyReturnedKg, salesReturns);
      if (!check.valid) {
        showToast('error', 'Invalid return qty', check.message);
        return '';
      }
    }
    const id = 'sret-' + Date.now();
    const entry: SalesReturn = {
      ...payload,
      id,
      status: payload.status || 'Draft',
      stockRestored: false,
    };
    setSalesReturns((prev) => [entry, ...prev]);
    showToast('success', 'Return saved', entry.returnReference);
    return id;
  };

  const updateSalesReturnStatus = (returnId: string, status: SalesReturn['status']) => {
    setSalesReturns((prev) => prev.map((r) => (r.id === returnId ? { ...r, status } : r)));
  };

  const completeSalesReturn = (returnId: string) => {
    const ret = salesReturns.find((r) => r.id === returnId);
    if (!ret || ret.status === 'Completed') return;
    const invoice = salesInvoices.find((i) => i.id === ret.invoiceId);
    if (!invoice) return;
    let warehouse = invoice.dispatchWarehouse || 'Finished Goods Hall D';
    setInventory((prev) => {
      let next = prev;
      ret.items.forEach((item) => {
        if (item.condition === 'Saleable') {
          next = postSaleableReturnStock(next, item, warehouse);
        }
      });
      syncWarehouseLoads(next);
      return next;
    });
    const newMovements = ret.items
      .map((item) => buildSalesReturnMovements(ret.returnReference, item, warehouse, currentUser?.name || 'Sales Staff'))
      .filter(Boolean) as StockMovement[];
    if (newMovements.length) setStockMovements((prev) => [...newMovements, ...prev]);
    setSalesInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== ret.invoiceId) return inv;
        const items = inv.items.map((line) => {
          const match = ret.items.find((ri) => ri.invoiceItemId === line.id);
          if (!match) return line;
          return { ...line, returnedQtyKg: (line.returnedQtyKg || 0) + match.qtyReturnedKg };
        });
        const amountReceived = Math.max(0, inv.amountReceived - ret.financialCredit);
        const refreshed = refreshInvoicePaymentFields({ ...inv, items, amountReceived });
        return { ...inv, items, amountReceived, ...refreshed };
      })
    );
    setSalesReturns((prev) =>
      prev.map((r) => (r.id === returnId ? { ...r, status: 'Completed', stockRestored: true } : r))
    );
    showToast('success', 'Return completed', 'Saleable stock restored; damaged items excluded from FG.');
  };

  const updateSalesSettings = (settings: SalesSettings) => {
    setSalesSettings(settings);
    showToast('success', 'Sales settings saved', 'Invoice and tax preferences updated.');
  };

  // 7. Record Customer Payment in Khata
  const recordCustomerPayment = (
    customerId: string,
    amount: number,
    paymentMethod: string,
    referenceNo: string,
    notes?: string
  ) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            paymentsReceived: c.paymentsReceived + amount,
            currentBalance: Math.max(0, c.currentBalance - amount),
          };
        }
        return c;
      })
    );

    const existingLedger = customerKhata[customerId] || [];
    const lastRunning = existingLedger.length > 0 ? existingLedger[existingLedger.length - 1].runningBalance : 0;
    const newRunning = Math.max(0, lastRunning - amount);

    const paymentEntry: KhataEntry = {
      id: 'k-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      referenceNo: referenceNo || 'RCP-' + Date.now().toString().slice(-4),
      description: `Payment received via ${paymentMethod}${notes ? ` - ${notes}` : ''}`,
      type: 'PAYMENT',
      debit: 0,
      credit: amount,
      runningBalance: newRunning,
      notes,
    };

    setCustomerKhata((prev) => ({
      ...prev,
      [customerId]: [...existingLedger, paymentEntry],
    }));

    // Update Cash/Bank
    const targetType = paymentMethod.toLowerCase().includes('cash') ? 'Cash' : 'Bank';
    setAccounts((prev) =>
      prev.map((a) => (a.accountType === targetType ? { ...a, currentBalance: a.currentBalance + amount } : a))
    );

    showToast('success', 'Payment Recorded', `Received Rs. ${amount.toLocaleString()} from ${customer.name}`);
  };

  // 8. Create Purchase Bill
  const createPurchaseBill = (
    data: Omit<PurchaseBill, 'id' | 'remainingPayable' | 'paymentStatus'>
  ) => {
    const remainingPayable = Math.max(0, data.totalAmount - data.paidAmount);
    const paymentStatus: PaymentStatus =
      remainingPayable <= 0 ? 'Paid' : data.paidAmount > 0 ? 'Partial' : 'Unpaid';

    const newBill: PurchaseBill = {
      ...data,
      id: 'pur-' + Date.now(),
      remainingPayable,
      paymentStatus,
    };
    setPurchaseBills((prev) => [newBill, ...prev]);

    // Update supplier payable
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === data.supplierId) {
          return {
            ...s,
            totalPurchases: s.totalPurchases + data.totalAmount,
            paymentsMade: s.paymentsMade + data.paidAmount,
            currentPayable: s.currentPayable + remainingPayable,
          };
        }
        return s;
      })
    );

    // Increase stock in corresponding category!
    let targetCat: 'NEW_BRANDED' | 'WASTE_PLASTIC' | 'FINISHED_GOODS' =
      data.category === 'WASTE_PLASTIC' ? 'WASTE_PLASTIC' : 'NEW_BRANDED';

    const existingMat = inventory.find(
      (i) => i.name.toLowerCase() === data.materialName.toLowerCase() && i.warehouse === data.warehouse
    );

    if (existingMat) {
      setInventory((prev) =>
        prev.map((i) => {
          if (i.id === existingMat.id) {
            const newQty = i.availableKg + data.quantityKg;
            return {
              ...i,
              availableKg: newQty,
              unitCost: data.ratePerKg,
              totalValue: newQty * data.ratePerKg,
              lastUpdated: data.purchaseDate,
            };
          }
          return i;
        })
      );
    } else {
      const newStockItem: InventoryItem = {
        id: 'inv-mat-' + Date.now(),
        name: data.materialName,
        category: targetCat,
        warehouse: data.warehouse,
        availableKg: data.quantityKg,
        reservedKg: 0,
        unitCost: data.ratePerKg,
        totalValue: data.quantityKg * data.ratePerKg,
        supplier: data.supplierName,
        batchNumber: 'PUR-' + Date.now().toString().slice(-4),
        status: 'Healthy',
        reorderLevelKg: 500,
        lastUpdated: data.purchaseDate,
        sourceType: targetCat === 'WASTE_PLASTIC' ? 'PURCHASED' : 'NEW',
      };
      setInventory((prev) => [newStockItem, ...prev]);
    }

    // Deduct cash/bank if payment was made
    if (data.paidAmount > 0) {
      setAccounts((prev) =>
        prev.map((a) => (a.accountType === 'Bank' ? { ...a, currentBalance: a.currentBalance - data.paidAmount } : a))
      );
    }

    showToast(
      'success',
      'Purchase Recorded',
      `Bill ${data.purchaseNumber} recorded: ${data.quantityKg} kg from ${data.supplierName}`
    );
  };

  // 9. Record Supplier Payment
  const recordSupplierPayment = (
    supplierId: string,
    amount: number,
    paymentAccount: string,
    referenceNo: string
  ) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) return;

    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          return {
            ...s,
            paymentsMade: s.paymentsMade + amount,
            currentPayable: Math.max(0, s.currentPayable - amount),
          };
        }
        return s;
      })
    );

    // Deduct Cash or Bank
    setAccounts((prev) =>
      prev.map((a) => {
        if (a.name.toLowerCase().includes(paymentAccount.toLowerCase()) || a.accountType === 'Bank') {
          return { ...a, currentBalance: a.currentBalance - amount };
        }
        return a;
      })
    );

    showToast('success', 'Supplier Payment Done', `Paid Rs. ${amount.toLocaleString()} to ${supplier.name}`);
  };

  // 10. Add Expense
  const addExpense = (data: Omit<ExpenseRecord, 'id' | 'voucherNumber'>) => {
    const newExp: ExpenseRecord = {
      ...data,
      id: 'exp-' + Date.now(),
      voucherNumber: 'EXP-' + Date.now().toString().slice(-5),
    };
    setExpenses((prev) => [newExp, ...prev]);

    if (data.status === 'Paid') {
      const targetType = data.paymentMethod === 'Cash' ? 'Cash' : 'Bank';
      setAccounts((prev) =>
        prev.map((a) => (a.accountType === targetType ? { ...a, currentBalance: a.currentBalance - data.amount } : a))
      );
    }
    showToast('success', 'Expense Recorded', `${data.category}: Rs. ${data.amount.toLocaleString()} (${data.payee})`);
  };

  // 11. Pay Salary & Handle Advance (BR-016 compliant)
  const paySalary = (data: Omit<SalaryPayment, 'id' | 'salaryId' | 'status'>) => {
    const newPayment: SalaryPayment = {
      ...data,
      id: 'sal-' + Date.now(),
      salaryId: 'SAL-' + Date.now().toString().slice(-4),
      status: 'Paid',
    };
    setSalaryPayments((prev) => [newPayment, ...prev]);

    // If advance was deducted, reduce employee's active advance balance!
    if (data.advanceDeduction > 0) {
      setEmployees((prev) =>
        prev.map((e) => {
          if (e.id === data.employeeId) {
            return {
              ...e,
              activeAdvances: Math.max(0, e.activeAdvances - data.advanceDeduction),
            };
          }
          return e;
        })
      );
    }

    // Deduct paidAmount from bank/cash
    setAccounts((prev) =>
      prev.map((a) =>
        a.name === data.paymentAccount || a.accountType === 'Bank'
          ? { ...a, currentBalance: a.currentBalance - data.paidAmount }
          : a
      )
    );

    showToast('success', 'Salary Disbursed', `Paid Rs. ${data.paidAmount.toLocaleString()} to ${data.employeeName}`);
  };

  // 12. Record Advance
  const recordAdvance = (employeeId: string, amount: number) => {
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === employeeId) {
          return {
            ...e,
            activeAdvances: e.activeAdvances + amount,
          };
        }
        return e;
      })
    );

    // Paid out of factory cash safe
    setAccounts((prev) =>
      prev.map((a) => (a.accountType === 'Cash' ? { ...a, currentBalance: a.currentBalance - amount } : a))
    );

    const emp = employees.find((e) => e.id === employeeId);
    showToast('info', 'Salary Advance Issued', `Disbursed Rs. ${amount.toLocaleString()} advance to ${emp?.name}`);
  };

  // 13. Cash-Bank Transfer (BR-014 compliant: no income/expense!)
  const transferCashBank = (
    fromAccId: string,
    toAccId: string,
    amount: number,
    reference: string,
    memo: string
  ) => {
    const fromAcc = accounts.find((a) => a.id === fromAccId);
    const toAcc = accounts.find((a) => a.id === toAccId);
    if (!fromAcc || !toAcc) return;

    if (fromAcc.currentBalance < amount) {
      showToast('error', 'Transfer Failed', 'Insufficient funds in source account');
      return;
    }

    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id === fromAccId) return { ...a, currentBalance: a.currentBalance - amount };
        if (a.id === toAccId) return { ...a, currentBalance: a.currentBalance + amount };
        return a;
      })
    );

    const outTx: BankTransaction = {
      id: 'bt-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      accountId: fromAccId,
      accountName: fromAcc.name,
      type: 'TRANSFER_OUT',
      amount: amount,
      referenceNo: reference || 'TRF-' + Date.now().toString().slice(-4),
      description: memo || `Transfer to ${toAcc.name}`,
      counterAccountName: toAcc.name,
      runningBalance: fromAcc.currentBalance - amount,
    };

    const inTx: BankTransaction = {
      id: 'bt-' + (Date.now() + 1),
      date: new Date().toISOString().split('T')[0],
      accountId: toAccId,
      accountName: toAcc.name,
      type: 'TRANSFER_IN',
      amount: amount,
      referenceNo: reference || 'TRF-' + Date.now().toString().slice(-4),
      description: memo || `Transfer from ${fromAcc.name}`,
      counterAccountName: fromAcc.name,
      runningBalance: toAcc.currentBalance + amount,
    };

    setBankTransactions((prev) => [inTx, outTx, ...prev]);
    showToast(
      'success',
      'Inter-Account Transfer Done',
      `Transferred Rs. ${amount.toLocaleString()} from ${fromAcc.name} to ${toAcc.name}`
    );
  };

  // 14. Add Recycling Output Type
  const addRecyclingOutputType = (name: string, description: string) => {
    const newType: RecyclingOutputTypeMaster = {
      id: 'rot-' + Date.now(),
      name,
      code: 'R-' + name.substring(0, 4).toUpperCase(),
      defaultUnit: 'kg',
      description,
      active: true,
    };
    setRecyclingOutputTypes((prev) => [...prev, newType]);
    showToast('success', 'Recycling Output Type Added', `${name} is now available in recycling batches`);
  };

  return (
    <ERPContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        currentView,
        setCurrentView,
        selectedEntityId,
        setSelectedEntityId,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        searchQuery,
        setSearchQuery,
        inventory,
        stockMovements,
        productionBatches,
        productionPlans,
        productionOrders,
        productionSettings,
        productionMachines,
        productionOperators,
        recyclingBatches,
        salesInvoices,
        customerPayments,
        salesReturns,
        salesSettings,
        purchaseBills,
        customers,
        suppliers,
        customerKhata,
        expenses,
        employees,
        salaryPayments,
        loans,
        accounts,
        bankTransactions,
        documents,
        recyclingOutputTypes,
        recyclingSettings,
        processingMachines,
        recyclingOperators,
        warehouses,
        inventoryModuleSettings,
        stockAdjustmentRecords,
        stockTransferRecords,
        toasts,
        showToast,
        removeToast,
        addStock,
        receiveStock,
        issueStock,
        adjustStock,
        transferStock,
        setWarehouseStatus,
        updateInventoryModuleSettings,
        createProductionBatch,
        saveProductionBatchDraft,
        updateProductionBatchDraft,
        startProductionBatch,
        completeProductionBatch,
        completeProductionFromInput,
        cancelProductionBatch,
        upsertProductionPlan,
        updateProductionPlanStatus,
        upsertProductionOrder,
        updateProductionOrderStatus,
        convertPlanToBatch,
        convertOrderToBatch,
        updateProductionSettings,
        upsertProductionMachine,
        upsertProductionOperator,
        createRecyclingBatch,
        saveRecyclingBatchDraft,
        updateRecyclingBatchDraft,
        startRecyclingBatch,
        completeRecyclingBatch,
        cancelRecyclingBatch,
        updateRecyclingSettings,
        upsertProcessingMachine,
        upsertRecyclingOperator,
        toggleRecyclingOutputType,
        createSalesInvoice,
        saveSalesInvoiceDraft,
        updateSalesInvoiceDraft,
        confirmSalesInvoice,
        cancelSalesInvoice,
        recordInvoicePayment,
        saveSalesReturn,
        updateSalesReturnStatus,
        completeSalesReturn,
        updateSalesSettings,
        recordCustomerPayment,
        createPurchaseBill,
        recordSupplierPayment,
        addExpense,
        paySalary,
        recordAdvance,
        transferCashBank,
        addRecyclingOutputType,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
}

export function useERP() {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
}
