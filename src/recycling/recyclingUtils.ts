import type { RecyclingBatch, RecyclingOutputLine, RecyclingSettings } from '../types/erp';

export interface RecyclingCostInput {
  wasteMaterialCost: number;
  laborCost: number;
  electricityCost: number;
  machineCost: number;
  transportCost: number;
  maintenanceCost: number;
  otherCosts: number;
}

export interface RecyclingMetrics {
  totalOutputKg: number;
  processingLossKg: number;
  yieldPercentage: number;
  lossPercentage: number;
  totalProcessingCost: number;
  totalBatchCost: number;
  blendedCostPerKg: number;
}

export function getBatchOutputs(batch: RecyclingBatch): RecyclingOutputLine[] {
  if (batch.outputs && batch.outputs.length > 0) {
    return batch.outputs;
  }
  if (batch.outputQtyKg > 0 && batch.outputMaterialType) {
    return [
      {
        id: `${batch.id}-out-1`,
        materialName: batch.outputMaterialType,
        outputQtyKg: batch.outputQtyKg,
        outputWarehouse: batch.destinationWarehouse,
        allocatedCost: batch.totalBatchCost,
        costPerKg: batch.costPerKg,
      },
    ];
  }
  return [];
}

export function getTotalOutputKg(batch: RecyclingBatch): number {
  return getBatchOutputs(batch).reduce((acc, o) => acc + o.outputQtyKg, 0);
}

export function computeWasteMaterialCost(inputKg: number, costPerKg: number): number {
  return inputKg * costPerKg;
}

export function computeProcessingCost(costs: RecyclingCostInput): number {
  return (
    costs.laborCost +
    costs.electricityCost +
    costs.machineCost +
    costs.transportCost +
    costs.maintenanceCost +
    costs.otherCosts
  );
}

export function computeRecyclingMetrics(
  inputKg: number,
  outputs: RecyclingOutputLine[],
  costs: RecyclingCostInput
): RecyclingMetrics {
  const totalOutputKg = outputs.reduce((acc, o) => acc + o.outputQtyKg, 0);
  const wasteMaterialCost = costs.wasteMaterialCost;
  const totalProcessingCost = computeProcessingCost(costs);
  const totalBatchCost = wasteMaterialCost + totalProcessingCost;
  const processingLossKg = Math.max(0, inputKg - totalOutputKg);
  const yieldPercentage = inputKg > 0 ? Number(((totalOutputKg / inputKg) * 100).toFixed(2)) : 0;
  const lossPercentage = inputKg > 0 ? Number(((processingLossKg / inputKg) * 100).toFixed(2)) : 0;
  const blendedCostPerKg =
    totalOutputKg > 0 ? Number((totalBatchCost / totalOutputKg).toFixed(2)) : 0;

  return {
    totalOutputKg,
    processingLossKg,
    yieldPercentage,
    lossPercentage,
    totalProcessingCost,
    totalBatchCost,
    blendedCostPerKg,
  };
}

/** Proportional cost allocation by output weight — never duplicate full batch cost on each line. */
export function allocateOutputCosts(
  totalBatchCost: number,
  outputs: Omit<RecyclingOutputLine, 'allocatedCost' | 'costPerKg'>[]
): RecyclingOutputLine[] {
  const totalOut = outputs.reduce((acc, o) => acc + o.outputQtyKg, 0);
  if (totalOut <= 0) {
    return outputs.map((o) => ({
      ...o,
      allocatedCost: 0,
      costPerKg: 0,
    }));
  }
  return outputs.map((o) => {
    const allocatedCost = Number(((totalBatchCost * o.outputQtyKg) / totalOut).toFixed(2));
    const costPerKg = o.outputQtyKg > 0 ? Number((allocatedCost / o.outputQtyKg).toFixed(2)) : 0;
    return { ...o, allocatedCost, costPerKg };
  });
}

export function validateOutputAgainstInput(
  inputKg: number,
  outputs: { outputQtyKg: number }[]
): { valid: boolean; message?: string } {
  if (inputKg <= 0) {
    return { valid: false, message: 'Input quantity must be greater than zero' };
  }
  const totalOut = outputs.reduce((acc, o) => acc + o.outputQtyKg, 0);
  if (totalOut > inputKg) {
    return { valid: false, message: 'Total output cannot exceed input quantity' };
  }
  if (outputs.some((o) => o.outputQtyKg <= 0)) {
    return { valid: false, message: 'Each output quantity must be greater than zero' };
  }
  const loss = inputKg - totalOut;
  if (loss < 0) {
    return { valid: false, message: 'Processing loss cannot be negative' };
  }
  return { valid: true };
}

export function generateRecyclingBatchNumber(
  existing: RecyclingBatch[],
  settings: RecyclingSettings,
  year = new Date().getFullYear()
): string {
  const maxSeq = existing.reduce((max, b) => {
    const match = b.batchNumber.match(/^REC-(\d{4})-(\d+)$/);
    if (!match) return max;
    const seq = parseInt(match[2], 10);
    return seq > max ? seq : max;
  }, settings.batchNumberNextSeq - 1);
  const next = maxSeq + 1;
  return `${settings.batchNumberPrefix}-${year}-${String(next).padStart(4, '0')}`;
}

export function isLossAboveThreshold(batch: RecyclingBatch, thresholdPct: number): boolean {
  if (batch.inputWasteQtyKg <= 0) return false;
  const lossPct = (batch.processingLossKg / batch.inputWasteQtyKg) * 100;
  return lossPct >= thresholdPct;
}

export function completedBatchesOnly(batches: RecyclingBatch[]): RecyclingBatch[] {
  return batches.filter((b) => b.status === 'Completed');
}

export function aggregateRecyclingKpis(batches: RecyclingBatch[]) {
  const completed = completedBatchesOnly(batches);
  const totalBatches = batches.length;
  const totalWasteInput = completed.reduce((a, b) => a + b.inputWasteQtyKg, 0);
  const totalOutput = completed.reduce((a, b) => a + getTotalOutputKg(b), 0);
  const totalLoss = completed.reduce((a, b) => a + b.processingLossKg, 0);
  const avgYield =
    completed.length > 0
      ? Number((completed.reduce((a, b) => a + b.yieldPercentage, 0) / completed.length).toFixed(2))
      : 0;
  const totalCost = completed.reduce((a, b) => a + b.totalBatchCost, 0);
  const avgCostPerKg = totalOutput > 0 ? Number((totalCost / totalOutput).toFixed(2)) : 0;
  return {
    totalBatches,
    totalWasteInput,
    totalOutput,
    totalLoss,
    avgYield,
    totalCost,
    avgCostPerKg,
  };
}