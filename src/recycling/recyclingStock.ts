import type { InventoryItem, RecyclingBatch, RecyclingOutputLine, StockMovement } from '../types/erp';

export function deductWasteStock(
  inventory: InventoryItem[],
  wasteItemId: string,
  qtyKg: number
): InventoryItem[] {
  return inventory.map((i) => {
    if (i.id !== wasteItemId) return i;
    const remaining = Math.max(0, i.availableKg - qtyKg);
    return {
      ...i,
      availableKg: remaining,
      totalValue: remaining * i.unitCost,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
  });
}

export function restoreWasteStock(
  inventory: InventoryItem[],
  wasteItemId: string,
  qtyKg: number
): InventoryItem[] {
  return inventory.map((i) => {
    if (i.id !== wasteItemId) return i;
    const newQty = i.availableKg + qtyKg;
    return {
      ...i,
      availableKg: newQty,
      totalValue: newQty * i.unitCost,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
  });
}

export function postRecycledOutputs(
  inventory: InventoryItem[],
  batch: RecyclingBatch,
  outputs: RecyclingOutputLine[]
): InventoryItem[] {
  let next = [...inventory];
  for (const line of outputs) {
    const existing = next.find(
      (i) =>
        i.category === 'RECYCLED_RAW' &&
        i.name.toLowerCase() === line.materialName.toLowerCase() &&
        i.warehouse === line.outputWarehouse
    );
    if (existing) {
      next = next.map((i) => {
        if (i.id !== existing.id) return i;
        const newQty = i.availableKg + line.outputQtyKg;
        return {
          ...i,
          availableKg: newQty,
          unitCost: line.costPerKg,
          totalValue: newQty * line.costPerKg,
          batchNumber: batch.batchNumber,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      });
    } else {
      const newRecItem: InventoryItem = {
        id: 'inv-rec-' + Date.now() + '-' + line.id,
        name: line.materialName,
        category: 'RECYCLED_RAW',
        warehouse: line.outputWarehouse,
        availableKg: line.outputQtyKg,
        reservedKg: 0,
        unitCost: line.costPerKg,
        totalValue: line.outputQtyKg * line.costPerKg,
        supplier: 'Internal Recycling Line',
        batchNumber: batch.batchNumber,
        status: 'Healthy',
        reorderLevelKg: 400,
        lastUpdated: new Date().toISOString().split('T')[0],
        sourceType: 'RECYCLED',
      };
      next = [newRecItem, ...next];
    }
  }
  return next;
}

export function buildRecyclingMovements(
  batch: RecyclingBatch,
  wasteItem: InventoryItem,
  outputs: RecyclingOutputLine[],
  operator: string
): StockMovement[] {
  const ts = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const wasteCost = batch.inputWasteQtyKg * batch.wasteCostPerKg;
  const consume: StockMovement = {
    id: 'sm-rec-consume-' + batch.id,
    date: ts,
    type: 'RECYCLING_CONSUME',
    itemId: wasteItem.id,
    itemName: wasteItem.name,
    batchNumber: wasteItem.batchNumber,
    warehouse: batch.inputWarehouse || wasteItem.warehouse,
    qtyKg: batch.inputWasteQtyKg,
    unitCost: batch.wasteCostPerKg,
    totalCost: wasteCost,
    referenceNo: batch.batchNumber,
    operator,
    notes: `Recycling batch ${batch.batchNumber} waste consumption`,
  };
  const outputMoves: StockMovement[] = outputs.map((line, idx) => ({
    id: 'sm-rec-out-' + batch.id + '-' + idx,
    date: ts,
    type: 'RECYCLING_OUTPUT' as const,
    itemId: 'inv-rec-ref',
    itemName: line.materialName,
    batchNumber: batch.batchNumber,
    warehouse: line.outputWarehouse,
    qtyKg: line.outputQtyKg,
    unitCost: line.costPerKg,
    totalCost: line.allocatedCost,
    referenceNo: batch.batchNumber,
    operator,
    notes: `Recycled output from ${batch.batchNumber}`,
  }));
  return [consume, ...outputMoves];
}