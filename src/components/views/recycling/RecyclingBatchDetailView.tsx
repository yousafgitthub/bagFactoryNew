'use client';

import React from 'react';
import { useERP } from '../../../context/ERPContext';
import { Button } from '../../common/Button';
import { RecyclingPageShell } from './RecyclingPageShell';
import { RecyclingStatusBadge } from './RecyclingStatusBadge';
import { getBatchOutputs } from '../../../recycling/recyclingUtils';
import { exportRecyclingBatchesCSV } from '../../../utils/recyclingExportUtils';

export function RecyclingBatchDetailView() {
  const { recyclingBatches, selectedEntityId, setCurrentView, startRecyclingBatch, completeRecyclingBatch } = useERP();
  const batch = recyclingBatches.find((b) => b.id === selectedEntityId) || recyclingBatches[0];

  if (!batch) {
    return (
      <RecyclingPageShell title="Batch Detail" subtitle="No batch selected">
        <Button onClick={() => setCurrentView('recycling-batches')}>Back to batches</Button>
      </RecyclingPageShell>
    );
  }

  const outputs = getBatchOutputs(batch);

  return (
    <RecyclingPageShell
      title={`Batch ${batch.batchNumber}`}
      subtitle={batch.batchName || batch.wasteInputName}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportRecyclingBatchesCSV([batch], `${batch.batchNumber}.csv`)}>
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentView('recycling-batches')}>
            Back
          </Button>
        </div>
      }
    >
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
          <p className="font-bold text-slate-800">Overview</p>
          <p>
            Status: <RecyclingStatusBadge status={batch.status} />
          </p>
          <p>Date: {batch.processingDate}</p>
          <p>Operator: {batch.operator}</p>
          <p>Machine: {batch.machineName || '—'}</p>
          <p className="text-slate-500">{batch.notes}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-1">
          <p className="font-bold text-slate-800">Input</p>
          <p>{batch.wasteInputName}</p>
          <p>{batch.inputWasteQtyKg} kg @ Rs. {batch.wasteCostPerKg}/kg</p>
          <p>Warehouse: {batch.inputWarehouse}</p>
          <p>Input cost: Rs. {(batch.inputWasteQtyKg * batch.wasteCostPerKg).toLocaleString()}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-1">
          <p className="font-bold text-slate-800">Processing Analysis</p>
          <p>Loss: {batch.processingLossKg} kg</p>
          <p>Yield: {batch.yieldPercentage}%</p>
          <p>Total cost: Rs. {batch.totalBatchCost.toLocaleString()}</p>
          <p>Blended Rs. {batch.costPerKg}/kg</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-2 border-b font-bold text-sm">Outputs</div>
        <table className="w-full text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="py-2 px-4 text-left">Material</th>
              <th className="px-3 text-right">Qty kg</th>
              <th className="px-3">Warehouse</th>
              <th className="px-3 text-right">Allocated cost</th>
              <th className="px-4 text-right">Cost/kg</th>
            </tr>
          </thead>
          <tbody>
            {outputs.map((o) => (
              <tr key={o.id} className="border-t border-slate-100">
                <td className="py-2 px-4 font-medium">{o.materialName}</td>
                <td className="px-3 text-right">{o.outputQtyKg}</td>
                <td className="px-3">{o.outputWarehouse}</td>
                <td className="px-3 text-right">Rs. {o.allocatedCost.toLocaleString()}</td>
                <td className="px-4 text-right">Rs. {o.costPerKg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs grid sm:grid-cols-3 gap-2">
        <span>Labor: Rs. {batch.laborCost.toLocaleString()}</span>
        <span>Electricity: Rs. {batch.electricityCost.toLocaleString()}</span>
        <span>Machine: Rs. {batch.machineCost.toLocaleString()}</span>
        <span>Transport: Rs. {batch.transportCost.toLocaleString()}</span>
        <span>Maintenance: Rs. {batch.maintenanceCost.toLocaleString()}</span>
        <span>Other: Rs. {batch.otherCosts.toLocaleString()}</span>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs font-bold text-slate-700 mb-2">Timeline</p>
        <ul className="space-y-1 text-xs text-slate-600">
          {batch.timeline.map((t) => (
            <li key={t.id}>
              <span className="font-semibold">{t.label}</span> — {new Date(t.at).toLocaleString()} {t.detail ? `· ${t.detail}` : ''}
            </li>
          ))}
        </ul>
      </div>

      {(batch.status === 'Draft' || batch.status === 'In Progress') && (
        <div className="flex gap-2">
          {batch.status === 'Draft' && (
            <Button onClick={() => startRecyclingBatch(batch.id)}>Start Processing</Button>
          )}
          <Button variant="primary" onClick={() => completeRecyclingBatch(batch.id)}>
            Complete Batch
          </Button>
        </div>
      )}
    </RecyclingPageShell>
  );
}