import {
  weightedAverageUnitCost,
  applyReceiveToInventory,
  applyTransfer,
  computeStockStatus,
} from '../inventoryUtils';
import { InventoryItem } from '../../types/erp';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function runInventoryUtilsTests() {
  assert(weightedAverageUnitCost(100, 200, 100, 300) === 250, 'weighted average should be 250');
  assert(computeStockStatus(0, 100) === 'Critical', 'zero qty is critical');
  assert(computeStockStatus(50, 100) === 'Low Stock', 'below reorder is low');

  const base: InventoryItem[] = [
    {
      id: 'inv-1',
      name: 'HDPE Test',
      category: 'NEW_BRANDED',
      warehouse: 'Raw Material Store A',
      availableKg: 100,
      reservedKg: 0,
      unitCost: 200,
      totalValue: 20000,
      batchNumber: 'B-1',
      status: 'Healthy',
      reorderLevelKg: 50,
      lastUpdated: '2026-11-01',
    },
  ];

  const recv = applyReceiveToInventory(
    base,
    {
      name: 'HDPE Test',
      category: 'NEW_BRANDED',
      warehouse: 'Raw Material Store A',
      batchNumber: 'B-1',
      qtyKg: 100,
      unitCostPkr: 300,
      referenceNo: 'T-1',
    },
    'Tester',
    '2026-11-20'
  );
  assert(recv.item.availableKg === 200, 'receive merge qty');
  assert(recv.item.unitCost === 250, 'receive merge cost');
  assert(!recv.isNewLine, 'should merge existing line');

  const tr = applyTransfer(base, {
    itemId: 'inv-1',
    fromWarehouse: 'Raw Material Store A',
    toWarehouse: 'Dispatch Staging E',
    qtyKg: 40,
  });
  if ('error' in tr) throw new Error(tr.error);
  assert(tr.source.availableKg === 60, 'source reduced');
  assert(tr.dest.warehouse === 'Dispatch Staging E' && tr.dest.availableKg === 40, 'dest created');
}

runInventoryUtilsTests();
console.log('inventoryUtils tests: OK');