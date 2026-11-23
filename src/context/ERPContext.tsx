'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  InventoryItem,
  StockMovement,
  ProductionBatch,
  RecyclingBatch,
  SalesInvoice,
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
  recyclingBatches: RecyclingBatch[];
  salesInvoices: SalesInvoice[];
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
  createSalesInvoice: (invoiceData: Omit<SalesInvoice, 'id' | 'remainingBalance' | 'paymentStatus'>) => void;
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
  const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>(INITIAL_PRODUCTION_BATCHES);
  const [recyclingBatches, setRecyclingBatches] = useState<RecyclingBatch[]>(INITIAL_RECYCLING_BATCHES);
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>(INITIAL_SALES_INVOICES);
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

  // 4. Create Production Batch (STRICT SEPARATION: Only NEW or RECYCLED)
  const createProductionBatch = (
    data: Omit<ProductionBatch, 'id' | 'processingLossKg' | 'yieldPercentage' | 'totalCost' | 'costPerKg'>
  ) => {
    // Validate source stock
    const rawItem = inventory.find((i) => i.id === data.rawMaterialBatchId);
    if (!rawItem) {
      showToast('error', 'Invalid Material', 'Selected raw material batch not found');
      return;
    }
    if (rawItem.availableKg < data.rawMaterialQtyKg) {
      showToast('error', 'Insufficient Stock', `Only ${rawItem.availableKg} kg available in stock`);
      return;
    }

    // STRICT: check that rawItem category aligns with materialSource
    if (data.materialSource === 'NEW' && rawItem.category !== 'NEW_BRANDED') {
      showToast('error', 'Source Violation', 'NEW source batch must only use New Branded Raw Material');
      return;
    }
    if (data.materialSource === 'RECYCLED' && rawItem.category !== 'RECYCLED_RAW') {
      showToast('error', 'Source Violation', 'RECYCLED source batch must only use Recycled Raw Material');
      return;
    }

    const lossKg = Math.max(0, data.rawMaterialQtyKg - data.finishedGoodsOutputKg);
    const yieldPct = Number(((data.finishedGoodsOutputKg / data.rawMaterialQtyKg) * 100).toFixed(2));
    const materialCost = data.rawMaterialQtyKg * rawItem.unitCost;
    const conversionCosts = data.laborCost + data.electricityCost + data.machineCost + data.otherCosts;
    const totalCost = materialCost + conversionCosts;
    const costPerKg = Number((totalCost / data.finishedGoodsOutputKg).toFixed(2));

    const newBatch: ProductionBatch = {
      ...data,
      id: 'prd-' + Date.now(),
      processingLossKg: lossKg,
      yieldPercentage: yieldPct,
      totalCost: totalCost,
      costPerKg: costPerKg,
    };
    setProductionBatches((prev) => [newBatch, ...prev]);

    // Deduct raw material stock
    setInventory((prev) =>
      prev.map((i) => {
        if (i.id === rawItem.id) {
          const remaining = i.availableKg - data.rawMaterialQtyKg;
          return {
            ...i,
            availableKg: remaining,
            totalValue: remaining * i.unitCost,
          };
        }
        return i;
      })
    );

    // Add Finished Goods Stock
    const finishedItemName = `${data.productName} ${data.color} Shopping Bags`;
    const existingFG = inventory.find(
      (i) => i.category === 'FINISHED_GOODS' && i.name.toLowerCase().includes(data.productName.toLowerCase()) && i.color === data.color
    );

    if (existingFG) {
      setInventory((prev) =>
        prev.map((i) => {
          if (i.id === existingFG.id) {
            const newQty = i.availableKg + data.finishedGoodsOutputKg;
            return {
              ...i,
              availableKg: newQty,
              totalValue: newQty * costPerKg,
              unitCost: costPerKg,
              lastUpdated: new Date().toISOString().split('T')[0],
              batchNumber: data.outputBatchNumber,
            };
          }
          return i;
        })
      );
    } else {
      const newFG: InventoryItem = {
        id: 'inv-fg-' + Date.now(),
        name: finishedItemName,
        category: 'FINISHED_GOODS',
        warehouse: 'Finished Goods Hall D',
        availableKg: data.finishedGoodsOutputKg,
        reservedKg: 0,
        unitCost: costPerKg,
        totalValue: data.finishedGoodsOutputKg * costPerKg,
        batchNumber: data.outputBatchNumber,
        status: 'Healthy',
        reorderLevelKg: 400,
        lastUpdated: new Date().toISOString().split('T')[0],
        sourceType: data.materialSource,
        color: data.color,
      };
      setInventory((prev) => [newFG, ...prev]);
    }

    // Log Stock movements
    const consumeMovement: StockMovement = {
      id: 'sm-' + Date.now(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'PRODUCTION_CONSUME',
      itemId: rawItem.id,
      itemName: rawItem.name,
      batchNumber: rawItem.batchNumber,
      warehouse: rawItem.warehouse,
      qtyKg: data.rawMaterialQtyKg,
      unitCost: rawItem.unitCost,
      totalCost: materialCost,
      referenceNo: data.batchNumber,
      operator: data.operator,
      notes: `Consumed for batch ${data.batchNumber} (${data.materialSource} source)`,
    };
    const outputMovement: StockMovement = {
      id: 'sm-' + (Date.now() + 1),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'PRODUCTION_OUTPUT',
      itemId: existingFG ? existingFG.id : 'inv-fg-new',
      itemName: finishedItemName,
      batchNumber: data.outputBatchNumber,
      warehouse: 'Finished Goods Hall D',
      qtyKg: data.finishedGoodsOutputKg,
      unitCost: costPerKg,
      totalCost: totalCost,
      referenceNo: data.batchNumber,
      operator: data.operator,
      notes: `Finished goods manufactured: ${data.finishedGoodsOutputKg} kg`,
    };
    setStockMovements((prev) => [outputMovement, consumeMovement, ...prev]);

    showToast(
      'success',
      'Production Batch Created',
      `Batch ${data.batchNumber} completed. Output: ${data.finishedGoodsOutputKg} kg at Rs. ${costPerKg}/kg`
    );
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

  // 6. Create Sales Invoice (Updates Khata, Cash/Bank, and Stock)
  const createSalesInvoice = (
    data: Omit<SalesInvoice, 'id' | 'remainingBalance' | 'paymentStatus'>
  ) => {
    const remainingBalance = Math.max(0, data.grandTotal - data.amountReceived);
    const paymentStatus: PaymentStatus =
      remainingBalance <= 0 ? 'Paid' : data.amountReceived > 0 ? 'Partial' : 'Unpaid';

    const newInvoice: SalesInvoice = {
      ...data,
      id: 'inv-' + Date.now(),
      remainingBalance,
      paymentStatus,
    };
    setSalesInvoices((prev) => [newInvoice, ...prev]);

    // Update Customer Khata
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === data.customerId) {
          return {
            ...c,
            totalSales: c.totalSales + data.grandTotal,
            paymentsReceived: c.paymentsReceived + data.amountReceived,
            currentBalance: c.currentBalance + remainingBalance,
          };
        }
        return c;
      })
    );

    // Add Khata Entries
    const existingLedger = customerKhata[data.customerId] || [];
    const lastRunning = existingLedger.length > 0 ? existingLedger[existingLedger.length - 1].runningBalance : 0;
    const invoiceDebit = lastRunning + data.grandTotal;

    const invoiceEntry: KhataEntry = {
      id: 'k-' + Date.now(),
      date: data.saleDate,
      referenceNo: data.invoiceNumber,
      description: `Sales Invoice ${data.invoiceNumber} - ${data.items.map((i) => `${i.productName} (${i.qtyKg}kg)`).join(', ')}`,
      type: 'INVOICE',
      debit: data.grandTotal,
      credit: 0,
      runningBalance: invoiceDebit,
    };

    let updatedLedger = [...existingLedger, invoiceEntry];

    if (data.amountReceived > 0) {
      const paymentEntry: KhataEntry = {
        id: 'k-' + (Date.now() + 1),
        date: data.saleDate,
        referenceNo: 'RCP-' + data.invoiceNumber,
        description: `Payment received against ${data.invoiceNumber} (${data.paymentMethod || 'Cash'})`,
        type: 'PAYMENT',
        debit: 0,
        credit: data.amountReceived,
        runningBalance: invoiceDebit - data.amountReceived,
      };
      updatedLedger.push(paymentEntry);

      // Increase Cash or Bank Account
      if (data.paymentMethod === 'Cash') {
        setAccounts((prev) =>
          prev.map((a) => (a.accountType === 'Cash' ? { ...a, currentBalance: a.currentBalance + data.amountReceived } : a))
        );
      } else {
        setAccounts((prev) =>
          prev.map((a) => (a.accountType === 'Bank' ? { ...a, currentBalance: a.currentBalance + data.amountReceived } : a))
        );
      }
    }

    setCustomerKhata((prev) => ({
      ...prev,
      [data.customerId]: updatedLedger,
    }));

    // Deduct Finished Goods Stock
    data.items.forEach((item) => {
      setInventory((prev) =>
        prev.map((inv) => {
          if (inv.category === 'FINISHED_GOODS' && inv.name.includes(item.productName)) {
            const rem = Math.max(0, inv.availableKg - item.qtyKg);
            return {
              ...inv,
              availableKg: rem,
              totalValue: rem * inv.unitCost,
            };
          }
          return inv;
        })
      );

      // Stock movement out
      const outMv: StockMovement = {
        id: 'sm-' + Math.random().toString(36).substr(2, 9),
        date: data.saleDate + ' 10:00',
        type: 'OUT',
        itemId: 'fg-item',
        itemName: item.productName,
        batchNumber: item.batchNumber || 'FG-DISP',
        warehouse: 'Finished Goods Hall D',
        qtyKg: item.qtyKg,
        unitCost: item.ratePerKg,
        totalCost: item.totalAmount,
        referenceNo: data.invoiceNumber,
        operator: currentUser?.name || 'Sales Staff',
        notes: `Dispatched to ${data.customerName}`,
      };
      setStockMovements((prev) => [outMv, ...prev]);
    });

    showToast(
      'success',
      'Sales Invoice Created',
      `Invoice ${data.invoiceNumber} recorded for Rs. ${data.grandTotal.toLocaleString()}. Balance: Rs. ${remainingBalance.toLocaleString()}`
    );
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
        recyclingBatches,
        salesInvoices,
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
