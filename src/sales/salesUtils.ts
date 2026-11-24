import type {
  DiscountType,
  InventoryItem,
  SalesInvoice,
  SalesInvoiceItem,
  SalesPaymentStatus,
  SalesReturn,
  SalesSettings,
  CustomerPayment,
} from '../types/erp';

export function getBrandFromProductName(name: string): string {
  const n = name.toUpperCase();
  if (n.includes('CRYSTAL')) return 'Crystal';
  if (n.includes('ABHA')) return 'ABHA';
  return 'Other';
}

export function normalizeLegacyInvoice(inv: SalesInvoice): SalesInvoice {
  return {
    ...inv,
    invoiceStatus: inv.invoiceStatus ?? 'Confirmed',
    stockDeducted: inv.stockDeducted ?? true,
    taxAmount: inv.taxAmount ?? 0,
    discountType: inv.discountType ?? 'Fixed',
    items: inv.items.map((item) => ({
      ...item,
      brand: item.brand ?? getBrandFromProductName(item.productName),
      returnedQtyKg: item.returnedQtyKg ?? 0,
    })),
  };
}

export function computeLineTotal(qtyKg: number, ratePerKg: number): number {
  return Math.round(qtyKg * ratePerKg * 100) / 100;
}

export function computeDiscountAmount(
  subtotal: number,
  discountType: DiscountType,
  discountValue: number
): number {
  if (discountValue <= 0) return 0;
  if (discountType === 'Percent') {
    return Math.min(subtotal, Math.round(subtotal * (discountValue / 100) * 100) / 100);
  }
  return Math.min(subtotal, discountValue);
}

export function computeInvoiceTotals(
  items: Pick<SalesInvoiceItem, 'totalAmount'>[],
  discountType: DiscountType,
  discountValue: number,
  taxEnabled: boolean,
  taxRatePct: number
): { subtotal: number; discount: number; taxAmount: number; grandTotal: number } {
  const subtotal = items.reduce((a, i) => a + i.totalAmount, 0);
  const discount = computeDiscountAmount(subtotal, discountType, discountValue);
  const afterDiscount = Math.max(0, subtotal - discount);
  const taxAmount = taxEnabled ? Math.round(afterDiscount * (taxRatePct / 100) * 100) / 100 : 0;
  const grandTotal = Math.max(0, afterDiscount + taxAmount);
  return { subtotal, discount, taxAmount, grandTotal };
}

export function computePaymentStatus(
  grandTotal: number,
  amountReceived: number,
  dueDate: string,
  asOf: string = new Date().toISOString().split('T')[0]
): SalesPaymentStatus {
  const remaining = Math.max(0, grandTotal - amountReceived);
  if (remaining <= 0.01) return 'Paid';
  if (amountReceived > 0) {
    if (dueDate < asOf) return 'Overdue';
    return 'Partial';
  }
  if (dueDate < asOf) return 'Overdue';
  return 'Unpaid';
}

export function daysOverdue(dueDate: string, asOf: string = new Date().toISOString().split('T')[0]): number {
  if (dueDate >= asOf) return 0;
  const d0 = new Date(dueDate + 'T00:00:00').getTime();
  const d1 = new Date(asOf + 'T00:00:00').getTime();
  return Math.floor((d1 - d0) / (24 * 60 * 60 * 1000));
}

export function generateInvoiceNumber(invoices: SalesInvoice[], settings: SalesSettings): string {
  const year = new Date().getFullYear();
  const prefix = settings.invoiceNumberPrefix || 'INV';
  const used = new Set(invoices.map((i) => i.invoiceNumber));
  let seq = settings.invoiceNumberNextSeq;
  let candidate = `${prefix}-${year}-${String(seq).padStart(4, '0')}`;
  while (used.has(candidate)) {
    seq += 1;
    candidate = `${prefix}-${year}-${String(seq).padStart(4, '0')}`;
  }
  return candidate;
}

export function nextInvoiceSequence(invoices: SalesInvoice[], settings: SalesSettings): number {
  const year = new Date().getFullYear();
  const prefix = settings.invoiceNumberPrefix || 'INV';
  const pattern = new RegExp(`^${prefix}-${year}-(\\d+)$`);
  let max = settings.invoiceNumberNextSeq - 1;
  invoices.forEach((inv) => {
    const m = inv.invoiceNumber.match(pattern);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return max + 1;
}

export function validateSaleLines(
  items: SalesInvoiceItem[],
  inventory: InventoryItem[],
  invoiceStatus: 'Draft' | 'Confirmed'
): { valid: boolean; message?: string } {
  if (items.length === 0) return { valid: false, message: 'Add at least one line item.' };
  for (const line of items) {
    if (line.qtyKg <= 0) return { valid: false, message: 'Quantity must be greater than zero.' };
    if (line.ratePerKg < 0) return { valid: false, message: 'Rate cannot be negative.' };
    const item =
      (line.inventoryItemId && inventory.find((i) => i.id === line.inventoryItemId)) ||
      inventory.find((i) => i.category === 'FINISHED_GOODS' && i.name === line.productName);
    if (!item) return { valid: false, message: `Product not found in finished goods: ${line.productName}` };
    if (item.category !== 'FINISHED_GOODS') {
      return { valid: false, message: 'Only finished goods can be sold on this invoice.' };
    }
    if (invoiceStatus === 'Confirmed' && line.qtyKg > item.availableKg + 0.001) {
      return {
        valid: false,
        message: `Insufficient stock for ${line.productName}. Available ${item.availableKg} kg.`,
      };
    }
  }
  return { valid: true };
}

export function confirmedSalesInvoices(invoices: SalesInvoice[]): SalesInvoice[] {
  return invoices.filter((i) => i.invoiceStatus === 'Confirmed' || i.invoiceStatus === 'Completed');
}

export function aggregateSalesKpis(invoices: SalesInvoice[], payments: CustomerPayment[]) {
  const confirmed = confirmedSalesInvoices(invoices);
  const today = new Date().toISOString().split('T')[0];
  const month = today.slice(0, 7);
  const totalSales = confirmed.reduce((a, i) => a + i.grandTotal, 0);
  const todaySales = confirmed.filter((i) => i.saleDate === today).reduce((a, i) => a + i.grandTotal, 0);
  const monthSales = confirmed.filter((i) => i.saleDate.startsWith(month)).reduce((a, i) => a + i.grandTotal, 0);
  const totalInvoices = confirmed.length;
  const paidInvoices = confirmed.filter((i) => i.paymentStatus === 'Paid').length;
  const partialInvoices = confirmed.filter((i) => i.paymentStatus === 'Partial').length;
  const unpaidInvoices = confirmed.filter(
    (i) => i.paymentStatus === 'Unpaid' || i.paymentStatus === 'Overdue'
  ).length;
  const totalOutstanding = confirmed.reduce((a, i) => a + i.remainingBalance, 0);
  const paymentsThisMonth = payments
    .filter((p) => p.paymentDate.startsWith(month))
    .reduce((a, p) => a + p.amount, 0);
  return {
    totalSales,
    todaySales,
    monthSales,
    totalInvoices,
    paidInvoices,
    partialInvoices,
    unpaidInvoices,
    totalOutstanding,
    paymentsThisMonth,
  };
}

export function remainingReturnableKg(invoice: SalesInvoice, item: SalesInvoiceItem): number {
  const returned = item.returnedQtyKg ?? 0;
  return Math.max(0, item.qtyKg - returned);
}

export function validateReturnQuantity(
  invoice: SalesInvoice,
  itemId: string,
  qtyKg: number,
  returns: SalesReturn[]
): { valid: boolean; message?: string } {
  const line = invoice.items.find((i) => i.id === itemId);
  if (!line) return { valid: false, message: 'Line item not found on invoice.' };
  const pendingOther = returns
    .filter((r) => r.invoiceId === invoice.id && r.status !== 'Rejected' && r.status !== 'Draft')
  const already = line.returnedQtyKg ?? 0;
  const max = line.qtyKg - already;
  if (qtyKg > max + 0.001) {
    return { valid: false, message: `Return quantity exceeds remaining ${max} kg for this line.` };
  }
  void pendingOther;
  return { valid: true };
}

export function refreshInvoicePaymentFields(inv: SalesInvoice): Pick<
  SalesInvoice,
  'remainingBalance' | 'paymentStatus' | 'invoiceStatus'
> {
  const remainingBalance = Math.max(0, inv.grandTotal - inv.amountReceived);
  const paymentStatus = computePaymentStatus(inv.grandTotal, inv.amountReceived, inv.dueDate);
  let invoiceStatus = inv.invoiceStatus;
  if (invoiceStatus === 'Confirmed' && paymentStatus === 'Paid') {
    invoiceStatus = 'Completed';
  }
  return { remainingBalance, paymentStatus, invoiceStatus };
}