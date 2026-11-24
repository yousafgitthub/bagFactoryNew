import type {
  DiscountType,
  InventoryCategory,
  PurchaseOrder,
  PurchaseItem,
  PurchaseCategory,
  PurchasePaymentStatus,
  PurchaseDocumentStatus,
  PurchaseReturn,
  Supplier,
  SupplierPaymentRecord,
  SupplierStatementEntry,
  PurchaseSettings,
  PurchaseReceipt,
  PurchaseBill,
  PaymentStatus,
} from '../types/erp';

export function billCategoryToPurchaseCategory(
  category: 'NEW_BRANDED' | 'WASTE_PLASTIC' | 'SUPPLIES'
): PurchaseCategory {
  if (category === 'WASTE_PLASTIC') return 'WASTE_PLASTIC';
  if (category === 'SUPPLIES') return 'OTHER';
  return 'NEW_RAW_MATERIAL';
}

export function mapLegacyBillCategory(
  category: 'NEW_BRANDED' | 'WASTE_PLASTIC' | 'SUPPLIES'
): InventoryCategory | undefined {
  if (category === 'NEW_BRANDED') return 'NEW_BRANDED';
  if (category === 'WASTE_PLASTIC') return 'WASTE_PLASTIC';
  return undefined;
}

export function purchaseCategoryLabel(cat: PurchaseCategory): string {
  const map: Record<PurchaseCategory, string> = {
    NEW_RAW_MATERIAL: 'New Raw Material',
    WASTE_PLASTIC: 'Waste Plastic',
    SPARE_PARTS: 'Spare Parts',
    PACKAGING: 'Packaging',
    OTHER: 'Other',
  };
  return map[cat];
}

export function inventoryCategoryForPurchase(cat: PurchaseCategory): InventoryCategory | undefined {
  if (cat === 'NEW_RAW_MATERIAL') return 'NEW_BRANDED';
  if (cat === 'WASTE_PLASTIC') return 'WASTE_PLASTIC';
  return undefined;
}

export function computeLineTotal(qty: number, rate: number): number {
  return Math.round(qty * rate * 100) / 100;
}

export function computeDiscountAmount(subtotal: number, discountType: DiscountType, discountValue: number): number {
  if (discountValue <= 0) return 0;
  if (discountType === 'Percent') {
    return Math.min(subtotal, Math.round(subtotal * (discountValue / 100) * 100) / 100);
  }
  return Math.min(subtotal, discountValue);
}

export function computePurchaseTotals(
  items: Pick<PurchaseItem, 'lineTotal'>[],
  discountType: DiscountType,
  discountValue: number,
  additionalCharges: number,
  taxEnabled: boolean,
  taxRatePct: number
): { subtotal: number; discount: number; taxAmount: number; netTotal: number } {
  const subtotal = items.reduce((a, i) => a + i.lineTotal, 0);
  const discount = computeDiscountAmount(subtotal, discountType, discountValue);
  const afterDiscount = Math.max(0, subtotal - discount);
  const taxAmount = taxEnabled ? Math.round(afterDiscount * (taxRatePct / 100) * 100) / 100 : 0;
  const netTotal = Math.max(0, afterDiscount + additionalCharges + taxAmount);
  return { subtotal, discount, taxAmount, netTotal };
}

export function computePurchasePaymentStatus(
  netTotal: number,
  amountPaid: number,
  dueDate: string,
  asOf: string = new Date().toISOString().split('T')[0]
): PurchasePaymentStatus {
  const remaining = Math.max(0, netTotal - amountPaid);
  if (remaining <= 0.01) return 'Paid';
  if (amountPaid > 0) {
    if (dueDate < asOf) return 'Overdue';
    return 'Partial';
  }
  if (dueDate < asOf) return 'Overdue';
  return 'Unpaid';
}

export function daysOverduePayable(dueDate: string, asOf: string = new Date().toISOString().split('T')[0]): number {
  if (dueDate >= asOf) return 0;
  const d0 = new Date(dueDate + 'T00:00:00').getTime();
  const d1 = new Date(asOf + 'T00:00:00').getTime();
  return Math.floor((d1 - d0) / (24 * 60 * 60 * 1000));
}

export function deriveDocumentStatus(items: PurchaseItem[]): PurchaseDocumentStatus {
  const stockLines = items.filter((i) => i.inventoryCategory && i.inventoryCategory !== 'RECYCLED_RAW');
  if (stockLines.length === 0) {
    const anyReceived = items.some((i) => i.receivedQty > 0);
    return anyReceived ? 'Received' : 'Ordered';
  }
  const totalOrdered = stockLines.reduce((a, i) => a + i.orderedQty, 0);
  const totalReceived = stockLines.reduce((a, i) => a + i.receivedQty, 0);
  if (totalReceived <= 0) return 'Ordered';
  if (totalReceived < totalOrdered) return 'Partially Received';
  return 'Received';
}

export function generatePurchaseNumber(purchases: PurchaseOrder[], settings: PurchaseSettings): string {
  const year = new Date().getFullYear();
  const prefix = settings.purchaseNumberPrefix || 'PUR';
  const used = new Set(purchases.map((p) => p.purchaseNumber));
  let seq = settings.purchaseNumberNextSeq;
  let candidate = `${prefix}-${year}-${String(seq).padStart(4, '0')}`;
  while (used.has(candidate)) {
    seq += 1;
    candidate = `${prefix}-${year}-${String(seq).padStart(4, '0')}`;
  }
  return candidate;
}

export function generateReceiptNumber(receipts: PurchaseReceipt[], settings: PurchaseSettings): string {
  const year = new Date().getFullYear();
  const prefix = settings.receiptNumberPrefix || 'GRN';
  const used = new Set(receipts.map((r) => r.receiptNumber));
  let seq = settings.receiptNumberNextSeq;
  let candidate = `${prefix}-${year}-${String(seq)}`;
  while (used.has(candidate)) {
    seq += 1;
    candidate = `${prefix}-${year}-${String(seq)}`;
  }
  return candidate;
}

export function generateReturnReference(returns: PurchaseReturn[], settings: PurchaseSettings): string {
  const year = new Date().getFullYear();
  const prefix = settings.returnNumberPrefix || 'PRET';
  const used = new Set(returns.map((r) => r.returnReference));
  let seq = settings.returnNumberNextSeq;
  let candidate = `${prefix}-${year}-${String(seq).padStart(4, '0')}`;
  while (used.has(candidate)) {
    seq += 1;
    candidate = `${prefix}-${year}-${String(seq).padStart(4, '0')}`;
  }
  return candidate;
}

export function generateSupplierCode(suppliers: Supplier[], settings: PurchaseSettings): string {
  const prefix = settings.supplierCodePrefix || 'SUP';
  const used = new Set(suppliers.map((s) => s.code));
  let seq = settings.supplierCodeNextSeq;
  let candidate = `${prefix}-${seq}`;
  while (used.has(candidate)) {
    seq += 1;
    candidate = `${prefix}-${seq}`;
  }
  return candidate;
}

export function confirmedPurchases(orders: PurchaseOrder[]): PurchaseOrder[] {
  return orders.filter((p) => p.documentStatus !== 'Draft' && p.documentStatus !== 'Cancelled');
}

export interface PurchaseKpiSnapshot {
  totalPurchaseValue: number;
  todayPurchases: number;
  monthPurchases: number;
  totalInvoices: number;
  paidCount: number;
  partialCount: number;
  unpaidCount: number;
  totalOutstanding: number;
}

export function aggregatePurchaseKpis(
  orders: PurchaseOrder[],
  asOf: string = new Date().toISOString().split('T')[0]
): PurchaseKpiSnapshot {
  const active = orders.filter((p) => p.documentStatus !== 'Draft' && p.documentStatus !== 'Cancelled');
  const todayPrefix = asOf;
  const monthPrefix = asOf.slice(0, 7);
  let todayPurchases = 0;
  let monthPurchases = 0;
  let totalPurchaseValue = 0;
  let paidCount = 0;
  let partialCount = 0;
  let unpaidCount = 0;
  let totalOutstanding = 0;

  active.forEach((p) => {
    totalPurchaseValue += p.netTotal;
    if (p.purchaseDate === todayPrefix) todayPurchases += p.netTotal;
    if (p.purchaseDate.startsWith(monthPrefix)) monthPurchases += p.netTotal;
    totalOutstanding += p.remainingPayable;
    if (p.paymentStatus === 'Paid') paidCount += 1;
    else if (p.paymentStatus === 'Partial' || p.paymentStatus === 'Overdue') partialCount += 1;
    else unpaidCount += 1;
  });

  return {
    totalPurchaseValue,
    todayPurchases,
    monthPurchases,
    totalInvoices: active.length,
    paidCount,
    partialCount,
    unpaidCount,
    totalOutstanding,
  };
}

export function validatePurchaseLines(
  items: PurchaseItem[],
  purchaseCategory: PurchaseCategory
): { valid: boolean; message?: string } {
  if (items.length === 0) return { valid: false, message: 'Add at least one line item.' };
  for (const line of items) {
    if (line.orderedQty <= 0) return { valid: false, message: 'Ordered quantity must be greater than zero.' };
    if (line.ratePerUnit < 0) return { valid: false, message: 'Rate cannot be negative.' };
    if (line.inventoryCategory === 'RECYCLED_RAW') {
      return {
        valid: false,
        message: 'Recycled material cannot be purchased as ordinary stock without external-recycled workflow.',
      };
    }
    const expected = inventoryCategoryForPurchase(purchaseCategory);
    if (expected && line.inventoryCategory && line.inventoryCategory !== expected && purchaseCategory !== 'OTHER') {
      // allow mixed only when line explicitly set
    }
  }
  return { valid: true };
}

export function validateReceiptQuantities(
  items: PurchaseItem[],
  lines: { purchaseItemId: string; currentReceivedQty: number }[]
): { valid: boolean; message?: string } {
  for (const line of lines) {
    if (line.currentReceivedQty <= 0) return { valid: false, message: 'Received quantity must be greater than zero.' };
    const item = items.find((i) => i.id === line.purchaseItemId);
    if (!item) return { valid: false, message: 'Invalid purchase line.' };
    const remaining = item.orderedQty - item.receivedQty;
    if (line.currentReceivedQty > remaining + 0.001) {
      return { valid: false, message: `Cannot receive more than remaining for ${item.itemName}.` };
    }
  }
  return { valid: true };
}

export function validatePaymentAmount(outstanding: number, amount: number): { valid: boolean; message?: string } {
  if (amount <= 0) return { valid: false, message: 'Payment must be greater than zero.' };
  if (amount > outstanding + 0.01) return { valid: false, message: 'Payment exceeds outstanding balance.' };
  return { valid: true };
}

export function maxReturnableQty(item: PurchaseItem, returns: PurchaseReturn[]): number {
  const returned = returns
    .filter((r) => r.status === 'Completed' || r.status === 'Approved')
    .flatMap((r) => r.items)
    .filter((i) => i.purchaseItemId === item.id)
    .reduce((a, i) => a + i.returnQty, 0);
  return Math.max(0, item.receivedQty - returned);
}

export function buildSupplierStatement(
  supplier: Supplier,
  purchases: PurchaseOrder[],
  payments: SupplierPaymentRecord[],
  returns: PurchaseReturn[]
): SupplierStatementEntry[] {
  const rows: SupplierStatementEntry[] = [
    {
      id: 'stmt-ob',
      date: '2026-01-01',
      reference: 'OPENING',
      transactionType: 'OPENING',
      debit: supplier.openingBalance,
      credit: 0,
      runningBalance: supplier.openingBalance,
      notes: 'Opening balance (amount payable to supplier)',
    },
  ];

  const events: { date: string; sortKey: string; entry: Omit<SupplierStatementEntry, 'runningBalance'> }[] = [];

  purchases
    .filter((p) => p.supplierId === supplier.id && p.documentStatus !== 'Draft' && p.documentStatus !== 'Cancelled')
    .forEach((p) => {
      events.push({
        date: p.purchaseDate,
        sortKey: `${p.purchaseDate}-P-${p.purchaseNumber}`,
        entry: {
          id: `stmt-p-${p.id}`,
          date: p.purchaseDate,
          reference: p.purchaseNumber,
          transactionType: 'PURCHASE',
          debit: p.netTotal,
          credit: 0,
          notes: p.notes,
        },
      });
    });

  payments
    .filter((pay) => pay.supplierId === supplier.id)
    .forEach((pay) => {
      events.push({
        date: pay.paymentDate,
        sortKey: `${pay.paymentDate}-Y-${pay.paymentReference}`,
        entry: {
          id: `stmt-y-${pay.id}`,
          date: pay.paymentDate,
          reference: pay.paymentReference,
          transactionType: 'PAYMENT',
          debit: 0,
          credit: pay.amount,
          notes: pay.notes ?? `Against ${pay.purchaseNumber}`,
        },
      });
    });

  returns
    .filter((r) => r.supplierId === supplier.id && (r.status === 'Completed' || r.status === 'Approved'))
    .forEach((r) => {
      events.push({
        date: r.returnDate,
        sortKey: `${r.returnDate}-R-${r.returnReference}`,
        entry: {
          id: `stmt-r-${r.id}`,
          date: r.returnDate,
          reference: r.returnReference,
          transactionType: 'RETURN',
          debit: 0,
          credit: r.payableCredit,
          notes: r.reason,
        },
      });
    });

  events.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  let running = supplier.openingBalance;
  const withBalance: SupplierStatementEntry[] = [...rows];
  events.forEach((e) => {
    running = running + e.entry.debit - e.entry.credit;
    withBalance.push({ ...e.entry, runningBalance: Math.round(running * 100) / 100 });
  });

  return withBalance;
}

export function purchaseBillsFromOrders(orders: PurchaseOrder[]): PurchaseBill[] {
  return orders
    .filter((p) => p.documentStatus !== 'Draft')
    .map((p) => {
      const first = p.items[0];
      const qtyKg = p.items.filter((i) => i.unit === 'kg').reduce((a, i) => a + i.orderedQty, 0) || first?.orderedQty || 0;
      const ratePerKg = first?.unit === 'kg' ? first.ratePerUnit : 0;
      const category =
        p.purchaseCategory === 'WASTE_PLASTIC'
          ? 'WASTE_PLASTIC'
          : p.purchaseCategory === 'NEW_RAW_MATERIAL'
            ? 'NEW_BRANDED'
            : 'SUPPLIES';
      return {
        id: p.id,
        purchaseNumber: p.purchaseNumber,
        supplierId: p.supplierId,
        supplierName: p.supplierName,
        category: category as 'NEW_BRANDED' | 'WASTE_PLASTIC' | 'SUPPLIES',
        materialName: first?.itemName ?? 'Mixed items',
        quantityKg: qtyKg,
        ratePerKg: ratePerKg,
        totalAmount: p.netTotal,
        paidAmount: p.amountPaid,
        remainingPayable: p.remainingPayable,
        paymentStatus: (p.paymentStatus === 'Partial'
          ? 'Partial'
          : p.paymentStatus === 'Paid'
            ? 'Paid'
            : p.paymentStatus === 'Overdue'
              ? 'Overdue'
              : 'Unpaid') as PaymentStatus,
        purchaseDate: p.purchaseDate,
        dueDate: p.paymentDueDate,
        warehouse: p.warehouse,
        documentRef: p.supplierInvoiceNumber,
        notes: p.notes,
      };
    });
}