import {
  allocateOutputCosts,
  computeRecyclingMetrics,
  validateOutputAgainstInput,
  generateRecyclingBatchNumber,
  getTotalOutputKg,
} from '../recyclingUtils';
import type { RecyclingBatch, RecyclingSettings } from '../../types/erp';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const settings: RecyclingSettings = {
  batchNumberPrefix: 'REC',
  batchNumberNextSeq: 44,
  lossWarningThresholdPct: 12,
  costCategories: [],
};

// Cost allocation must split total batch cost proportionally
const allocated = allocateOutputCosts(10000, [
  { id: 'a', materialName: 'A', outputQtyKg: 300, outputWarehouse: 'Silo C' },
  { id: 'b', materialName: 'B', outputQtyKg: 150, outputWarehouse: 'Silo C' },
]);
assert(allocated[0].allocatedCost + allocated[1].allocatedCost === 10000, 'allocation sums to total');
assert(Math.abs(allocated[0].costPerKg - 22.22) < 0.05, 'output A cost per kg');

// Phase 3 reference metrics: 500 in, 450 out, Rs 40k waste + 6500 processing
const metrics = computeRecyclingMetrics(
  500,
  [{ id: 'o1', materialName: 'Type A', outputQtyKg: 450, outputWarehouse: 'Silo', allocatedCost: 0, costPerKg: 0 }],
  {
    wasteMaterialCost: 40000,
    laborCost: 2000,
    electricityCost: 3000,
    machineCost: 1000,
    transportCost: 0,
    maintenanceCost: 0,
    otherCosts: 500,
  }
);
assert(metrics.processingLossKg === 50, 'loss kg');
assert(metrics.yieldPercentage === 90, 'yield');
assert(metrics.totalBatchCost === 46500, 'total batch cost');
assert(metrics.blendedCostPerKg === 103.33, 'blended cost per kg');

const invalid = validateOutputAgainstInput(100, [{ outputQtyKg: 110 }]);
assert(!invalid.valid, 'reject output > input');

const batchNum = generateRecyclingBatchNumber(
  [{ batchNumber: 'REC-2026-0043' } as RecyclingBatch],
  settings
);
assert(batchNum === 'REC-2026-0044', 'batch sequence');

const multiOutBatch = {
  outputs: [
    { outputQtyKg: 300 },
    { outputQtyKg: 150 },
  ],
} as RecyclingBatch;
assert(getTotalOutputKg(multiOutBatch) === 450, 'total output from lines');

console.log('recyclingUtils.test.ts: all assertions passed');