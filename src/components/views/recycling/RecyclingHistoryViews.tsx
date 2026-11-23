'use client';

import React, { useMemo, useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { RecyclingPageShell } from './RecyclingPageShell';
import { Button } from '../../common/Button';
import { completedBatchesOnly, getBatchOutputs, isLossAboveThreshold } from '../../../recycling/recyclingUtils';
import { exportRecyclingInputsCSV, exportRecyclingOutputsCSV, exportRecyclingBatchesCSV } from '../../../utils/recyclingExportUtils';

export function RecyclingInputsView() {
  const { recyclingBatches, setCurrentView, setSelectedEntityId } = useERP();
  const [warehouse, setWarehouse] = useState('all');
  const rows = useMemo(() => {
    return recyclingBatches.filter((b) => b.status !== 'Draft' && (warehouse === 'all' || b.inputWarehouse === warehouse));
  }, [recyclingBatches, warehouse]);

  return (
    <RecyclingPageShell
      title="Recycling Inputs"
      subtitle="Waste consumption derived from batch records — not duplicate ledger data."
      actions={<Button size="sm" variant="outline" onClick={() => exportRecyclingInputsCSV(rows)}>Export CSV</Button>}
    >
      <select className="text-xs border rounded p-2" value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>
        <option value="all">All warehouses</option>
        {Array.from(new Set(recyclingBatches.map((b) => b.inputWarehouse))).map((w) => (
          <option key={w} value={w}>{w}</option>
        ))}
      </select>
      <BatchTable
        headers={['Batch', 'Date', 'Material', 'Warehouse', 'Qty kg', 'Cost/kg', 'Total', 'Operator']}
        rows={rows.map((b) => [
          b.batchNumber,
          b.processingDate,
          b.wasteInputName,
          b.inputWarehouse,
          b.inputWasteQtyKg,
          b.wasteCostPerKg,
          b.inputWasteQtyKg * b.wasteCostPerKg,
          b.operator,
        ])}
        onRowClick={(i) => {
          setSelectedEntityId(rows[i].id);
          setCurrentView('recycling-batch-detail');
        }}
      />
    </RecyclingPageShell>
  );
}

export function RecyclingOutputsView() {
  const { recyclingBatches, setCurrentView, setSelectedEntityId } = useERP();
  const lines = useMemo(() => {
    return recyclingBatches.flatMap((b) =>
      getBatchOutputs(b).map((o) => ({ batch: b, output: o }))
    );
  }, [recyclingBatches]);

  return (
    <RecyclingPageShell
      title="Recycling Outputs"
      subtitle="Each output line links to its parent batch and recycled inventory SKU."
      actions={<Button size="sm" variant="outline" onClick={() => exportRecyclingOutputsCSV(recyclingBatches)}>Export CSV</Button>}
    >
      <BatchTable
        headers={['Batch', 'Date', 'Material', 'Qty kg', 'Warehouse', 'Allocated', 'Cost/kg', 'Status']}
        rows={lines.map(({ batch, output }) => [
          batch.batchNumber,
          batch.processingDate,
          output.materialName,
          output.outputQtyKg,
          output.outputWarehouse,
          output.allocatedCost,
          output.costPerKg,
          batch.status,
        ])}
        onRowClick={(i) => {
          setSelectedEntityId(lines[i].batch.id);
          setCurrentView('recycling-batch-detail');
        }}
      />
    </RecyclingPageShell>
  );
}

export function RecyclingLossView() {
  const { recyclingBatches, recyclingSettings, setCurrentView, setSelectedEntityId } = useERP();
  const completed = completedBatchesOnly(recyclingBatches);
  const avgLoss =
    completed.length > 0
      ? completed.reduce((a, b) => a + (b.processingLossKg / b.inputWasteQtyKg) * 100, 0) / completed.length
      : 0;
  const highLoss = completed.filter((b) => isLossAboveThreshold(b, recyclingSettings.lossWarningThresholdPct));

  return (
    <RecyclingPageShell
      title="Processing Loss"
      subtitle={`Warning threshold: ${recyclingSettings.lossWarningThresholdPct}% — high loss is highlighted, not auto-rejected.`}
    >
      <div className="grid sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white border rounded-xl p-3">Average loss: <strong>{avgLoss.toFixed(2)}%</strong></div>
        <div className="bg-white border rounded-xl p-3">High-loss batches: <strong>{highLoss.length}</strong></div>
        <div className="bg-white border rounded-xl p-3">Completed runs: <strong>{completed.length}</strong></div>
      </div>
      <BatchTable
        headers={['Batch', 'Date', 'In kg', 'Out kg', 'Loss kg', 'Loss %', 'Yield %', 'Material', 'Operator']}
        rows={completed.map((b) => [
          b.batchNumber,
          b.processingDate,
          b.inputWasteQtyKg,
          b.outputQtyKg,
          b.processingLossKg,
          ((b.processingLossKg / b.inputWasteQtyKg) * 100).toFixed(2),
          b.yieldPercentage,
          b.wasteInputName,
          b.operator,
        ])}
        rowClass={(i) => (isLossAboveThreshold(completed[i], recyclingSettings.lossWarningThresholdPct) ? 'bg-amber-50' : '')}
        onRowClick={(i) => {
          setSelectedEntityId(completed[i].id);
          setCurrentView('recycling-batch-detail');
        }}
      />
    </RecyclingPageShell>
  );
}

export function RecyclingCostsView() {
  const { recyclingBatches } = useERP();
  const completed = completedBatchesOnly(recyclingBatches);
  const totals = completed.reduce(
    (acc, b) => {
      acc.waste += b.inputWasteQtyKg * b.wasteCostPerKg;
      acc.labor += b.laborCost;
      acc.electricity += b.electricityCost;
      acc.machine += b.machineCost;
      acc.transport += b.transportCost;
      acc.maint += b.maintenanceCost;
      acc.other += b.otherCosts;
      acc.grand += b.totalBatchCost;
      return acc;
    },
    { waste: 0, labor: 0, electricity: 0, machine: 0, transport: 0, maint: 0, other: 0, grand: 0 }
  );
  const totalOut = completed.reduce((a, b) => a + b.outputQtyKg, 0);

  return (
    <RecyclingPageShell title="Recycling Cost Analysis" subtitle="Batch-wise and aggregate processing costs from actual batch records.">
      <div className="grid sm:grid-cols-4 gap-2 text-xs">
        {Object.entries(totals).map(([k, v]) => (
          <div key={k} className="bg-white border rounded-lg p-3">
            <span className="uppercase text-slate-500">{k}</span>
            <p className="font-bold text-slate-800">Rs. {v.toLocaleString()}</p>
          </div>
        ))}
      </div>
      <p className="text-xs">Average cost/kg (completed): Rs. {totalOut > 0 ? (totals.grand / totalOut).toFixed(2) : '—'}</p>
      <BatchTable
        headers={['Batch', 'Waste cost', 'Processing', 'Total', 'Cost/kg', 'Yield']}
        rows={completed.map((b) => [
          b.batchNumber,
          b.inputWasteQtyKg * b.wasteCostPerKg,
          b.totalProcessingCost,
          b.totalBatchCost,
          b.costPerKg,
          b.yieldPercentage,
        ])}
      />
      <p className="text-[10px] text-slate-400">Tracked batches: {recyclingBatches.length}</p>
    </RecyclingPageShell>
  );
}

export function RecyclingReportsView() {
  const { recyclingBatches } = useERP();
  return (
    <RecyclingPageShell
      title="Recycling Reports"
      subtitle="Summary exports for batches, inputs, and outputs — print-friendly layouts."
      actions={
        <div className="flex gap-2 print:hidden">
          <Button size="sm" variant="outline" onClick={() => window.print()}>Print</Button>
          <Button size="sm" variant="primary" onClick={() => exportRecyclingBatchesCSV(recyclingBatches)}>Export Batches CSV</Button>
        </div>
      }
    >
      <div className="printable-area bg-white border rounded-xl p-4 text-xs space-y-2">
        <p>Batch summary report — {recyclingBatches.length} records</p>
        <p>Waste input report — use Inputs page export</p>
        <p>Output / loss / yield / cost — available via dedicated pages and CSV actions above</p>
      </div>
    </RecyclingPageShell>
  );
}

export function RecyclingSettingsView() {
  const {
    recyclingSettings,
    recyclingOutputTypes,
    processingMachines,
    recyclingOperators,
    updateRecyclingSettings,
    addRecyclingOutputType,
    toggleRecyclingOutputType,
    upsertRecyclingOperator,
  } = useERP();
  const [threshold, setThreshold] = useState(recyclingSettings.lossWarningThresholdPct);
  const [newType, setNewType] = useState('');

  return (
    <RecyclingPageShell title="Recycling Settings" subtitle="Output types, machines, operators, batch numbering, and loss warning threshold.">
      <SettingsSection title="Loss warning threshold (%)">
        <input type="number" className="border p-2 rounded text-xs w-24" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
        <Button
          size="sm"
          className="ml-2"
          onClick={() => updateRecyclingSettings({ ...recyclingSettings, lossWarningThresholdPct: threshold })}
        >
          Save
        </Button>
        <p className="text-[10px] text-slate-500 mt-1">Batch format example: {recyclingSettings.batchNumberPrefix}-2026-0001</p>
      </SettingsSection>

      <SettingsSection title="Output material types">
        <ul className="space-y-1">
          {recyclingOutputTypes.map((t) => (
            <li key={t.id} className="flex justify-between items-center border-b py-1">
              <span>{t.name} ({t.code})</span>
              <Button size="sm" variant="outline" onClick={() => toggleRecyclingOutputType(t.id, !t.active)}>
                {t.active ? 'Deactivate' : 'Activate'}
              </Button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 mt-2">
          <input className="border p-2 rounded flex-1 text-xs" placeholder="New type name" value={newType} onChange={(e) => setNewType(e.target.value)} />
          <Button size="sm" onClick={() => { if (newType) { addRecyclingOutputType(newType, 'User added'); setNewType(''); } }}>Add</Button>
        </div>
      </SettingsSection>

      <SettingsSection title="Machines">
        {processingMachines.map((m) => (
          <p key={m.id} className="text-xs">{m.code} — {m.name} ({m.status})</p>
        ))}
      </SettingsSection>

      <SettingsSection title="Operators">
        {recyclingOperators.map((o) => (
          <p key={o.id} className="text-xs">{o.name} {o.employeeRef}</p>
        ))}
        <Button
          size="sm"
          variant="outline"
          className="mt-2"
          onClick={() =>
            upsertRecyclingOperator({
              id: 'rop-' + Date.now(),
              name: 'New Operator',
              status: 'Active',
            })
          }
        >
          Add placeholder operator
        </Button>
      </SettingsSection>
    </RecyclingPageShell>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      {children}
    </div>
  );
}

function BatchTable({
  headers,
  rows,
  onRowClick,
  rowClass,
}: {
  headers: string[];
  rows: (string | number)[][];
  onRowClick?: (index: number) => void;
  rowClass?: (index: number) => string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
      <table className="w-full text-xs text-left">
        <thead className="bg-slate-50 font-semibold text-slate-500">
          <tr>
            {headers.map((h) => (
              <th key={h} className="py-2.5 px-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`hover:bg-slate-50 ${rowClass?.(i) || ''} ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(i)}
            >
              {row.map((cell, j) => (
                <td key={j} className="py-2 px-3">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}