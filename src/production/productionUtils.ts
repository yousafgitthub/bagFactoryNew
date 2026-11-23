import type {
  InventoryItem,
  ProductionBatch,
  ProductionBatchStatus,
  ProductionPlan,
  ProductionSettings,
  ProductionSource,
} from '../types/erp';

export interface ProductionCostInput {
  rawMaterialCost: number;
  laborCost: number;
  electricityCost: number;
  machineCost: number;
  maintenanceCost: number;
  packagingCost: number;
  transportCost: number;
  otherCosts: number;
}

export interface ProductionMetrics {
  processingLossKg: number;
  lossPercentage: number;
  yieldPercentage: number;
  rawMaterialCost: number;
  conversionCost: number;
  totalCost: number;
  costPerKg: number;
}

export function getBatchBrand(batch: ProductionBatch): string {
  return batch.productName;
}

export function completedProductionBatches(batches: ProductionBatch[]): ProductionBatch[] {
  return batches.filter((b) => b.status === 'Completed');
}

export function activeProductionBatches(batches: ProductionBatch[]): ProductionBatch[] {
  return batches.filter((b) => b.status === 'In Progress');
}

export function computeProductionLoss(
  inputKg: number,
  finishedKg: number,
  rejectedKg: number,
  byproductKg: number
): { lossKg: number; lossPct: number; yieldPct: number } {
  const saleable = Math.max(0, finishedKg);
  const lossKg = Math.max(0, inputKg - saleable - Math.max(0, byproductKg));
  const yieldPct = inputKg > 0 ? Number(((saleable / inputKg) * 100).toFixed(2)) : 0;
  const lossPct = inputKg > 0 ? Number(((lossKg / inputKg) * 100).toFixed(2)) : 0;
  return { lossKg, lossPct, yieldPct };
}

export function computeProductionMetrics(
  inputKg: number,
  finishedKg: number,
  rejectedKg: number,
  byproductKg: number,
  rawCostPerKg: number,
  costs: Omit<ProductionCostInput, 'rawMaterialCost'>
): ProductionMetrics {
  const rawMaterialCost = inputKg * rawCostPerKg;
  const conversionCost =
    costs.laborCost +
    costs.electricityCost +
    costs.machineCost +
    costs.maintenanceCost +
    costs.packagingCost +
    costs.transportCost +
    costs.otherCosts;
  const totalCost = rawMaterialCost + conversionCost;
  const { lossKg, lossPct, yieldPct } = computeProductionLoss(inputKg, finishedKg, rejectedKg, byproductKg);
  const costPerKg = finishedKg > 0 ? Number((totalCost / finishedKg).toFixed(2)) : 0;
  return {
    processingLossKg: lossKg,
    lossPercentage: lossPct,
    yieldPercentage: yieldPct,
    rawMaterialCost,
    conversionCost,
    totalCost,
    costPerKg,
  };
}

export function validateProductionOutput(
  inputKg: number,
  finishedKg: number,
  rejectedKg: number,
  byproductKg: number
): { valid: boolean; message?: string } {
  if (inputKg <= 0) return { valid: false, message: 'Input quantity must be greater than zero' };
  if (finishedKg < 0 || rejectedKg < 0 || byproductKg < 0) {
    return { valid: false, message: 'Quantities cannot be negative' };
  }
  if (finishedKg + rejectedKg + byproductKg > inputKg + 0.001) {
    return { valid: false, message: 'Finished + rejected + byproduct cannot exceed input' };
  }
  return { valid: true };
}

export function validateRawMaterialForSource(
  item: InventoryItem | undefined,
  source: ProductionSource
): { valid: boolean; message?: string } {
  if (!item) return { valid: false, message: 'Raw material batch not found' };
  if (source === 'NEW' && item.category !== 'NEW_BRANDED') {
    return { valid: false, message: 'NEW source requires New Branded raw material only' };
  }
  if (source === 'RECYCLED' && item.category !== 'RECYCLED_RAW') {
    return { valid: false, message: 'RECYCLED source requires Recycled raw material only' };
  }
  if (item.category === 'WASTE_PLASTIC' || item.category === 'FINISHED_GOODS') {
    return { valid: false, message: 'Waste and finished goods cannot be production inputs' };
  }
  return { valid: true };
}

export function estimateInputFromPlan(plannedOutputKg: number, targetYieldPct: number): number {
  if (targetYieldPct <= 0) return plannedOutputKg;
  return Number((plannedOutputKg / (targetYieldPct / 100)).toFixed(2));
}

export function generateProductionBatchNumber(batches: ProductionBatch[], settings: ProductionSettings): string {
  const year = new Date().getFullYear();
  const prefix = settings.batchNumberPrefix || 'PROD';
  const maxSeq = batches.reduce((max, b) => {
    const m = b.batchNumber.match(new RegExp(`^${prefix}-${year}-(\\d+)$`));
    if (m) return Math.max(max, parseInt(m[1], 10));
    return max;
  }, settings.batchNumberNextSeq - 1);
  const next = maxSeq + 1;
  return `${prefix}-${year}-${String(next).padStart(4, '0')}`;
}

export function generateProductionPlanNumber(plans: ProductionPlan[], settings: ProductionSettings): string {
  const year = new Date().getFullYear();
  const prefix = settings.planNumberPrefix || 'PLAN';
  const maxSeq = plans.reduce((max, p) => {
    const m = p.planNumber.match(new RegExp(`^${prefix}-${year}-(\\d+)$`));
    if (m) return Math.max(max, parseInt(m[1], 10));
    return max;
  }, settings.planNumberNextSeq - 1);
  return `${prefix}-${year}-${String(maxSeq + 1).padStart(4, '0')}`;
}

export function generateProductionOrderNumber(
  orders: { orderNumber: string }[],
  settings: ProductionSettings
): string {
  const year = new Date().getFullYear();
  const prefix = settings.orderNumberPrefix || 'PO';
  const maxSeq = orders.reduce((max, o) => {
    const m = o.orderNumber.match(new RegExp(`^${prefix}-${year}-(\\d+)$`));
    if (m) return Math.max(max, parseInt(m[1], 10));
    return max;
  }, settings.orderNumberNextSeq - 1);
  return `${prefix}-${year}-${String(maxSeq + 1).padStart(4, '0')}`;
}

export function isLossAboveThreshold(batch: ProductionBatch, thresholdPct: number): boolean {
  if (batch.rawMaterialQtyKg <= 0) return false;
  const lossPct = (batch.processingLossKg / batch.rawMaterialQtyKg) * 100;
  return lossPct >= thresholdPct;
}

export function aggregateProductionKpis(batches: ProductionBatch[]) {
  const completed = completedProductionBatches(batches);
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const todayKg = completed
    .filter((b) => b.productionDate === today)
    .reduce((a, b) => a + b.finishedGoodsOutputKg, 0);
  const monthKg = completed
    .filter((b) => b.productionDate.startsWith(month))
    .reduce((a, b) => a + b.finishedGoodsOutputKg, 0);
  const consumed = completed.reduce((a, b) => a + b.rawMaterialQtyKg, 0);
  const finished = completed.reduce((a, b) => a + b.finishedGoodsOutputKg, 0);
  const loss = completed.reduce((a, b) => a + b.processingLossKg, 0);
  const avgYield =
    completed.length > 0
      ? completed.reduce((a, b) => a + b.yieldPercentage, 0) / completed.length
      : 0;
  const totalCost = completed.reduce((a, b) => a + b.totalCost, 0);
  return {
    totalBatches: batches.length,
    completedCount: completed.length,
    todayKg,
    monthKg,
    consumedKg: consumed,
    finishedKg: finished,
    lossKg: loss,
    avgYield: Number(avgYield.toFixed(2)),
    totalCost,
  };
}

export function normalizeLegacyBatch(batch: ProductionBatch): ProductionBatch {
  const legacyStatus = batch.status as string;
  return {
    ...batch,
    rejectedOutputKg: batch.rejectedOutputKg ?? 0,
    reusableByproductKg: batch.reusableByproductKg ?? 0,
    maintenanceCost: batch.maintenanceCost ?? 0,
    packagingCost: batch.packagingCost ?? 0,
    transportCost: batch.transportCost ?? 0,
    rawMaterialCostPerKg: batch.rawMaterialCostPerKg ?? 0,
    inputWarehouse: batch.inputWarehouse ?? '',
    finishedGoodsWarehouse: batch.finishedGoodsWarehouse ?? 'Finished Goods Hall D',
    rawStockDeducted:
      batch.rawStockDeducted ?? (legacyStatus === 'Completed' || legacyStatus === 'In Progress'),
    finishedStockPosted: batch.finishedStockPosted ?? legacyStatus === 'Completed',
    timeline: batch.timeline ?? [],
    status: (legacyStatus === 'Planned' ? 'Draft' : batch.status) as ProductionBatchStatus,
  };
}