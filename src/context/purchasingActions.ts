import type {
  PurchaseOrder,
  PurchaseItem,
  PurchaseReceipt,
  SupplierPaymentRecord,
  PurchaseReturn,
  PurchaseSettings,
  Supplier,
  InventoryItem,
  StockMovement,
  SupplierPaymentMethod,
  DiscountType,
  PurchaseDocumentStatus,
} from '../types/erp';
import {
  computePurchaseTotals,
  computePurchasePaymentStatus,
  deriveDocumentStatus,
  generatePurchaseNumber,
  generateReceiptNumber,
  generateReturnReference,
  generateSupplierCode,
  validatePurchaseLines,
  validateReceiptQuantities,
  validatePaymentAmount,
  inventoryCategoryForPurchase,
} from '../purchasing/purchasingUtils';
import { receivePurchaseLineToInventory, deductPurchaseReturnStock } from '../purchasing/purchasingStock';

export interface PurchaseFormInput {
  supplierId: string;
  supplierInvoiceNumber?: string;
  purchaseDate: string;
  paymentDueDate: string;
  purchaseCategory: PurchaseOrder['purchaseCategory'];
  warehouse: string;
  notes?: string;
  items: Omit<PurchaseItem, 'id' | 'lineTotal' | 'receivedQty'>[];
  discountType: DiscountType;
  discount: number;
  additionalCharges: number;
  documentStatus?: PurchaseDocumentStatus;
}

export function buildPurchaseFromInput(
  input: PurchaseFormInput,
  suppliers: Supplier[],
  purchases: PurchaseOrder[],
  settings: PurchaseSettings,
  existingId?: string,
  existingNumber?: string
): PurchaseOrder | { error: string } {
  const supplier = suppliers.find((s) => s.id === input.supplierId);
  if (!supplier) return { error: 'Select a valid supplier.' };

  const items: PurchaseItem[] = input.items.map((line, idx) => ({
    ...line,
    id: `${existingId ?? 'new'}-l${idx + 1}`,
    receivedQty: 0,
    lineTotal: Math.round(line.orderedQty * line.ratePerUnit * 100) / 100,
    inventoryCategory:
      line.inventoryCategory ?? inventoryCategoryForPurchase(input.purchaseCategory),
  }));

  const validation = validatePurchaseLines(items, input.purchaseCategory);
  if (!validation.valid) return { error: validation.message ?? 'Invalid lines.' };

  const { subtotal, discount, taxAmount, netTotal } = computePurchaseTotals(
    items,
    input.discountType,
    input.discount,
    input.additionalCharges,
    settings.taxEnabled,
    settings.taxRatePct
  );

  const docStatus = input.documentStatus ?? 'Draft';
  const amountPaid = 0;
  const remainingPayable = netTotal - amountPaid;

  return {
    id: existingId ?? `pur-${Date.now()}`,
    purchaseNumber: existingNumber ?? generatePurchaseNumber(purchases, settings),
    purchaseDate: input.purchaseDate,
    supplierId: supplier.id,
    supplierName: supplier.name,
    supplierInvoiceNumber: input.supplierInvoiceNumber,
    purchaseCategory: input.purchaseCategory,
    warehouse: input.warehouse,
    paymentDueDate: input.paymentDueDate,
    notes: input.notes,
    items,
    subtotal,
    discount,
    discountType: input.discountType,
    additionalCharges: input.additionalCharges,
    taxAmount,
    netTotal,
    amountPaid,
    remainingPayable,
    documentStatus: docStatus,
    paymentStatus: computePurchasePaymentStatus(netTotal, amountPaid, input.paymentDueDate),
    attachments: [],
  };
}

export function applyGoodsReceipt(
  purchase: PurchaseOrder,
  receiptLines: { purchaseItemId: string; currentReceivedQty: number }[],
  receiptDate: string,
  warehouse: string,
  notes: string | undefined,
  inventory: InventoryItem[],
  receipts: PurchaseReceipt[],
  settings: PurchaseSettings,
  operator: string
): {
  purchase: PurchaseOrder;
  receipt: PurchaseReceipt;
  inventory: InventoryItem[];
  movements: StockMovement[];
  error?: string;
} {
  const validation = validateReceiptQuantities(purchase.items, receiptLines);
  if (!validation.valid) return { purchase, receipt: null as unknown as PurchaseReceipt, inventory, movements: [], error: validation.message };

  let nextInv = [...inventory];
  const movements: StockMovement[] = [];
  const receiptNumber = generateReceiptNumber(receipts, settings);

  const lines = receiptLines.map((rl) => {
    const item = purchase.items.find((i) => i.id === rl.purchaseItemId)!;
    const previouslyReceivedQty = item.receivedQty;
    const remainingQty = item.orderedQty - previouslyReceivedQty - rl.currentReceivedQty;
    return {
      id: `grl-${rl.purchaseItemId}-${Date.now()}`,
      purchaseItemId: rl.purchaseItemId,
      itemName: item.itemName,
      orderedQty: item.orderedQty,
      previouslyReceivedQty,
      currentReceivedQty: rl.currentReceivedQty,
      remainingQty: Math.max(0, remainingQty),
      unit: item.unit,
      ratePerUnit: item.ratePerUnit,
      inventoryCategory: item.inventoryCategory,
      inventoryItemId: item.inventoryItemId,
    };
  });

  receiptLines.forEach((rl) => {
    const item = purchase.items.find((i) => i.id === rl.purchaseItemId)!;
    const result = receivePurchaseLineToInventory(
      nextInv,
      item,
      rl.currentReceivedQty,
      warehouse,
      purchase.supplierName,
      purchase.purchaseNumber,
      receiptNumber,
      operator
    );
    nextInv = result.inventory;
    if (result.movement) movements.push(result.movement);
  });

  const updatedItems = purchase.items.map((item) => {
    const rl = receiptLines.find((x) => x.purchaseItemId === item.id);
    if (!rl) return item;
    return { ...item, receivedQty: item.receivedQty + rl.currentReceivedQty };
  });

  const updatedPurchase: PurchaseOrder = {
    ...purchase,
    items: updatedItems,
    documentStatus: deriveDocumentStatus(updatedItems),
    warehouse,
  };

  const receipt: PurchaseReceipt = {
    id: `grn-${Date.now()}`,
    receiptNumber,
    purchaseId: purchase.id,
    purchaseNumber: purchase.purchaseNumber,
    supplierId: purchase.supplierId,
    supplierName: purchase.supplierName,
    receiptDate,
    warehouse,
    lines,
    notes,
    stockPosted: movements.length > 0,
  };

  return { purchase: updatedPurchase, receipt, inventory: nextInv, movements };
}

export function applySupplierPaymentToPurchase(
  purchase: PurchaseOrder,
  amount: number,
  paymentDate: string,
  paymentMethod: SupplierPaymentMethod,
  paymentReference: string,
  accountRef?: string,
  transactionRef?: string,
  notes?: string
): {
  purchase: PurchaseOrder;
  payment: SupplierPaymentRecord;
  error?: string;
} {
  const validation = validatePaymentAmount(purchase.remainingPayable, amount);
  if (!validation.valid) return { purchase, payment: null as unknown as SupplierPaymentRecord, error: validation.message };

  const amountPaid = purchase.amountPaid + amount;
  const remainingPayable = Math.max(0, purchase.netTotal - amountPaid);
  const paymentStatus = computePurchasePaymentStatus(purchase.netTotal, amountPaid, purchase.paymentDueDate, paymentDate);

  const payment: SupplierPaymentRecord = {
    id: `spay-${Date.now()}`,
    paymentReference,
    paymentDate,
    supplierId: purchase.supplierId,
    supplierName: purchase.supplierName,
    purchaseId: purchase.id,
    purchaseNumber: purchase.purchaseNumber,
    outstandingBefore: purchase.remainingPayable,
    amount,
    paymentMethod,
    accountRef,
    transactionRef,
    notes,
  };

  return {
    purchase: { ...purchase, amountPaid, remainingPayable, paymentStatus },
    payment,
  };
}

export function applyPurchaseReturn(
  purchase: PurchaseOrder,
  returnItems: { purchaseItemId: string; returnQty: number; returnRate: number }[],
  returnDate: string,
  reason: string,
  returns: PurchaseReturn[],
  settings: PurchaseSettings,
  inventory: InventoryItem[],
  operator: string
): {
  purchase: PurchaseOrder;
  purchaseReturn: PurchaseReturn;
  inventory: InventoryItem[];
  movements: StockMovement[];
  credit: number;
  error?: string;
} {
  const items = returnItems.map((ri) => {
    const line = purchase.items.find((i) => i.id === ri.purchaseItemId);
    if (!line) return null;
    const max = line.receivedQty;
    if (ri.returnQty > max) return null;
    return {
      id: `pri-${ri.purchaseItemId}`,
      purchaseId: purchase.id,
      purchaseItemId: ri.purchaseItemId,
      itemName: line.itemName,
      inventoryCategory: line.inventoryCategory,
      inventoryItemId: line.inventoryItemId,
      returnQty: ri.returnQty,
      returnRate: ri.returnRate,
      returnValue: ri.returnQty * ri.returnRate,
      maxReturnableQty: max,
    };
  });

  if (items.some((i) => i === null)) {
    return {
      purchase,
      purchaseReturn: null as unknown as PurchaseReturn,
      inventory,
      movements: [],
      credit: 0,
      error: 'Return quantity exceeds returnable quantity or invalid line.',
    };
  }

  let nextInv = [...inventory];
  const movements: StockMovement[] = [];
  let credit = 0;

  items.forEach((item) => {
    if (!item || !item.inventoryCategory) {
      credit += item?.returnValue ?? 0;
      return;
    }
    const result = deductPurchaseReturnStock(
      nextInv,
      item.inventoryItemId,
      item.itemName,
      purchase.warehouse,
      item.returnQty,
      purchase.purchaseNumber,
      generateReturnReference(returns, settings),
      operator
    );
    nextInv = result.inventory;
    if (result.movement) movements.push(result.movement);
    credit += item.returnValue;
  });

  const purchaseReturn: PurchaseReturn = {
    id: `pret-${Date.now()}`,
    returnReference: generateReturnReference(returns, settings),
    purchaseId: purchase.id,
    purchaseNumber: purchase.purchaseNumber,
    supplierId: purchase.supplierId,
    supplierName: purchase.supplierName,
    returnDate,
    items: items as NonNullable<(typeof items)[0]>[],
    reason,
    status: 'Completed',
    stockAdjusted: movements.length > 0,
    payableCredit: credit,
  };

  const remainingPayable = Math.max(0, purchase.remainingPayable - credit);
  const paymentStatus = computePurchasePaymentStatus(purchase.netTotal, purchase.amountPaid, purchase.paymentDueDate);

  return {
    purchase: { ...purchase, remainingPayable, paymentStatus },
    purchaseReturn,
    inventory: nextInv,
    movements,
    credit,
  };
}

export function applySupplierUpsert(
  suppliers: Supplier[],
  input: Omit<Supplier, 'id' | 'code' | 'totalPurchases' | 'paymentsMade' | 'currentPayable'> & {
    id?: string;
    code?: string;
  },
  settings: PurchaseSettings
): Supplier {
  if (input.id) {
    const existing = suppliers.find((s) => s.id === input.id);
    return {
      ...existing!,
      ...input,
      id: input.id,
      code: input.code ?? existing!.code,
      totalPurchases: existing!.totalPurchases,
      paymentsMade: existing!.paymentsMade,
      currentPayable: existing!.currentPayable,
    };
  }
  return {
    ...input,
    id: `sup-${Date.now()}`,
    code: input.code ?? generateSupplierCode(suppliers, settings),
    totalPurchases: 0,
    paymentsMade: 0,
    currentPayable: Math.max(0, input.openingBalance),
  };
}

export function syncSupplierBalances(supplier: Supplier, purchases: PurchaseOrder[], payments: SupplierPaymentRecord[]): Supplier {
  const supplierPurchases = purchases.filter(
    (p) => p.supplierId === supplier.id && p.documentStatus !== 'Draft' && p.documentStatus !== 'Cancelled'
  );
  const totalPurchases = supplierPurchases.reduce((a, p) => a + p.netTotal, 0);
  const supplierPayments = payments.filter((p) => p.supplierId === supplier.id);
  const paymentsMade = supplierPayments.reduce((a, p) => a + p.amount, 0);
  const credits = 0;
  const currentPayable = Math.max(0, supplier.openingBalance + totalPurchases - paymentsMade - credits);
  return { ...supplier, totalPurchases, paymentsMade, currentPayable };
}