import {
  computePurchaseTotals,
  computePurchasePaymentStatus,
  validateReceiptQuantities,
  validatePaymentAmount,
  maxReturnableQty,
  deriveDocumentStatus,
  billCategoryToPurchaseCategory,
} from '../purchasingUtils';
import type { PurchaseItem, PurchaseReturn } from '../../types/erp';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const totals = computePurchaseTotals(
  [{ lineTotal: 100000 }, { lineTotal: 50000 }],
  'Fixed',
  5000,
  2500,
  false,
  0
);
assert(totals.netTotal === 147500, 'net total with discount and charges');

const overdue = computePurchasePaymentStatus(10000, 0, '2026-11-01', '2026-11-20');
assert(overdue === 'Overdue', 'overdue unpaid payable');

const items: PurchaseItem[] = [
  {
    id: 'l1',
    itemName: 'HDPE',
    inventoryCategory: 'NEW_BRANDED',
    orderedQty: 1000,
    receivedQty: 400,
    ratePerUnit: 380,
    unit: 'kg',
    lineTotal: 380000,
  },
];
assert(deriveDocumentStatus(items) === 'Partially Received', 'partial doc status');
assert(
  validateReceiptQuantities(items, [{ purchaseItemId: 'l1', currentReceivedQty: 601 }]).valid === false,
  'over-receipt blocked'
);
assert(
  validateReceiptQuantities(items, [{ purchaseItemId: 'l1', currentReceivedQty: 500 }]).valid,
  'valid partial receipt'
);
assert(validatePaymentAmount(50000, 60000).valid === false, 'overpayment blocked');
assert(validatePaymentAmount(50000, 40000).valid, 'valid payment');

const returns: PurchaseReturn[] = [
  {
    id: 'r1',
    returnReference: 'PRET-1',
    purchaseId: 'p1',
    purchaseNumber: 'PUR-1',
    supplierId: 's1',
    supplierName: 'S',
    returnDate: '2026-11-01',
    items: [
      {
        id: 'ri1',
        purchaseId: 'p1',
        purchaseItemId: 'l1',
        itemName: 'HDPE',
        returnQty: 50,
        returnRate: 380,
        returnValue: 19000,
        maxReturnableQty: 350,
      },
    ],
    reason: 'Test',
    status: 'Completed',
    stockAdjusted: true,
    payableCredit: 19000,
  },
];
assert(maxReturnableQty(items[0], returns) === 350, 'returnable qty');

assert(billCategoryToPurchaseCategory('WASTE_PLASTIC') === 'WASTE_PLASTIC', 'category map');

console.log('purchasingUtils: all assertions passed');