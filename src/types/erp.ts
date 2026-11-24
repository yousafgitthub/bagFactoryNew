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
  type:
    | 'IN'
    | 'OUT'
    | 'TRANSFER'
    | 'ADJUSTMENT'
    | 'PRODUCTION_CONSUME'
    | 'PRODUCTION_OUTPUT'
    | 'RECYCLING_CONSUME'
    | 'RECYCLING_OUTPUT'
    | 'SALES_DISPATCH'
    | 'SALES_RETURN'
    | 'SALES_CANCEL_RESTORE'
    | 'PURCHASE_RECEIVE'
    | 'PURCHASE_RETURN';
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
/** @deprecated Use ProductionBatchStatus */
export type ProductionStatus = ProductionBatchStatus | 'Planned';
export type ProductionBatchStatus = 'Draft' | 'In Progress' | 'Completed' | 'Cancelled';
export type ProductionPlanStatus = 'Draft' | 'Planned' | 'Approved' | 'In Progress' | 'Completed' | 'Cancelled';
export type ProductionOrderStatus = 'Draft' | 'Approved' | 'In Progress' | 'Completed' | 'Cancelled';
export type ProductionPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export interface ProductionBatchTimelineEvent {
  id: string;
  at: string;
  label: string;
  detail?: string;
}

export interface ProductionMachine {
  id: string;
  code: string;
  name: string;
  line: string;
  status: 'Active' | 'Inactive';
}

export interface ProductionOperator {
  id: string;
  name: string;
  employeeRef?: string;
  status: 'Active' | 'Inactive';
}

export interface ProductionSettings {
  batchNumberPrefix: string;
  batchNumberNextSeq: number;
  orderNumberPrefix: string;
  orderNumberNextSeq: number;
  planNumberPrefix: string;
  planNumberNextSeq: number;
  defaultUnit: 'kg';
  lossWarningThresholdPct: number;
  yieldTargetPct: number;
  brands: string[];
  colors: string[];
  productVariants: { id: string; brand: string; productName: string; color: string; code: string }[];
  shifts: string[];
}

export interface ProductionPlan {
  id: string;
  planNumber: string;
  planningDate: string;
  plannedProductionDate: string;
  brand: string;
  productName: string;
  color: string;
  plannedOutputQtyKg: number;
  materialSource: ProductionSource;
  requiredRawMaterialQtyKg: number;
  targetYieldPct: number;
  priority: ProductionPriority;
  assignedOperator: string;
  status: ProductionPlanStatus;
  notes?: string;
  linkedBatchId?: string;
  cancelReason?: string;
}

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  plannedProductionDate: string;
  brand: string;
  productName: string;
  color: string;
  plannedQtyKg: number;
  materialSource: ProductionSource;
  priority: ProductionPriority;
  status: ProductionOrderStatus;
  notes?: string;
  linkedBatchIds: string[];
  cancelReason?: string;
}

export interface ProductionBatch {
  id: string;
  batchNumber: string;
  /** Brand line (ABHA / Crystal) — legacy field name `productName` */
  productName: 'ABHA' | 'Crystal' | string;
  color: string;
  productVariant?: string;
  materialSource: ProductionSource;
  rawMaterialName: string;
  rawMaterialBatchId: string;
  inputWarehouse: string;
  rawMaterialQtyKg: number;
  plannedInputQtyKg?: number;
  rawMaterialCostPerKg: number;
  finishedGoodsOutputKg: number;
  rejectedOutputKg: number;
  reusableByproductKg: number;
  processingLossKg: number;
  yieldPercentage: number;
  productionDate: string;
  laborCost: number;
  electricityCost: number;
  machineCost: number;
  maintenanceCost: number;
  packagingCost: number;
  transportCost: number;
  otherCosts: number;
  totalCost: number;
  costPerKg: number;
  operator: string;
  machineId?: string;
  machineName?: string;
  shift?: string;
  status: ProductionBatchStatus;
  notes?: string;
  outputBatchNumber: string;
  finishedGoodsWarehouse: string;
  productionOrderRef?: string;
  productionPlanRef?: string;
  rawStockDeducted: boolean;
  finishedStockPosted: boolean;
  timeline: ProductionBatchTimelineEvent[];
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

// 3. Recycling Types
export type RecyclingBatchStatus = 'Draft' | 'In Progress' | 'Completed' | 'Cancelled';

export interface RecyclingOutputLine {
  id: string;
  materialName: string;
  outputTypeId?: string;
  outputQtyKg: number;
  outputWarehouse: string;
  allocatedCost: number;
  costPerKg: number;
  notes?: string;
}

export interface RecyclingBatchTimelineEvent {
  id: string;
  at: string;
  label: string;
  detail?: string;
}

export interface ProcessingMachine {
  id: string;
  code: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface RecyclingOperator {
  id: string;
  name: string;
  employeeRef?: string;
  status: 'Active' | 'Inactive';
}

export interface RecyclingSettings {
  batchNumberPrefix: string;
  batchNumberNextSeq: number;
  lossWarningThresholdPct: number;
  costCategories: string[];
}

export interface RecyclingBatch {
  id: string;
  batchNumber: string; // e.g. REC-2026-0001
  batchName?: string;
  wasteInputBatchId: string;
  wasteInputName: string;
  inputWarehouse: string;
  inputWasteQtyKg: number;
  wasteCostPerKg: number;
  /** Primary / legacy single-output fields — kept in sync with `outputs` aggregates */
  outputMaterialType: string;
  outputQtyKg: number;
  outputs: RecyclingOutputLine[];
  processingLossKg: number;
  yieldPercentage: number;
  laborCost: number;
  electricityCost: number;
  machineCost: number;
  transportCost: number;
  maintenanceCost: number;
  otherCosts: number;
  totalProcessingCost: number;
  totalBatchCost: number;
  costPerKg: number;
  processingDate: string;
  operator: string;
  machineId?: string;
  machineName?: string;
  status: RecyclingBatchStatus;
  notes?: string;
  destinationWarehouse: string;
  wasteStockDeducted: boolean;
  outputStockPosted: boolean;
  timeline: RecyclingBatchTimelineEvent[];
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

// 4. Sales & Invoicing Types
export type PaymentStatus = 'Paid' | 'Partial' | 'Unpaid' | 'Overdue';
export type SalesPaymentStatus = PaymentStatus;
export type InvoiceStatus = 'Draft' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Returned';
export type DiscountType = 'Fixed' | 'Percent';
export type SalesReturnStatus = 'Draft' | 'Pending Inspection' | 'Approved' | 'Rejected' | 'Completed';
export type ReturnCondition = 'Saleable' | 'Damaged' | 'Rejected';

export interface SalesInvoiceItem {
  id: string;
  inventoryItemId?: string;
  productName: string;
  brand: string;
  color: string;
  qtyKg: number;
  ratePerKg: number;
  totalAmount: number;
  batchNumber?: string;
  productionBatchRef?: string;
  returnedQtyKg?: number;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-0001
  customerId: string;
  customerName: string;
  customerPhone?: string;
  saleDate: string;
  dueDate: string;
  items: SalesInvoiceItem[];
  subtotal: number;
  discountType: DiscountType;
  discount: number;
  discountPercent?: number;
  taxAmount: number;
  grandTotal: number;
  amountReceived: number;
  remainingBalance: number;
  invoiceStatus: InvoiceStatus;
  paymentStatus: SalesPaymentStatus;
  stockDeducted: boolean;
  dispatchWarehouse?: string;
  salesperson?: string;
  paymentMethod?: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Other';
  notes?: string;
  cancelReason?: string;
  cancelledAt?: string;
  confirmedAt?: string;
}

export type CustomerPaymentMethod = 'Cash' | 'Bank Transfer' | 'Cheque' | 'Other';

export interface CustomerPayment {
  id: string;
  paymentReference: string;
  paymentDate: string;
  customerId: string;
  customerName: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  paymentMethod: CustomerPaymentMethod;
  accountRef?: string;
  transactionRef?: string;
  notes?: string;
}

export interface SalesReturnItem {
  id: string;
  invoiceItemId: string;
  inventoryItemId?: string;
  productName: string;
  brand: string;
  color: string;
  qtyReturnedKg: number;
  condition: ReturnCondition;
  batchNumber?: string;
}

export interface SalesReturn {
  id: string;
  returnReference: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  returnDate: string;
  items: SalesReturnItem[];
  reason: string;
  notes?: string;
  status: SalesReturnStatus;
  stockRestored: boolean;
  financialCredit: number;
}

export interface SalesSettings {
  invoiceNumberPrefix: string;
  invoiceNumberNextSeq: number;
  defaultPaymentTermsDays: number;
  defaultCurrency: 'PKR';
  defaultUnit: 'kg';
  discountEnabled: boolean;
  taxEnabled: boolean;
  taxRatePct: number;
  invoiceFooter: string;
  factoryName: string;
  factoryAddress: string;
  factoryPhone: string;
  paymentMethods: CustomerPaymentMethod[];
  returnPolicyNote: string;
  brands: string[];
  colors: string[];
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

export type SupplierCategory =
  | 'New Raw Material Supplier'
  | 'Waste Plastic Supplier'
  | 'Spare Parts Supplier'
  | 'Other Supplier'
  | 'New Raw Material'
  | 'Waste Plastic'
  | 'Chemicals & Dyes'
  | 'Factory Supplies';

export type PurchaseCategory =
  | 'NEW_RAW_MATERIAL'
  | 'WASTE_PLASTIC'
  | 'SPARE_PARTS'
  | 'PACKAGING'
  | 'OTHER';

export type PurchaseDocumentStatus = 'Draft' | 'Ordered' | 'Partially Received' | 'Received' | 'Cancelled';
export type PurchasePaymentStatus = 'Unpaid' | 'Partial' | 'Paid' | 'Overdue';
export type PurchaseReturnStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Completed' | 'Rejected';
export type SupplierPaymentMethod = 'Cash' | 'Bank Transfer' | 'Cheque' | 'Other';

export interface PurchaseItem {
  id: string;
  itemName: string;
  inventoryCategory?: InventoryCategory;
  materialType?: string;
  brand?: string;
  orderedQty: number;
  receivedQty: number;
  ratePerUnit: number;
  unit: 'kg' | 'pcs' | 'lot';
  lineTotal: number;
  inventoryItemId?: string;
  notes?: string;
}

export interface PurchaseAttachment {
  id: string;
  fileName: string;
  fileSize: string;
  label: string;
  uploadDate: string;
  previewNote: string;
}

export interface PurchaseOrder {
  id: string;
  purchaseNumber: string;
  purchaseDate: string;
  supplierId: string;
  supplierName: string;
  supplierInvoiceNumber?: string;
  purchaseCategory: PurchaseCategory;
  warehouse: string;
  paymentDueDate: string;
  notes?: string;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  discountType?: DiscountType;
  additionalCharges: number;
  taxAmount: number;
  netTotal: number;
  amountPaid: number;
  remainingPayable: number;
  documentStatus: PurchaseDocumentStatus;
  paymentStatus: PurchasePaymentStatus;
  attachments: PurchaseAttachment[];
}

export interface PurchaseReceiptItem {
  id: string;
  purchaseItemId: string;
  itemName: string;
  orderedQty: number;
  previouslyReceivedQty: number;
  currentReceivedQty: number;
  remainingQty: number;
  unit: 'kg' | 'pcs' | 'lot';
  ratePerUnit: number;
  inventoryCategory?: InventoryCategory;
  inventoryItemId?: string;
}

export interface PurchaseReceipt {
  id: string;
  receiptNumber: string;
  purchaseId: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  receiptDate: string;
  warehouse: string;
  lines: PurchaseReceiptItem[];
  notes?: string;
  stockPosted: boolean;
}

export interface SupplierPaymentRecord {
  id: string;
  paymentReference: string;
  paymentDate: string;
  supplierId: string;
  supplierName: string;
  purchaseId: string;
  purchaseNumber: string;
  outstandingBefore: number;
  amount: number;
  paymentMethod: SupplierPaymentMethod;
  accountRef?: string;
  transactionRef?: string;
  notes?: string;
}

export interface PurchaseReturnItem {
  id: string;
  purchaseId: string;
  purchaseItemId: string;
  itemName: string;
  inventoryCategory?: InventoryCategory;
  inventoryItemId?: string;
  returnQty: number;
  returnRate: number;
  returnValue: number;
  maxReturnableQty: number;
}

export interface PurchaseReturn {
  id: string;
  returnReference: string;
  purchaseId: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  returnDate: string;
  items: PurchaseReturnItem[];
  reason: string;
  notes?: string;
  status: PurchaseReturnStatus;
  stockAdjusted: boolean;
  payableCredit: number;
}

export interface SupplierStatementEntry {
  id: string;
  date: string;
  reference: string;
  transactionType: 'OPENING' | 'PURCHASE' | 'PAYMENT' | 'RETURN' | 'ADJUSTMENT';
  debit: number;
  credit: number;
  runningBalance: number;
  notes?: string;
}

export interface PurchaseSettings {
  purchaseNumberPrefix: string;
  purchaseNumberNextSeq: number;
  supplierCodePrefix: string;
  supplierCodeNextSeq: number;
  receiptNumberPrefix: string;
  receiptNumberNextSeq: number;
  returnNumberPrefix: string;
  returnNumberNextSeq: number;
  defaultCurrency: 'PKR';
  defaultUnit: 'kg';
  defaultPaymentTermsDays: number;
  taxEnabled: boolean;
  taxRatePct: number;
  paymentMethods: SupplierPaymentMethod[];
  purchaseCategories: PurchaseCategory[];
  additionalChargeCategories: string[];
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
  businessName?: string;
  contactPerson: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  city: string;
  address: string;
  category: SupplierCategory;
  taxRegistrationNumber?: string;
  openingBalance: number;
  totalPurchases: number;
  paymentsMade: number;
  currentPayable: number; // Net payable: we owe supplier
  status: 'Active' | 'Inactive';
  notes?: string;
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
