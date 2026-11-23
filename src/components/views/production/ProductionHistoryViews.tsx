'use client';

import React, { useMemo, useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { ProductionPageShell, BatchTable } from './ProductionPageShell';
import { Button } from '../../common/Button';
import {
  completedProductionBatches,
  getBatchBrand,
  isLossAboveThreshold,
} from '../../../production/productionUtils';

export function ProductionConsumptionView() {
  const { productionBatches, setCurrentView, setSelectedEntityId } = useERP();
  const [source, setSource] = useState('all');
  const rows = useMemo(
    () =>
      productionBatches.filter(
        (b) => b.status !== 'Draft' && b.rawStockDeducted && (source === 'all' || b.materialSource === source)
      ),
    [productionBatches, source]
  );

  return (
    <ProductionPageShell title="Production Consumption" subtitle="Material usage from batch records — tied to inventory movements.">
      <select className="text-xs border rounded p-2" value={source} onChange={(e) => setSource(e.target.value)}>
        <option value="all">All sources</option>
        <option value="NEW">New raw</option>
        <option value="RECYCLED">Recycled</option>
      </select>
      <BatchTable
        headers={['Batch', 'Date', 'Material', 'Source', 'Warehouse', 'Qty', 'Cost/kg', 'Total', 'Operator']}
        rows={rows.map((b) => [
          b.batchNumber,
          b.productionDate,
          b.rawMaterialName,
          b.materialSource,
          b.inputWarehouse,
          b.rawMaterialQtyKg,
          b.rawMaterialCostPerKg,
          b.rawMaterialQtyKg * b.rawMaterialCostPerKg,
          b.operator,
        ])}
        onRowClick={(i) => {
          setSelectedEntityId(rows[i].id);
          setCurrentView('production-batch-detail');
        }}
      />
    </ProductionPageShell>
  );
}

export function ProductionOutputView() {
  const { productionBatches, setCurrentView, setSelectedEntityId } = useERP();
  const rows = useMemo(() => completedProductionBatches(productionBatches), [productionBatches]);
  return (
    <ProductionPageShell title="Production Output" subtitle="Saleable finished output — rejected kg excluded from inventory.">
      <BatchTable
        headers={['Batch', 'Date', 'Product', 'Brand', 'Saleable kg', 'Rejected kg', 'Cost/kg', 'Warehouse', 'Status']}
        rows={rows.map((b) => [
          b.batchNumber,
          b.productionDate,
          `${getBatchBrand(b)} ${b.color}`,
          getBatchBrand(b),
          b.finishedGoodsOutputKg,
          b.rejectedOutputKg,
          b.costPerKg,
          b.finishedGoodsWarehouse,
          b.status,
        ])}
        onRowClick={(i) => {
          setSelectedEntityId(rows[i].id);
          setCurrentView('production-batch-detail');
        }}
      />
    </ProductionPageShell>
  );
}

export function ProductionLossView() {
  const { productionBatches, productionSettings, setCurrentView, setSelectedEntityId } = useERP();
  const completed = completedProductionBatches(productionBatches);
  const avgLoss =
    completed.length > 0
      ? completed.reduce((a, b) => a + (b.processingLossKg / (b.rawMaterialQtyKg || 1)) * 100, 0) / completed.length
      : 0;
  const high = completed.filter((b) => isLossAboveThreshold(b, productionSettings.lossWarningThresholdPct));

  return (
    <ProductionPageShell
      title="Production Loss"
      subtitle={`Warning threshold ${productionSettings.lossWarningThresholdPct}% — informational only.`}
    >
      <div className="grid sm:grid-cols-3 gap-2 text-xs">
        <div className="bg-white border rounded-lg p-3">Avg loss: <strong>{avgLoss.toFixed(2)}%</strong></div>
        <div className="bg-white border rounded-lg p-3">High-loss batches: <strong>{high.length}</strong></div>
        <div className="bg-white border rounded-lg p-3">Completed: <strong>{completed.length}</strong></div>
      </div>
      <BatchTable
        headers={['Batch', 'Product', 'In', 'Out', 'Loss kg', 'Loss %', 'Yield %', 'Operator', 'Date']}
        rows={completed.map((b) => [
          b.batchNumber,
          `${getBatchBrand(b)} ${b.color}`,
          b.rawMaterialQtyKg,
          b.finishedGoodsOutputKg,
          b.processingLossKg,
          ((b.processingLossKg / (b.rawMaterialQtyKg || 1)) * 100).toFixed(2),
          b.yieldPercentage,
          b.operator,
          b.productionDate,
        ])}
        rowClass={(i) => (isLossAboveThreshold(completed[i], productionSettings.lossWarningThresholdPct) ? 'bg-amber-50' : '')}
        onRowClick={(i) => {
          setSelectedEntityId(completed[i].id);
          setCurrentView('production-batch-detail');
        }}
      />
    </ProductionPageShell>
  );
}

export function ProductionCostsView() {
  const { productionBatches } = useERP();
  const completed = completedProductionBatches(productionBatches);
  const totals = completed.reduce(
    (acc, b) => {
      acc.raw += b.rawMaterialQtyKg * b.rawMaterialCostPerKg;
      acc.labor += b.laborCost;
      acc.electricity += b.electricityCost;
      acc.machine += b.machineCost;
      acc.maint += b.maintenanceCost;
      acc.packaging += b.packagingCost;
      acc.transport += b.transportCost;
      acc.other += b.otherCosts;
      acc.grand += b.totalCost;
      return acc;
    },
    { raw: 0, labor: 0, electricity: 0, machine: 0, maint: 0, packaging: 0, transport: 0, other: 0, grand: 0 }
  );
  const totalOut = completed.reduce((a, b) => a + b.finishedGoodsOutputKg, 0);

  return (
    <ProductionPageShell title="Production Cost Analysis" subtitle="New vs recycled material batches compared via source column.">
      <div className="grid sm:grid-cols-4 gap-2 text-xs">
        {Object.entries(totals).map(([k, v]) => (
          <div key={k} className="bg-white border rounded-lg p-3">
            {k}: <strong>Rs. {Math.round(v).toLocaleString()}</strong>
          </div>
        ))}
      </div>
      <p className="text-xs text-[#64748B]">Blended avg: Rs. {totalOut > 0 ? Math.round(totals.grand / totalOut) : 0}/kg</p>
      <BatchTable
        headers={['Batch', 'Source', 'Product', 'Raw', 'Labor', 'Total', 'Cost/kg', 'Out kg']}
        rows={completed.map((b) => [
          b.batchNumber,
          b.materialSource,
          `${getBatchBrand(b)} ${b.color}`,
          b.rawMaterialQtyKg * b.rawMaterialCostPerKg,
          b.laborCost,
          b.totalCost,
          b.costPerKg,
          b.finishedGoodsOutputKg,
        ])}
      />
    </ProductionPageShell>
  );
}

export function ProductionReportsView() {
  const { productionBatches, stockMovements } = useERP();
  const completed = completedProductionBatches(productionBatches);

  const exportCsv = () => {
    const header = 'Batch,Date,Brand,Color,Source,InputKg,OutputKg,LossKg,YieldPct,TotalCost,CostPerKg';
    const lines = completed.map(
      (b) =>
        `${b.batchNumber},${b.productionDate},${getBatchBrand(b)},${b.color},${b.materialSource},${b.rawMaterialQtyKg},${b.finishedGoodsOutputKg},${b.processingLossKg},${b.yieldPercentage},${b.totalCost},${b.costPerKg}`
    );
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'production-report.csv';
    a.click();
  };

  const prodMoves = stockMovements.filter((m) => m.type === 'PRODUCTION_CONSUME' || m.type === 'PRODUCTION_OUTPUT');

  return (
    <ProductionPageShell
      title="Production Reports"
      subtitle="Daily/monthly/batch/brand reports derived from batch data — CSV export available."
      actions={<Button size="sm" variant="outline" onClick={exportCsv}>Export CSV</Button>}
    >
      <p className="text-xs">Completed batches: <strong>{completed.length}</strong> · Ledger movements: <strong>{prodMoves.length}</strong></p>
      <BatchTable
        headers={['Report slice', 'Records', 'Finished kg', 'Total cost']}
        rows={[
          ['All completed', completed.length, completed.reduce((a, b) => a + b.finishedGoodsOutputKg, 0), completed.reduce((a, b) => a + b.totalCost, 0)],
          ['New material', completed.filter((b) => b.materialSource === 'NEW').length, completed.filter((b) => b.materialSource === 'NEW').reduce((a, b) => a + b.finishedGoodsOutputKg, 0), 0],
          ['Recycled material', completed.filter((b) => b.materialSource === 'RECYCLED').length, completed.filter((b) => b.materialSource === 'RECYCLED').reduce((a, b) => a + b.finishedGoodsOutputKg, 0), 0],
          ['ABHA brand', completed.filter((b) => getBatchBrand(b) === 'ABHA').length, 0, 0],
          ['Crystal brand', completed.filter((b) => getBatchBrand(b) === 'Crystal').length, 0, 0],
        ]}
      />
    </ProductionPageShell>
  );
}

export function ProductionSettingsView() {
  const { productionSettings, productionMachines, productionOperators, updateProductionSettings, upsertProductionMachine, upsertProductionOperator } = useERP();
  const [threshold, setThreshold] = useState(productionSettings.lossWarningThresholdPct);

  return (
    <ProductionPageShell title="Production Settings" subtitle="Brands, colors, machines, operators, and batch number prefixes.">
      <div className="grid md:grid-cols-2 gap-4 text-xs">
        <div className="bg-white border rounded-xl p-4 space-y-2">
          <h3 className="font-semibold">Configuration</h3>
          <label>
            Loss warning %
            <input type="number" className="w-full border rounded p-2 mt-1" value={threshold} onChange={(e) => setThreshold(+e.target.value)} />
          </label>
          <Button
            size="sm"
            onClick={() => updateProductionSettings({ ...productionSettings, lossWarningThresholdPct: threshold })}
          >
            Save threshold
          </Button>
          <p>Brands: {productionSettings.brands.join(', ')}</p>
          <p>Colors: {productionSettings.colors.join(', ')}</p>
          <p>Batch prefix: {productionSettings.batchNumberPrefix}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <h3 className="font-semibold mb-2">Machines ({productionMachines.length})</h3>
          <ul className="space-y-1">{productionMachines.map((m) => <li key={m.id}>{m.code} — {m.name}</li>)}</ul>
          <h3 className="font-semibold mt-4 mb-2">Operators ({productionOperators.length})</h3>
          <ul className="space-y-1">{productionOperators.map((o) => <li key={o.id}>{o.name}</li>)}</ul>
        </div>
      </div>
    </ProductionPageShell>
  );
}