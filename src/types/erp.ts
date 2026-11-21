export type UserRole = 'owner_admin' | 'accountant' | 'production_mgr' | 'inventory_mgr' | 'sales_staff';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department: string;
}

// 1. Inventory Types
export type InventoryCategory = 'NEW_BRANDED' | 'WASTE_PLASTIC' | 'RECYCLED_RAW' | 'FINISHED_GOODS';
export type StockStatus = 'Healthy' | 'Low Stock' | 'Critical';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  warehouse: string;
  availableKg: number;
  reservedKg: number;
  unitCost: number; // PKR / kg
  totalValue: number; // PKR
  supplier?: string;
  batchNumber: string;
  status: StockStatus;
  reorderLevelKg: number;
  lastUpdated: string;
  sourceType?: 'NEW' | 'RECYCLED' | 'PURCHASED';
  color?: string;
  grade?: string;
}

export interface StockMovement {
  id: string;
  date: string;
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT' | 'PRODUCTION_CONSUME' | 'PRODUCTION_OUTPUT' | 'RECYCLING_CONSUME' | 'RECYCLING_OUTPUT';
  itemId: string;
  itemName: string;
  batchNumber: string;
  warehouse: string;
  qtyKg: number;
  unitCost: number;
  totalCost: number;
  referenceNo: string;
  operator: string;
  notes?: string;
}

// 2. Production Types
export type ProductionSource = 'NEW' | 'RECYCLED';
export type ProductionStatus = 'Completed' | 'In Progress' | 'Planned';

export interface ProductionBatch {
  id: string;
  batchNumber: string; // e.g. PRD-2026-089
  productName: 'ABHA' | 'Crystal' | string;
  color: string;
  materialSource: ProductionSource; // STRICT: Only NEW or RECYCLED
  rawMaterialName: string;
  rawMaterialBatchId: string;
  rawMaterialQtyKg: number;
  finishedGoodsOutputKg: number;
  processingLossKg: number; // rawMaterialQtyKg - finishedGoodsOutputKg
  yieldPercentage: number;
  productionDate: string;
  laborCost: number;
  electricityCost: number;
  machineCost: number;
  otherCosts: number;
  totalCost: number;
  costPerKg: number;
  operator: string;
  status: ProductionStatus;
  notes?: string;
  outputBatchNumber: string;
}

// 3. Recycling Types
export interface RecyclingBatch {
  id: string;
  batchNumber: string; // e.g. REC-2026-042
  wasteInputBatchId: string;
  wasteInputName: string;
  inputWasteQtyKg: number;
  wasteCostPerKg: number;
  outputMaterialType: string; // CONFIGURABLE! Not hard-coded to granules
  outputQtyKg: number;
  processingLossKg: number;
  yieldPercentage: number; // (outputQtyKg / inputWasteQtyKg) * 100
  laborCost: number;
  electricityCost: number;
  machineCost: number;
  otherCosts: number;
  totalProcessingCost: number;
  totalBatchCost: number; // waste cost + processing cost
  costPerKg: number; // totalBatchCost / outputQtyKg
  processingDate: string;
  operator: string;
  status: 'Completed' | 'In Progress';
  notes?: string;
  destinationWarehouse: string;
}

// 4. Sales & Invoicing Types
export type PaymentStatus = 'Paid' | 'Partial' | 'Unpaid';

export interface SalesInvoiceItem {
  id: string;
  productName: string;
  color: string;
  qtyKg: number;
  ratePerKg: number;
  totalAmount: number;
  batchNumber?: string;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string; // e.g. INV-1048
  customerId: string;
  customerName: string;
  saleDate: string;
  items: SalesInvoiceItem[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  amountReceived: number;
  remainingBalance: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: 'Cash' | 'Bank Transfer' | 'Cheque';
  dueDate: string;
  notes?: string;
}

// 5. Purchases Types
export interface PurchaseBill {
  id: string;
  purchaseNumber: string; // e.g. PUR-304
  supplierId: string;
  supplierName: string;
  category: 'NEW_BRANDED' | 'WASTE_PLASTIC' | 'SUPPLIES';
  materialName: string;
  quantityKg: number;
  ratePerKg: number;
  totalAmount: number;
  paidAmount: number;
  remainingPayable: number;
  paymentStatus: PaymentStatus;
  purchaseDate: string;
  dueDate: string;
  warehouse: string;
  documentRef?: string;
  notes?: string;
}

// 6. Customer & Supplier Khata (Ledger)
export interface KhataEntry {
  id: string;
  date: string;
  referenceNo: string;
  description: string;
  type: 'INVOICE' | 'PAYMENT' | 'RETURN' | 'OPENING_BALANCE' | 'ADJUSTMENT';
  debit: number; // Invoiced / Given
  credit: number; // Paid / Received
  runningBalance: number;
  notes?: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  companyName: string;
  phone: string;
  city: string;
  address: string;
  creditLimit: number;
  openingBalance: number;
  totalSales: number;
  paymentsReceived: number;
  currentBalance: number; // Net receivable: customer owes us
  status: 'Active' | 'Inactive';
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  city: string;
  address: string;
  category: 'New Raw Material' | 'Waste Plastic' | 'Chemicals & Dyes' | 'Factory Supplies';
  openingBalance: number;
  totalPurchases: number;
  paymentsMade: number;
  currentPayable: number; // Net payable: we owe supplier
  status: 'Active' | 'Inactive';
}

// 7. Expenses
export type ExpenseCategory =
  | 'Electricity'
  | 'Labor'
  | 'Transport'
  | 'Maintenance'
  | 'Rent'
  | 'Internet'
  | 'Kitchen'
  | 'Office'
  | 'Other';

export interface ExpenseRecord {
  id: string;
  voucherNumber: string;
  date: string;
  category: ExpenseCategory;
  payee: string;
  description: string;
  amount: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Cheque';
  status: 'Paid' | 'Unpaid' | 'Pending Approval';
  costCenter: string;
  receiptAttached: boolean;
  enteredBy: string;
}

// 8. Employees & Payroll
export interface Employee {
  id: string;
  code: string;
  name: string;
  phone: string;
  role: string;
  department: 'Extrusion' | 'Cutting & Sealing' | 'Recycling' | 'Warehousing' | 'Office';
  wageType: 'Monthly Salary' | 'Daily Wage';
  baseRate: number; // Monthly salary or daily rate in PKR
  joiningDate: string;
  activeAdvances: number; // Unsettled salary advance
  status: 'Active' | 'On Leave' | 'Terminated';
}

export interface SalaryPayment {
  id: string;
  salaryId: string;
  employeeId: string;
  employeeName: string;
  period: string; // e.g. "October 2026"
  basePay: number;
  overtime: number;
  advanceDeduction: number;
  otherDeductions: number;
  netPayable: number;
  paidAmount: number;
  paymentDate: string;
  status: 'Paid' | 'Partial' | 'Pending';
  paymentAccount: string;
}

// 9. Loans
export interface LoanRecord {
  id: string;
  loanNumber: string;
  type: 'TAKEN' | 'GIVEN'; // TAKEN = Liability to factory; GIVEN = Asset / Receivable
  counterparty: string;
  principal: number;
  repaidAmount: number;
  outstandingBalance: number;
  startDate: string;
  dueDate: string;
  interestRatePct: number; // 0 for interest-free loans
  status: 'Active' | 'Settled';
  purpose: string;
}

// 10. Cash & Bank Accounts
export interface CashBankAccount {
  id: string;
  name: string;
  accountType: 'Cash' | 'Bank' | 'Mobile Wallet';
  accountNumber?: string;
  bankName?: string;
  currentBalance: number;
  openingBalance: number;
  status: 'Active' | 'Inactive';
}

export interface BankTransaction {
  id: string;
  date: string;
  accountId: string;
  accountName: string;
  type: 'RECEIPT' | 'PAYMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT';
  amount: number;
  referenceNo: string;
  description: string;
  counterAccountName?: string;
  runningBalance: number;
}

// 11. Documents
export interface FactoryDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  category: 'Purchase Bill' | 'Sales Invoice' | 'Delivery Challan' | 'Utility Bill' | 'Contract' | 'Bank Slip';
  linkedEntity: string;
  uploadDate: string;
  uploadedBy: string;
}

// 12. Settings / Master Data
export interface RecyclingOutputTypeMaster {
  id: string;
  name: string;
  code: string;
  defaultUnit: string;
  description: string;
  active: boolean;
}

export interface ProductMaster {
  id: string;
  family: 'ABHA' | 'Crystal' | string;
  variants: {
    id: string;
    color: string;
    size: string;
    thicknessMicrons: number;
    active: boolean;
  }[];
}

// Phase 2 — Inventory & warehouse module
export interface WarehouseMaster {
  id: string;
  code: string;
  name: string;
  categoryFocus: InventoryCategory | 'MIXED';
  location: string;
  capacityKg: number;
  currentLoadKg: number;
  manager: string;
  status: 'Active' | 'Inactive';
}

export interface StockAdjustmentRecord {
  id: string;
  date: string;
  itemId: string;
  itemName: string;
  warehouse: string;
  previousQtyKg: number;
  newQtyKg: number;
  deltaKg: number;
  reason: string;
  referenceNo: string;
  operator: string;
}

export interface StockTransferRecord {
  id: string;
  date: string;
  itemId: string;
  itemName: string;
  batchNumber: string;
  fromWarehouse: string;
  toWarehouse: string;
  qtyKg: number;
  unitCost: number;
  referenceNo: string;
  operator: string;
  status: 'Completed' | 'Cancelled';
}

export interface InventoryModuleSettings {
  brands: string[];
  colors: string[];
  reorderLevelsKg: Record<InventoryCategory, number>;
}
