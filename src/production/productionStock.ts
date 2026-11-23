import type { InventoryItem, ProductionBatch, StockMovement } from '../types/erp';
import { computeProductionMetrics, getBatchBrand } from './productionUtils';

export function deductRawMaterialStock(
  inventory: InventoryItem[],
  rawItemId: string,
  qtyKg: number
): InventoryItem[] {
  return inventory.map((i) => {
    if (i.id !== rawItemId) return i;
    const remaining = Math.max(0, i.availableKg - qtyKg);
    return {
      ...i,
      availableKg: remaining,
      totalValue: remaining * i.unitCost,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
  });
}

export function restoreRawMaterialStock(
  inventory: InventoryItem[],
  rawItemId: string,
  qtyKg: number
): InventoryItem[] {
  return inventory.map((i) => {
    if (i.id !== rawItemId) return i;
    const newQty = i.availableKg + qtyKg;
    return {
      ...i,
      availableKg: newQty,
      totalValue: newQty * i.unitCost,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
  });
}

export function postFinishedGoodsOutput(
  inventory: InventoryItem[],
  batch: ProductionBatch,
  saleableKg: number,
  costPerKg: number
): InventoryItem[] {
  if (saleableKg <= 0) return inventory;
  const brand = getBatchBrand(batch);
  const finishedItemName = `${brand} ${batch.color} Shopping Bags`;
  const warehouse = batch.finishedGoodsWarehouse || 'Finished Goods Hall D';
  const existing = inventory.find(
    (i) =>
      i.category === 'FINISHED_GOODS' &&
      i.name.toLowerCase() === finishedItemName.toLowerCase() &&
      i.color === batch.color &&
      i.warehouse === warehouse
  );
  if (existing) {
    return inventory.map((i) => {
      if (i.id !== existing.id) return i;
      const newQty = i.availableKg + saleableKg;
      return {
        ...i,
        availableKg: newQty,
        unitCost: costPerKg,
        totalValue: newQty * costPerKg,
        batchNumber: batch.outputBatchNumber,
        lastUpdated: new Date().toISOString().split('T')[0],
        sourceType: batch.materialSource,
      };
    });
  }
  const newFG: InventoryItem = {
    id: 'inv-fg-' + batch.id,
    name: finishedItemName,
    category: 'FINISHED_GOODS',
    warehouse,
    availableKg: saleableKg,
    reservedKg: 0,
    unitCost: costPerKg,
    totalValue: saleableKg * costPerKg,
    batchNumber: batch.outputBatchNumber,
    status: 'Healthy',
    reorderLevelKg: 400,
    lastUpdated: new Date().toISOString().split('T')[0],
    sourceType: batch.materialSource,
    color: batch.color,
  };
  return [newFG, ...inventory];
}

export function reverseFinishedGoodsOutput(
  inventory: InventoryItem[],
  batch: ProductionBatch,
  saleableKg: number
): InventoryItem[] {
  const brand = getBatchBrand(batch);
  const finishedItemName = `${brand} ${batch.color} Shopping Bags`;
  const warehouse = batch.finishedGoodsWarehouse || 'Finished Goods Hall D';
  return inventory.map((i) => {
    if (
      i.category === 'FINISHED_GOODS' &&
      i.name.toLowerCase() === finishedItemName.toLowerCase() &&
      i.warehouse === warehouse
    ) {
      const newQty = Math.max(0, i.availableKg - saleableKg);
      return { ...i, availableKg: newQty, totalValue: newQty * i.unitCost };
    }
    return i;
  });
}

export function buildProductionMovements(
  batch: ProductionBatch,
  rawItem: InventoryItem,
  operator: string
): StockMovement[] {
  const ts = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const materialCost = batch.rawMaterialQtyKg * batch.rawMaterialCostPerKg;
  const consume: StockMovement = {
    id: 'sm-prod-consume-' + batch.id,
    date: ts,
    type: 'PRODUCTION_CONSUME',
    itemId: rawItem.id,
    itemName: rawItem.name,
    batchNumber: rawItem.batchNumber,
    warehouse: batch.inputWarehouse || rawItem.warehouse,
    qtyKg: batch.rawMaterialQtyKg,
    unitCost: batch.rawMaterialCostPerKg,
    totalCost: materialCost,
    referenceNo: batch.batchNumber,
    operator,
    notes: `Production consume ${batch.batchNumber} (${batch.materialSource})`,
  };
  const output: StockMovement = {
    id: 'sm-prod-out-' + batch.id,
    date: ts,
    type: 'PRODUCTION_OUTPUT',
    itemId: rawItem.id,
    itemName: `${getBatchBrand(batch)} ${batch.color} Bags`,
    batchNumber: batch.outputBatchNumber,
    warehouse: batch.finishedGoodsWarehouse || 'Finished Goods Hall D',
    qtyKg: batch.finishedGoodsOutputKg,
    unitCost: batch.costPerKg,
    totalCost: batch.finishedGoodsOutputKg * batch.costPerKg,
    referenceNo: batch.batchNumber,
    operator,
    notes: `Saleable finished output — rejected ${batch.rejectedOutputKg} kg excluded`,
  };
  return [consume, output];
}

export function rawMaterialCostForBatch(batch: ProductionBatch, rawItem?: InventoryItem): number {
  const costPerKg = batch.rawMaterialCostPerKg || rawItem?.unitCost || 0;
  return batch.rawMaterialQtyKg * costPerKg;
}

export function refreshBatchCosts(batch: ProductionBatch, rawItem?: InventoryItem): ProductionBatch {
  const rawCostPerKg = batch.rawMaterialCostPerKg || rawItem?.unitCost || 0;
  const metrics = computeProductionMetrics(
    batch.rawMaterialQtyKg,
    batch.finishedGoodsOutputKg,
    batch.rejectedOutputKg,
    batch.reusableByproductKg,
    rawCostPerKg,
    {
      laborCost: batch.laborCost,
      electricityCost: batch.electricityCost,
      machineCost: batch.machineCost,
      maintenanceCost: batch.maintenanceCost,
      packagingCost: batch.packagingCost,
      transportCost: batch.transportCost,
      otherCosts: batch.otherCosts,
    }
  );
  return {
    ...batch,
    rawMaterialCostPerKg: rawCostPerKg,
    processingLossKg: metrics.processingLossKg,
    yieldPercentage: metrics.yieldPercentage,
    totalCost: metrics.totalCost,
    costPerKg: metrics.costPerKg,
  };
}