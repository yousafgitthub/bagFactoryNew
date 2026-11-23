import {
  computeProductionMetrics,
  validateProductionOutput,
  validateRawMaterialForSource,
  generateProductionBatchNumber,
  estimateInputFromPlan,
} from '../productionUtils';
import type { InventoryItem, ProductionBatch, ProductionSettings } from '../../types/erp';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const settings: ProductionSettings = {
  batchNumberPrefix: 'PROD',
  batchNumberNextSeq: 3,
  orderNumberPrefix: 'PO',
  orderNumberNextSeq: 1,
  planNumberPrefix: 'PLAN',
  planNumberNextSeq: 1,
  defaultUnit: 'kg',
  lossWarningThresholdPct: 10,
  yieldTargetPct: 90,
  brands: ['ABHA'],
  colors: ['White'],
  productVariants: [],
  shifts: ['Morning'],
};

const newItem: InventoryItem = {
  id: 'inv-1',
  name: 'Virgin HDPE',
  category: 'NEW_BRANDED',
  warehouse: 'A',
  availableKg: 1000,
  reservedKg: 0,
  unitCost: 200,
  totalValue: 200000,
  batchNumber: 'N-1',
  status: 'Healthy',
  reorderLevelKg: 100,
  lastUpdated: '2026-11-01',
};

assert(validateRawMaterialForSource(newItem, 'NEW').valid, 'new item for NEW');
assert(!validateRawMaterialForSource(newItem, 'RECYCLED').valid, 'new item blocks RECYCLED');

const metrics = computeProductionMetrics(500, 450, 0, 0, 200, {
  laborCost: 5000,
  electricityCost: 3000,
  machineCost: 2000,
  maintenanceCost: 0,
  packagingCost: 0,
  transportCost: 0,
  otherCosts: 1000,
});
assert(metrics.processingLossKg === 50, 'loss kg');
assert(metrics.yieldPercentage === 90, 'yield');
assert(metrics.totalCost === 111000, 'total cost');
assert(metrics.costPerKg === 246.67, 'cost per kg');

assert(!validateProductionOutput(100, 110, 0, 0).valid, 'output > input');
assert(estimateInputFromPlan(450, 90) === 500, 'plan input estimate');

const num = generateProductionBatchNumber(
  [{ batchNumber: 'PROD-2026-0002' } as ProductionBatch],
  settings
);
assert(num === 'PROD-2026-0003', 'batch sequence');

console.log('productionUtils.test.ts: all assertions passed');