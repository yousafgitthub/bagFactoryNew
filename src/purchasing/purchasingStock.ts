import type { InventoryItem, PurchaseItem, StockMovement } from '../types/erp';
import { applyReceiveToInventory, computeStockStatus } from '../inventory/inventoryUtils';

export function receivePurchaseLineToInventory(
  inventory: InventoryItem[],
  line: PurchaseItem,
  currentReceivedQty: number,
  warehouse: string,
  supplierName: string,
  purchaseNumber: string,
  receiptNumber: string,
  operator: string
): { inventory: InventoryItem[]; movement?: StockMovement } {
  if (!line.inventoryCategory || line.inventoryCategory === 'RECYCLED_RAW') {
    return { inventory };
  }
  const receiveQty = line.unit === 'kg' ? currentReceivedQty : 0;
  if (receiveQty <= 0) return { inventory };

  const batchNumber = `PUR-${purchaseNumber.replace(/\W/g, '').slice(-6)}`;
  const result = applyReceiveToInventory(
    inventory,
    {
      name: line.itemName,
      category: line.inventoryCategory,
      warehouse,
      batchNumber,
      qtyKg: receiveQty,
      unitCostPkr: line.ratePerUnit,
      supplier: supplierName,
      sourceType: line.inventoryCategory === 'WASTE_PLASTIC' ? 'PURCHASED' : 'NEW',
      referenceNo: receiptNumber,
      notes: `Goods receipt for ${purchaseNumber}`,
    },
    operator,
    new Date().toISOString().split('T')[0]
  );

  const movement: StockMovement = {
    id: `sm-pur-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: new Date().toISOString().split('T')[0],
    type: 'PURCHASE_RECEIVE',
    itemId: result.item.id,
    itemName: result.item.name,
    batchNumber: result.item.batchNumber,
    warehouse,
    qtyKg: receiveQty,
    unitCost: line.ratePerUnit,
    totalCost: receiveQty * line.ratePerUnit,
    referenceNo: receiptNumber,
    operator,
    notes: `Purchase ${purchaseNumber}`,
  };

  return { inventory: result.inventory, movement };
}

export function deductPurchaseReturnStock(
  inventory: InventoryItem[],
  itemId: string | undefined,
  itemName: string,
  warehouse: string,
  qtyKg: number,
  purchaseNumber: string,
  returnRef: string,
  operator: string
): { inventory: InventoryItem[]; movement?: StockMovement } {
  let target = itemId ? inventory.find((i) => i.id === itemId) : undefined;
  if (!target) {
    target = inventory.find((i) => i.name === itemName && i.warehouse === warehouse);
  }
  if (!target || qtyKg <= 0) return { inventory };

  const next = inventory.map((i) => {
    if (i.id !== target!.id) return i;
    const availableKg = Math.max(0, i.availableKg - qtyKg);
    const status = computeStockStatus(availableKg, i.reorderLevelKg);
    return {
      ...i,
      availableKg,
      totalValue: availableKg * i.unitCost,
      status,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
  });

  const movement: StockMovement = {
    id: `sm-pret-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    type: 'PURCHASE_RETURN',
    itemId: target.id,
    itemName: target.name,
    batchNumber: target.batchNumber,
    warehouse,
    qtyKg,
    unitCost: target.unitCost,
    totalCost: qtyKg * target.unitCost,
    referenceNo: returnRef,
    operator,
    notes: `Return against ${purchaseNumber}`,
  };

  return { inventory: next, movement };
}