import {
  computeInvoiceTotals,
  computePaymentStatus,
  validateSaleLines,
  normalizeLegacyInvoice,
  remainingReturnableKg,
} from '../salesUtils';
import type { InventoryItem, SalesInvoice } from '../../types/erp';
import { deductFinishedGoodsForSale } from '../salesStock';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const fg: InventoryItem = {
  id: 'fg-1',
  name: 'ABHA White Shopping Bags (Standard)',
  category: 'FINISHED_GOODS',
  warehouse: 'Finished Goods Hall D',
  availableKg: 100,
  reservedKg: 0,
  unitCost: 300,
  totalValue: 30000,
  batchNumber: 'FG-1',
  status: 'Healthy',
  reorderLevelKg: 50,
  lastUpdated: '2026-11-01',
  color: 'White',
};

const raw: InventoryItem = { ...fg, id: 'raw-1', category: 'NEW_BRANDED', name: 'HDPE' };

const totals = computeInvoiceTotals([{ totalAmount: 10000 }, { totalAmount: 5000 }], 'Fixed', 1000, false, 0);
assert(totals.grandTotal === 14000, 'grand total after discount');

const overdue = computePaymentStatus(10000, 0, '2026-11-01', '2026-11-20');
assert(overdue === 'Overdue', 'overdue unpaid');

const lines = [
  {
    id: 'l1',
    productName: fg.name,
    brand: 'ABHA',
    color: 'White',
    qtyKg: 10,
    ratePerKg: 400,
    totalAmount: 4000,
    inventoryItemId: fg.id,
  },
];
assert(validateSaleLines(lines, [fg], 'Confirmed').valid, 'valid sale');
assert(!validateSaleLines([{ ...lines[0], qtyKg: 200 }], [fg], 'Confirmed').valid, 'oversell blocked');
assert(!validateSaleLines(lines, [raw], 'Confirmed').valid, 'non-fg blocked');

const legacy = normalizeLegacyInvoice({
  id: 'x',
  invoiceNumber: 'INV-1',
  customerId: 'c',
  customerName: 'C',
  saleDate: '2026-11-01',
  dueDate: '2026-11-15',
  items: [{ id: 'i', productName: 'ABHA White', color: 'White', qtyKg: 1, ratePerKg: 1, totalAmount: 1 }],
  subtotal: 1,
  discount: 0,
  grandTotal: 1,
  amountReceived: 0,
  remainingBalance: 1,
  paymentStatus: 'Unpaid',
} as SalesInvoice);
assert(legacy.stockDeducted === true, 'legacy stock flag');

const inv: SalesInvoice = {
  ...legacy,
  items: [{ ...legacy.items[0], qtyKg: 50, returnedQtyKg: 5, brand: 'ABHA' }],
};
assert(remainingReturnableKg(inv, inv.items[0]) === 45, 'returnable qty');

let stock = [fg];
stock = deductFinishedGoodsForSale(stock, lines, 'Finished Goods Hall D');
assert(stock[0].availableKg === 90, 'single deduct');
stock = deductFinishedGoodsForSale(stock, lines, 'Finished Goods Hall D');
assert(stock[0].availableKg === 80, 'second deduct is explicit not duplicate guard in utils');

console.log('salesUtils.test.ts: all assertions passed');