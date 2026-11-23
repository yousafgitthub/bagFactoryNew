'use client';

import React from 'react';
import { useERP } from '../../../context/ERPContext';
import { ProductionPageShell } from './ProductionPageShell';
import { ProductionStatusBadge } from './ProductionStatusBadge';
import { Button } from '../../common/Button';
import { getBatchBrand } from '../../../production/productionUtils';

export function ProductionBatchDetailView() {
  const { productionBatches, stockMovements, selectedEntityId, setCurrentView } = useERP();
  const batch = productionBatches.find((b) => b.id === selectedEntityId);

  if (!batch) {
    return (
      <ProductionPageShell title="Batch detail" subtitle="Select a batch from the list.">
        <Button size="sm" onClick={() => setCurrentView('production')}>Back</Button>
      </ProductionPageShell>
    );
  }

  const moves = stockMovements.filter((m) => m.referenceNo === batch.batchNumber);

  return (
    <ProductionPageShell
      title={batch.batchNumber}
      subtitle={`${getBatchBrand(batch)} ${batch.color} — ${batch.materialSource} source`}
      actions={<Button size="sm" variant="outline" onClick={() => setCurrentView('production')}>Back</Button>}
    >
      <div className="flex items-center gap-2">
        <ProductionStatusBadge status={batch.status} />
        <span className="text-xs text-[#64748B]">{batch.productionDate} · {batch.operator}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-4 text-xs">
        <Card title="Raw material">
          <Row label="Item" value={batch.rawMaterialName} />
          <Row label="Input kg" value={String(batch.rawMaterialQtyKg)} />
          <Row label="Cost/kg" value={`Rs. ${batch.rawMaterialCostPerKg}`} />
          <Row label="Warehouse" value={batch.inputWarehouse} />
        </Card>
        <Card title="Finished production">
          <Row label="Saleable output kg" value={String(batch.finishedGoodsOutputKg)} />
          <Row label="Rejected kg" value={String(batch.rejectedOutputKg)} />
          <Row label="FG warehouse" value={batch.finishedGoodsWarehouse} />
          <Row label="Output batch" value={batch.outputBatchNumber} />
        </Card>
        <Card title="Analysis">
          <Row label="Loss kg" value={String(batch.processingLossKg)} />
          <Row label="Yield %" value={String(batch.yieldPercentage)} />
          <Row label="Total cost" value={`Rs. ${batch.totalCost.toLocaleString()}`} />
          <Row label="Cost/kg" value={`Rs. ${batch.costPerKg}`} />
        </Card>
        <Card title="Cost breakdown">
          <Row label="Labor" value={`Rs. ${batch.laborCost}`} />
          <Row label="Electricity" value={`Rs. ${batch.electricityCost}`} />
          <Row label="Machine" value={`Rs. ${batch.machineCost}`} />
          <Row label="Other" value={`Rs. ${batch.maintenanceCost + batch.packagingCost + batch.transportCost + batch.otherCosts}`} />
        </Card>
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Stock movements</h3>
        <ul className="text-xs bg-white border rounded-lg divide-y">
          {moves.length === 0 ? (
            <li className="p-3 text-[#94A3B8]">No movements (draft or demo seed without duplicate posting).</li>
          ) : (
            moves.map((m) => (
              <li key={m.id} className="p-3 flex justify-between gap-4">
                <span>{m.type}</span>
                <span>{m.qtyKg} kg</span>
                <span>{m.date}</span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Timeline</h3>
        <ol className="text-xs border-l-2 border-[#E2E8F0] ml-2 space-y-2">
          {batch.timeline.map((e) => (
            <li key={e.id} className="pl-3">
              <strong>{e.label}</strong>
              <div className="text-[#64748B]">{e.detail || e.at}</div>
            </li>
          ))}
        </ol>
      </section>
    </ProductionPageShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border rounded-xl p-4 space-y-2">
      <h4 className="font-semibold text-sm">{title}</h4>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-[#64748B]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
