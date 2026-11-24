import type { InventoryItem, SalesInvoice, SalesInvoiceItem, StockMovement, SalesReturnItem } from '../types/erp';
import { computeStockStatus } from '../inventory/inventoryUtils';

export function resolveFinishedGoodsItem(
  inventory: InventoryItem[],
  line: SalesInvoiceItem,
  warehouse?: string
): InventoryItem | undefined {
  if (line.inventoryItemId) {
    const byId = inventory.find((i) => i.id === line.inventoryItemId);
    if (byId?.category === 'FINISHED_GOODS') return byId;
  }
  const matches = inventory.filter(
    (i) =>
      i.category === 'FINISHED_GOODS' &&
      i.name === line.productName &&
      (!warehouse || i.warehouse === warehouse)
  );
  if (matches.length === 1) return matches[0];
  if (line.batchNumber) {
    return matches.find((i) => i.batchNumber === line.batchNumber) ?? matches[0];
  }
  return matches[0];
}

export function deductFinishedGoodsForSale(
  inventory: InventoryItem[],
  lines: SalesInvoiceItem[],
  warehouse?: string
): InventoryItem[] {
  let next = [...inventory];
  lines.forEach((line) => {
    const item = resolveFinishedGoodsItem(next, line, warehouse);
    if (!item) return;
    next = next.map((i) => {
      if (i.id !== item.id) return i;
      const availableKg = Math.max(0, i.availableKg - line.qtyKg);
      const status = computeStockStatus(availableKg, i.reorderLevelKg);
      return {
        ...i,
        availableKg,
        totalValue: availableKg * i.unitCost,
        status,
        lastUpdated: new Date().toISOString().split('T')[0],
      };
    });
  });
  return next;
}

export function restoreFinishedGoodsForCancel(
  inventory: InventoryItem[],
  lines: SalesInvoiceItem[],
  warehouse?: string
): InventoryItem[] {
  let next = [...inventory];
  lines.forEach((line) => {
    const item = resolveFinishedGoodsItem(next, line, warehouse);
    if (!item) return;
    next = next.map((i) => {
      if (i.id !== item.id) return i;
      const availableKg = i.availableKg + line.qtyKg;
      const status = computeStockStatus(availableKg, i.reorderLevelKg);
      return {
        ...i,
        availableKg,
        totalValue: availableKg * i.unitCost,
        status,
        lastUpdated: new Date().toISOString().split('T')[0],
      };
    });
  });
  return next;
}

export function postSaleableReturnStock(
  inventory: InventoryItem[],
  item: SalesReturnItem,
  warehouse: string
): InventoryItem[] {
  if (item.condition !== 'Saleable' || item.qtyReturnedKg <= 0) return inventory;
  const existing = inventory.find(
    (i) =>
      i.category === 'FINISHED_GOODS' &&
      i.name === item.productName &&
      i.warehouse === warehouse &&
      (item.batchNumber ? i.batchNumber === item.batchNumber : true)
  );
  if (existing) {
    return inventory.map((i) => {
      if (i.id !== existing.id) return i;
      const availableKg = i.availableKg + item.qtyReturnedKg;
      return {
        ...i,
        availableKg,
        totalValue: availableKg * i.unitCost,
        status: computeStockStatus(availableKg, i.reorderLevelKg),
        lastUpdated: new Date().toISOString().split('T')[0],
      };
    });
  }
  const newItem: InventoryItem = {
    id: 'inv-fg-ret-' + Date.now(),
    name: item.productName,
    category: 'FINISHED_GOODS',
    warehouse,
    availableKg: item.qtyReturnedKg,
    reservedKg: 0,
    unitCost: 0,
    totalValue: 0,
    batchNumber: item.batchNumber || 'FG-RETURN',
    status: 'Healthy',
    reorderLevelKg: 400,
    lastUpdated: new Date().toISOString().split('T')[0],
    color: item.color,
  };
  return [newItem, ...inventory];
}

export function buildSalesDispatchMovements(
  invoice: SalesInvoice,
  lines: SalesInvoiceItem[],
  inventory: InventoryItem[],
  operator: string
): StockMovement[] {
  const ts = invoice.saleDate + ' 10:00';
  return lines.map((line, idx) => {
    const item = resolveFinishedGoodsItem(inventory, line, invoice.dispatchWarehouse);
    return {
      id: `sm-sale-${invoice.id}-${idx}`,
      date: ts,
      type: 'SALES_DISPATCH' as const,
      itemId: item?.id || line.inventoryItemId || 'fg',
      itemName: line.productName,
      batchNumber: line.batchNumber || item?.batchNumber || 'FG-DISP',
      warehouse: item?.warehouse || invoice.dispatchWarehouse || 'Finished Goods Hall D',
      qtyKg: line.qtyKg,
      unitCost: item?.unitCost ?? line.ratePerKg,
      totalCost: line.totalAmount,
      referenceNo: invoice.invoiceNumber,
      operator,
      notes: `Sales dispatch to ${invoice.customerName}`,
    };
  });
}

export function buildSalesRestoreMovements(
  invoice: SalesInvoice,
  lines: SalesInvoiceItem[],
  inventory: InventoryItem[],
  operator: string
): StockMovement[] {
  const ts = new Date().toISOString().replace('T', ' ').substring(0, 16);
  return lines.map((line, idx) => {
    const item = resolveFinishedGoodsItem(inventory, line, invoice.dispatchWarehouse);
    return {
      id: `sm-sale-cancel-${invoice.id}-${idx}`,
      date: ts,
      type: 'SALES_CANCEL_RESTORE' as const,
      itemId: item?.id || 'fg',
      itemName: line.productName,
      batchNumber: line.batchNumber || item?.batchNumber || 'FG-DISP',
      warehouse: item?.warehouse || invoice.dispatchWarehouse || 'Finished Goods Hall D',
      qtyKg: line.qtyKg,
      unitCost: item?.unitCost ?? line.ratePerKg,
      totalCost: line.totalAmount,
      referenceNo: invoice.invoiceNumber,
      operator,
      notes: `Cancelled invoice stock restore`,
    };
  });
}

export function buildSalesReturnMovements(
  returnRef: string,
  item: SalesReturnItem,
  warehouse: string,
  operator: string
): StockMovement | null {
  if (item.condition !== 'Saleable') return null;
  return {
    id: 'sm-sale-ret-' + returnRef + '-' + item.id,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    type: 'SALES_RETURN',
    itemId: item.inventoryItemId || 'fg',
    itemName: item.productName,
    batchNumber: item.batchNumber || 'FG-RETURN',
    warehouse,
    qtyKg: item.qtyReturnedKg,
    unitCost: 0,
    totalCost: 0,
    referenceNo: returnRef,
    operator,
    notes: `Saleable return restocked`,
  };
}