'use client';

import React, { useMemo, useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Button } from '../../common/Button';
import { RecyclingPageShell } from './RecyclingPageShell';
import {
  allocateOutputCosts,
  computeRecyclingMetrics,
  computeWasteMaterialCost,
} from '../../../recycling/recyclingUtils';
import { generateRecyclingBatchNumber } from '../../../recycling/recyclingUtils';

const STEPS = ['Batch Info', 'Waste Input', 'Outputs', 'Loss & Yield', 'Costs', 'Review'];

function CostField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      {label} (PKR)
      <input
        type="number"
        className="w-full p-2 border rounded mt-0.5"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

export function RecyclingCreateBatchView() {
  const {
    inventory,
    recyclingBatches,
    recyclingSettings,
    recyclingOutputTypes,
    processingMachines,
    recyclingOperators,
    saveRecyclingBatchDraft,
    createRecyclingBatch,
    setCurrentView,
  } = useERP();

  const wasteItems = inventory.filter((i) => i.category === 'WASTE_PLASTIC');
  const [step, setStep] = useState(0);
  const [wasteId, setWasteId] = useState(wasteItems[0]?.id || '');
  const [inputKg, setInputKg] = useState(500);
  const [operator, setOperator] = useState(recyclingOperators[0]?.name || '');
  const [machineId, setMachineId] = useState(processingMachines[0]?.id);
  const [notes, setNotes] = useState('');
  const [outputs, setOutputs] = useState([{ id: 'out-1', materialName: recyclingOutputTypes[0]?.name || 'Recycled Material Type A', outputQtyKg: 450, outputWarehouse: 'Recycled Polymer Silo C', notes: '' }]);
  const [labor, setLabor] = useState(2000);
  const [electricity, setElectricity] = useState(3000);
  const [machineCost, setMachineCost] = useState(1000);
  const [transport, setTransport] = useState(0);
  const [maintenance, setMaintenance] = useState(0);
  const [other, setOther] = useState(500);

  const waste = wasteItems.find((w) => w.id === wasteId);
  const machine = processingMachines.find((m) => m.id === machineId);

  const metrics = useMemo(() => {
    if (!waste) return null;
    const wasteMaterialCost = computeWasteMaterialCost(inputKg, waste.unitCost);
    return computeRecyclingMetrics(
      inputKg,
      outputs.map((o) => ({ ...o, allocatedCost: 0, costPerKg: 0 })),
      {
        wasteMaterialCost,
        laborCost: labor,
        electricityCost: electricity,
        machineCost,
        transportCost: transport,
        maintenanceCost: maintenance,
        otherCosts: other,
      }
    );
  }, [waste, inputKg, outputs, labor, electricity, machineCost, transport, maintenance, other]);

  const allocated = metrics ? allocateOutputCosts(metrics.totalBatchCost, outputs) : [];

  const submitDraft = () => {
    if (!waste) return;
    const id = saveRecyclingBatchDraft({
      wasteInputBatchId: wasteId,
      inputWasteQtyKg: inputKg,
      outputs,
      laborCost: labor,
      electricityCost: electricity,
      machineCost,
      transportCost: transport,
      maintenanceCost: maintenance,
      otherCosts: other,
      processingDate: new Date().toISOString().split('T')[0],
      operator,
      machineId,
      machineName: machine?.name,
      notes,
      destinationWarehouse: outputs[0]?.outputWarehouse || 'Recycled Polymer Silo C',
    });
    if (id) setCurrentView('recycling-batches');
  };

  const submitComplete = () => {
    if (!waste) return;
    createRecyclingBatch({
      batchNumber: batchPreview,
      wasteInputBatchId: wasteId,
      wasteInputName: waste.name,
      inputWarehouse: waste.warehouse,
      inputWasteQtyKg: inputKg,
      wasteCostPerKg: waste.unitCost,
      outputs: outputs.map((o) => ({ ...o, notes: o.notes || undefined })),
      laborCost: labor,
      electricityCost: electricity,
      machineCost,
      transportCost: transport,
      maintenanceCost: maintenance,
      otherCosts: other,
      processingDate: new Date().toISOString().split('T')[0],
      operator,
      machineId,
      machineName: machine?.name,
      status: 'In Progress',
      notes,
      destinationWarehouse: outputs[0]?.outputWarehouse || 'Recycled Polymer Silo C',
    });
    setCurrentView('recycling-batches');
  };

  const batchPreview = generateRecyclingBatchNumber(recyclingBatches, recyclingSettings);

  return (
    <RecyclingPageShell title="Create Recycling Batch" subtitle="Six-step wizard with live yield and cost calculations.">
      <div className="flex gap-2 flex-wrap text-[10px] font-semibold uppercase tracking-wide">
        {STEPS.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(i)}
            className={`px-2 py-1 rounded ${step === i ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 text-xs space-y-4">
        {step === 0 && (
          <>
            <p>
              Batch number: <strong className="text-purple-700">{batchPreview}</strong> (auto)
            </p>
            <label className="block">
              Operator
              <select className="w-full mt-1 p-2 border rounded-lg" value={operator} onChange={(e) => setOperator(e.target.value)}>
                {recyclingOperators.map((o) => (
                  <option key={o.id} value={o.name}>{o.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              Machine
              <select className="w-full mt-1 p-2 border rounded-lg" value={machineId} onChange={(e) => setMachineId(e.target.value)}>
                {processingMachines.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </label>
            <textarea className="w-full p-2 border rounded-lg" placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </>
        )}
        {step === 1 && waste && (
          <>
            <select className="w-full p-2 border rounded-lg" value={wasteId} onChange={(e) => setWasteId(e.target.value)}>
              {wasteItems.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} — {w.availableKg} kg @ Rs. {w.unitCost}/kg
                </option>
              ))}
            </select>
            <label className="block">
              Quantity to process (kg)
              <input type="number" min={1} max={waste.availableKg} className="w-full mt-1 p-2 border rounded-lg" value={inputKg} onChange={(e) => setInputKg(Number(e.target.value))} />
            </label>
            <p className="text-slate-500">Warehouse: {waste.warehouse}</p>
          </>
        )}
        {step === 2 && (
          <>
            {outputs.map((o, idx) => (
              <div key={o.id} className="grid sm:grid-cols-3 gap-2 border p-2 rounded-lg">
                <select
                  value={o.materialName}
                  onChange={(e) => {
                    const next = [...outputs];
                    next[idx] = { ...o, materialName: e.target.value };
                    setOutputs(next);
                  }}
                  className="p-2 border rounded"
                >
                  {recyclingOutputTypes.filter((t) => t.active).map((t) => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={o.outputQtyKg}
                  onChange={(e) => {
                    const next = [...outputs];
                    next[idx] = { ...o, outputQtyKg: Number(e.target.value) };
                    setOutputs(next);
                  }}
                  className="p-2 border rounded"
                />
                <input
                  value={o.outputWarehouse}
                  onChange={(e) => {
                    const next = [...outputs];
                    next[idx] = { ...o, outputWarehouse: e.target.value };
                    setOutputs(next);
                  }}
                  className="p-2 border rounded"
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setOutputs([
                  ...outputs,
                  {
                    id: 'out-' + Date.now(),
                    materialName: recyclingOutputTypes[1]?.name || 'Recycled Material Type B',
                    outputQtyKg: 100,
                    outputWarehouse: 'Recycled Polymer Silo C',
                    notes: '',
                  },
                ])
              }
            >
              + Add output line
            </Button>
          </>
        )}
        {step === 3 && metrics && (
          <div className="space-y-1 text-sm">
            <p>Processing loss: <strong className="text-rose-600">{metrics.processingLossKg} kg</strong> ({metrics.lossPercentage}%)</p>
            <p>Yield: <strong>{metrics.yieldPercentage}%</strong></p>
          </div>
        )}
        {step === 4 && (
          <div className="grid sm:grid-cols-3 gap-2">
            <CostField label="Labor" value={labor} onChange={setLabor} />
            <CostField label="Electricity" value={electricity} onChange={setElectricity} />
            <CostField label="Machine" value={machineCost} onChange={setMachineCost} />
            <CostField label="Transport" value={transport} onChange={setTransport} />
            <CostField label="Maintenance" value={maintenance} onChange={setMaintenance} />
            <CostField label="Other" value={other} onChange={setOther} />
          </div>
        )}
        {step === 5 && metrics && (
          <div className="space-y-2">
            <p>Total batch cost: Rs. {metrics.totalBatchCost.toLocaleString()}</p>
            <p>Blended cost/kg: Rs. {metrics.blendedCostPerKg}</p>
            <ul>
              {allocated.map((o) => (
                <li key={o.id}>
                  {o.materialName}: {o.outputQtyKg} kg → Rs. {o.costPerKg}/kg
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
          Back
        </Button>
        <div className="flex gap-2">
          {step < 5 ? (
            <Button onClick={() => setStep(step + 1)}>Next</Button>
          ) : (
            <>
              <Button variant="outline" onClick={submitDraft}>
                Save as Draft
              </Button>
              <Button variant="primary" onClick={submitComplete}>
                Complete Batch
              </Button>
            </>
          )}
        </div>
      </div>
    </RecyclingPageShell>
  );
}