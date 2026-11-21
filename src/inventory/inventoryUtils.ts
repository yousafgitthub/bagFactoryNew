import { InventoryCategory, InventoryItem, StockStatus } from '../types/erp';
import { DEFAULT_REORDER_KG } from '../data/inventory';

export function computeStockStatus(availableKg: number, reorderLevelKg: number): StockStatus {
  if (availableKg <= 0) return 'Critical';
  if (availableKg < reorderLevelKg) return 'Low Stock';
  return 'Healthy';
}

/** Weighted-average unit cost (PKR/kg) when receiving into an existing balance line. */
export function weightedAverageUnitCost(
  existingQtyKg: number,
  existingUnitCost: number,
  receiveQtyKg: number,
  receiveUnitCost: number
): number {
  if (receiveQtyKg <= 0) return existingUnitCost;
  if (existingQtyKg <= 0) return receiveUnitCost;
  const totalValue = existingQtyKg * existingUnitCost + receiveQtyKg * receiveUnitCost;
  const totalQty = existingQtyKg + receiveQtyKg;
  return Math.round((totalValue / totalQty) * 100) / 100;
}

export function inventoryLineKey(item: Pick<InventoryItem, 'name' | 'category' | 'warehouse' | 'batchNumber'>): string {
  return `${item.category}|${item.warehouse}|${item.batchNumber}|${item.name}`;
}

export function findMatchingInventoryLine(
  inventory: InventoryItem[],
  match: Pick<InventoryItem, 'name' | 'category' | 'warehouse' | 'batchNumber'>
): InventoryItem | undefined {
  return inventory.find((i) => inventoryLineKey(i) === inventoryLineKey(match));
}

export function sumByCategory(
  inventory: InventoryItem[],
  category: InventoryCategory
): { qtyKg: number; valuePkr: number } {
  const rows = inventory.filter((i) => i.category === category);
  return {
    qtyKg: rows.reduce((a, i) => a + i.availableKg, 0),
    valuePkr: rows.reduce((a, i) => a + i.totalValue, 0),
  };
}

export function defaultReorderForCategory(category: InventoryCategory): number {
  return DEFAULT_REORDER_KG[category];
}

export interface ReceiveStockInput {
  name: string;
  category: InventoryCategory;
  warehouse: string;
  batchNumber: string;
  qtyKg: number;
  unitCostPkr: number;
  supplier?: string;
  reorderLevelKg?: number;
  color?: string;
  grade?: string;
  sourceType?: InventoryItem['sourceType'];
  referenceNo: string;
  notes?: string;
}

/** Pure receive merge — used in context and tests. */
export function applyReceiveToInventory(
  inventory: InventoryItem[],
  input: ReceiveStockInput,
  operator: string,
  todayIso: string
): { inventory: InventoryItem[]; item: InventoryItem; isNewLine: boolean } {
  const reorder = input.reorderLevelKg ?? defaultReorderForCategory(input.category);
  const existing = findMatchingInventoryLine(inventory, input);

  if (existing) {
    const newQty = existing.availableKg + input.qtyKg;
    const newCost = weightedAverageUnitCost(
      existing.availableKg,
      existing.unitCost,
      input.qtyKg,
      input.unitCostPkr
    );
    const updated: InventoryItem = {
      ...existing,
      availableKg: newQty,
      unitCost: newCost,
      totalValue: Math.round(newQty * newCost),
      lastUpdated: todayIso,
      status: computeStockStatus(newQty, existing.reorderLevelKg),
      supplier: input.supplier ?? existing.supplier,
    };
    return {
      inventory: inventory.map((i) => (i.id === existing.id ? updated : i)),
      item: updated,
      isNewLine: false,
    };
  }

  const newItem: InventoryItem = {
    id: `inv-${Date.now()}`,
    name: input.name,
    category: input.category,
    warehouse: input.warehouse,
    availableKg: input.qtyKg,
    reservedKg: 0,
    unitCost: input.unitCostPkr,
    totalValue: Math.round(input.qtyKg * input.unitCostPkr),
    supplier: input.supplier,
    batchNumber: input.batchNumber,
    status: computeStockStatus(input.qtyKg, reorder),
    reorderLevelKg: reorder,
    lastUpdated: todayIso,
    sourceType: input.sourceType,
    color: input.color,
    grade: input.grade,
  };
  return { inventory: [newItem, ...inventory], item: newItem, isNewLine: true };
}

export interface TransferInput {
  itemId: string;
  fromWarehouse: string;
  toWarehouse: string;
  qtyKg: number;
}

/** Inter-warehouse transfer with destination line create/merge (same batch/name/category). */
export function applyTransfer(
  inventory: InventoryItem[],
  input: TransferInput
): { inventory: InventoryItem[]; source: InventoryItem; dest: InventoryItem } | { error: string } {
  const source = inventory.find((i) => i.id === input.itemId && i.warehouse === input.fromWarehouse);
  if (!source) return { error: 'Source stock line not found' };
  if (source.availableKg < input.qtyKg) return { error: 'Insufficient stock' };
  if (input.fromWarehouse === input.toWarehouse) return { error: 'Source and destination must differ' };

  const afterSource = inventory.map((i) => {
    if (i.id === source.id) {
      const newQty = i.availableKg - input.qtyKg;
      return {
        ...i,
        availableKg: newQty,
        totalValue: Math.round(newQty * i.unitCost),
        status: computeStockStatus(newQty, i.reorderLevelKg),
      };
    }
    return i;
  });

  const destMatch = findMatchingInventoryLine(afterSource, {
    name: source.name,
    category: source.category,
    warehouse: input.toWarehouse,
    batchNumber: source.batchNumber,
  });

  let dest: InventoryItem;
  let finalInventory: InventoryItem[];

  if (destMatch) {
    const newQty = destMatch.availableKg + input.qtyKg;
    const newCost = weightedAverageUnitCost(
      destMatch.availableKg,
      destMatch.unitCost,
      input.qtyKg,
      source.unitCost
    );
    dest = {
      ...destMatch,
      availableKg: newQty,
      unitCost: newCost,
      totalValue: Math.round(newQty * newCost),
      status: computeStockStatus(newQty, destMatch.reorderLevelKg),
    };
    finalInventory = afterSource.map((i) => (i.id === destMatch.id ? dest : i));
  } else {
    dest = {
      ...source,
      id: `inv-tr-${Date.now()}`,
      warehouse: input.toWarehouse,
      availableKg: input.qtyKg,
      reservedKg: 0,
      totalValue: Math.round(input.qtyKg * source.unitCost),
      status: computeStockStatus(input.qtyKg, source.reorderLevelKg),
    };
    finalInventory = [dest, ...afterSource];
  }

  const updatedSource = finalInventory.find((i) => i.id === source.id)!;
  return { inventory: finalInventory, source: updatedSource, dest };
}