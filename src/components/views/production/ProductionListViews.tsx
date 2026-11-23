'use client';

import React, { useMemo } from 'react';
import { useERP } from '../../../context/ERPContext';
import { ProductionPageShell, BatchTable } from './ProductionPageShell';
import { ProductionStatusBadge } from './ProductionStatusBadge';
import { Button } from '../../common/Button';
import { activeProductionBatches, completedProductionBatches, getBatchBrand } from '../../../production/productionUtils';

export function ProductionActiveView() {
  const { productionBatches, setCurrentView, setSelectedEntityId, completeProductionBatch, cancelProductionBatch } = useERP();
  const rows = useMemo(() => activeProductionBatches(productionBatches), [productionBatches]);

  return (
    <ProductionPageShell title="Active Production" subtitle="In-progress batches — raw stock deducted on start; finished goods posted on complete.">
      <BatchTable
        headers={['Batch', 'Product', 'Source', 'Input kg', 'Out kg', 'Operator', 'Machine', 'Status', '']}
        rows={rows.map((b) => [
          b.batchNumber,
          `${getBatchBrand(b)} ${b.color}`,
          b.materialSource,
          b.rawMaterialQtyKg,
          b.finishedGoodsOutputKg,
          b.operator,
          b.machineName || '—',
          b.status,
        ])}
        onRowClick={(i) => {
          setSelectedEntityId(rows[i].id);
          setCurrentView('production-batch-detail');
        }}
      />
      <BatchActions rows={rows} onComplete={completeProductionBatch} onCancel={cancelProductionBatch} />
    </ProductionPageShell>
  );
}

export function ProductionCompletedView() {
  const { productionBatches, setCurrentView, setSelectedEntityId } = useERP();
  const rows = useMemo(() => completedProductionBatches(productionBatches), [productionBatches]);

  return (
    <ProductionPageShell title="Completed Production" subtitle="Historical completed runs with immutable inventory impact.">
      <BatchTable
        headers={['Batch', 'Date', 'Product', 'In', 'Out', 'Yield %', 'Cost/kg', 'Source']}
        rows={rows.map((b) => [
          b.batchNumber,
          b.productionDate,
          `${getBatchBrand(b)} ${b.color}`,
          b.rawMaterialQtyKg,
          b.finishedGoodsOutputKg,
          b.yieldPercentage,
          b.costPerKg,
          b.materialSource,
        ])}
        onRowClick={(i) => {
          setSelectedEntityId(rows[i].id);
          setCurrentView('production-batch-detail');
        }}
      />
    </ProductionPageShell>
  );
}

function BatchActions({
  rows,
  onComplete,
  onCancel,
}: {
  rows: ReturnType<typeof activeProductionBatches>;
  onComplete: (id: string) => void;
  onCancel: (id: string, reason: string) => void;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {rows.slice(0, 4).map((b) => (
        <div key={b.id} className="border rounded-lg px-3 py-2 bg-white flex items-center gap-2">
          <ProductionStatusBadge status={b.status} />
          <span>{b.batchNumber}</span>
          <Button size="sm" variant="primary" onClick={() => onComplete(b.id)}>
            Complete
          </Button>
          <Button size="sm" variant="outline" onClick={() => onCancel(b.id, 'Cancelled from active list')}>
            Cancel
          </Button>
        </div>
      ))}
    </div>
  );
}