'use client';

import React, { useMemo, useState } from 'react';
import { useERP, ProductionBatchFormInput } from '../../../context/ERPContext';
import type { ProductionBatch, ProductionSource } from '../../../types/erp';
import { ProductionPageShell } from './ProductionPageShell';
import { Button } from '../../common/Button';
import { computeProductionMetrics, generateProductionBatchNumber } from '../../../production/productionUtils';
import { AlertCircle } from 'lucide-react';

const STEPS = [
  'Batch info',
  'Raw source',
  'Product',
  'Consumption',
  'Output',
  'Loss',
  'Costs',
  'Review',
];

export function ProductionCreateBatchView() {
  const {
    inventory,
    productionBatches,
    productionSettings,
    productionMachines,
    productionOperators,
    selectedEntityId,
    saveProductionBatchDraft,
    updateProductionBatchDraft,
    startProductionBatch,
    completeProductionFromInput,
    setCurrentView,
  } = useERP();

  const editing = selectedEntityId ? productionBatches.find((b) => b.id === selectedEntityId) : undefined;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ProductionBatchFormInput>(() =>
    editing
      ? batchToForm(editing)
      : emptyForm(productionOperators[0]?.name, generateProductionBatchNumber(productionBatches, productionSettings))
  );

  const eligibleRaw = useMemo(() => {
    const cat = form.materialSource === 'NEW' ? 'NEW_BRANDED' : 'RECYCLED_RAW';
    return inventory.filter((i) => i.category === cat && i.availableKg > 0);
  }, [inventory, form.materialSource]);

  const selectedRaw = inventory.find((i) => i.id === form.rawMaterialBatchId);
  const metrics = computeProductionMetrics(
    form.rawMaterialQtyKg,
    form.finishedGoodsOutputKg,
    form.rejectedOutputKg,
    form.reusableByproductKg,
    selectedRaw?.unitCost || 0,
    {
      laborCost: form.laborCost,
      electricityCost: form.electricityCost,
      machineCost: form.machineCost,
      maintenanceCost: form.maintenanceCost,
      packagingCost: form.packagingCost,
      transportCost: form.transportCost,
      otherCosts: form.otherCosts,
    }
  );

  const persistDraft = () => {
    if (editing) updateProductionBatchDraft(editing.id, form);
    else saveProductionBatchDraft(form);
  };

  return (
    <ProductionPageShell
      title="Create Production Batch"
      subtitle="Eight-step wizard — one raw material source per batch (NEW or RECYCLED)."
      actions={
        <Button size="sm" variant="outline" onClick={() => setCurrentView('production')}>
          Back to overview
        </Button>
      }
    >
      <div className="flex flex-wrap gap-1 text-[10px] uppercase tracking-wide">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(i)}
            className={`px-3 py-1 rounded-full border ${i === step ? 'bg-[#2563eb] text-white border-[#2563eb]' : 'bg-white text-[#64748B]'}`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      <div className="bg-white border rounded-xl p-4 text-xs space-y-4">
        {step === 0 && (
          <Grid>
            <Input label="Batch number" value={form.batchNumber || ''} onChange={(v) => setForm({ ...form, batchNumber: v })} />
            <Input label="Production date" type="date" value={form.productionDate} onChange={(v) => setForm({ ...form, productionDate: v })} />
            <Input label="Operator" value={form.operator} onChange={(v) => setForm({ ...form, operator: v })} />
            <Select label="Machine" value={form.machineId || ''} onChange={(v) => {
              const m = productionMachines.find((x) => x.id === v);
              setForm({ ...form, machineId: v, machineName: m?.name });
            }} options={productionMachines.map((m) => ({ value: m.id, label: m.name }))} />
            <Select label="Shift" value={form.shift || ''} onChange={(v) => setForm({ ...form, shift: v })} options={productionSettings.shifts.map((s) => ({ value: s, label: s }))} />
            <TextArea label="Notes" value={form.notes || ''} onChange={(v) => setForm({ ...form, notes: v })} />
          </Grid>
        )}
        {step === 1 && (
          <div className="space-y-3">
            <div className="flex gap-4">
              {(['NEW', 'RECYCLED'] as ProductionSource[]).map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setForm({ ...form, materialSource: src, rawMaterialBatchId: '' })}
                  className={`flex-1 p-4 rounded-xl border-2 ${form.materialSource === src ? 'border-[#2563eb] bg-blue-50' : 'border-[#E2E8F0]'}`}
                >
                  {src === 'NEW' ? 'New Raw Material' : 'Recycled Raw Material'}
                </button>
              ))}
            </div>
            <p className="text-[#64748B] flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Only one source per batch — mixing is not allowed.
            </p>
          </div>
        )}
        {step === 2 && (
          <Grid>
            <Select label="Brand" value={form.productName} onChange={(v) => setForm({ ...form, productName: v })} options={productionSettings.brands.map((b) => ({ value: b, label: b }))} />
            <Select label="Color" value={form.color} onChange={(v) => setForm({ ...form, color: v })} options={productionSettings.colors.map((c) => ({ value: c, label: c }))} />
            <Input label="Planned output (kg)" type="number" value={String(form.finishedGoodsOutputKg || 0)} onChange={(v) => setForm({ ...form, finishedGoodsOutputKg: +v })} />
          </Grid>
        )}
        {step === 3 && (
          <Grid>
            <Select
              label="Raw material batch"
              value={form.rawMaterialBatchId}
              onChange={(v) => {
                const item = inventory.find((i) => i.id === v);
                setForm({
                  ...form,
                  rawMaterialBatchId: v,
                  rawMaterialName: item?.name,
                  inputWarehouse: item?.warehouse || '',
                });
              }}
              options={eligibleRaw.map((i) => ({
                value: i.id,
                label: `${i.name} — ${i.availableKg} kg @ ${i.warehouse}`,
              }))}
            />
            <Input label="Actual input (kg)" type="number" value={String(form.rawMaterialQtyKg)} onChange={(v) => setForm({ ...form, rawMaterialQtyKg: +v })} />
            {selectedRaw && form.rawMaterialQtyKg > selectedRaw.availableKg ? (
              <p className="text-red-600 col-span-2">Exceeds available {selectedRaw.availableKg} kg</p>
            ) : null}
          </Grid>
        )}
        {step === 4 && (
          <Grid>
            <Input label="Saleable finished output (kg)" type="number" value={String(form.finishedGoodsOutputKg)} onChange={(v) => setForm({ ...form, finishedGoodsOutputKg: +v })} />
            <Input label="Rejected output (kg)" type="number" value={String(form.rejectedOutputKg)} onChange={(v) => setForm({ ...form, rejectedOutputKg: +v })} />
            <Input label="Finished goods warehouse" value={form.finishedGoodsWarehouse} onChange={(v) => setForm({ ...form, finishedGoodsWarehouse: v })} />
          </Grid>
        )}
        {step === 5 && (
          <div className="grid sm:grid-cols-3 gap-3 p-4 bg-[#F8FAFC] rounded-lg">
            <Stat label="Loss (kg)" value={metrics.processingLossKg} />
            <Stat label="Loss %" value={metrics.lossPercentage} />
            <Stat label="Yield %" value={metrics.yieldPercentage} />
          </div>
        )}
        {step === 6 && (
          <Grid>
            {(['laborCost', 'electricityCost', 'machineCost', 'maintenanceCost', 'packagingCost', 'transportCost', 'otherCosts'] as const).map((key) => (
              <Input
                key={key}
                label={key.replace('Cost', ' cost').replace(/([A-Z])/g, ' $1')}
                type="number"
                value={String(form[key])}
                onChange={(v) => setForm({ ...form, [key]: +v })}
              />
            ))}
            <div className="col-span-2 font-semibold">Total: Rs. {metrics.totalCost.toLocaleString()} · Rs. {metrics.costPerKg}/kg</div>
          </Grid>
        )}
        {step === 7 && (
          <div className="space-y-2 text-sm">
            <p>
              <strong>{form.batchNumber}</strong> — {form.productName} {form.color} from {form.materialSource}
            </p>
            <p>
              Input {form.rawMaterialQtyKg} kg → Output {form.finishedGoodsOutputKg} kg (rejected {form.rejectedOutputKg} kg)
            </p>
            <p>Yield {metrics.yieldPercentage}% · Cost Rs. {metrics.costPerKg}/kg</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outline" onClick={persistDraft}>
                Save draft
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const id = editing?.id || saveProductionBatchDraft(form);
                  if (id) startProductionBatch(id);
                }}
              >
                Start production
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  completeProductionFromInput(form);
                  setCurrentView('production');
                }}
              >
                Complete production
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" size="sm" disabled={step === 0} onClick={() => setStep(step - 1)}>
          Previous
        </Button>
        {step < 7 && (
          <Button size="sm" onClick={() => setStep(step + 1)}>
            Next
          </Button>
        )}
      </div>
    </ProductionPageShell>
  );
}

function emptyForm(operator: string, batchNumber: string): ProductionBatchFormInput {
  return {
    batchNumber,
    productName: 'ABHA',
    color: 'White',
    materialSource: 'NEW',
    rawMaterialBatchId: '',
    inputWarehouse: '',
    rawMaterialQtyKg: 0,
    finishedGoodsOutputKg: 0,
    rejectedOutputKg: 0,
    reusableByproductKg: 0,
    finishedGoodsWarehouse: 'Finished Goods Hall D',
    productionDate: new Date().toISOString().split('T')[0],
    laborCost: 0,
    electricityCost: 0,
    machineCost: 0,
    maintenanceCost: 0,
    packagingCost: 0,
    transportCost: 0,
    otherCosts: 0,
    operator: operator || 'Staff',
  };
}

function batchToForm(b: ProductionBatch): ProductionBatchFormInput {
  return {
    id: b.id,
    batchNumber: b.batchNumber,
    productName: b.productName,
    color: b.color,
    materialSource: b.materialSource,
    rawMaterialBatchId: b.rawMaterialBatchId,
    rawMaterialName: b.rawMaterialName,
    inputWarehouse: b.inputWarehouse,
    rawMaterialQtyKg: b.rawMaterialQtyKg,
    plannedInputQtyKg: b.plannedInputQtyKg,
    finishedGoodsOutputKg: b.finishedGoodsOutputKg,
    rejectedOutputKg: b.rejectedOutputKg,
    reusableByproductKg: b.reusableByproductKg,
    finishedGoodsWarehouse: b.finishedGoodsWarehouse,
    productionDate: b.productionDate,
    laborCost: b.laborCost,
    electricityCost: b.electricityCost,
    machineCost: b.machineCost,
    maintenanceCost: b.maintenanceCost,
    packagingCost: b.packagingCost,
    transportCost: b.transportCost,
    otherCosts: b.otherCosts,
    operator: b.operator,
    machineId: b.machineId,
    machineName: b.machineName,
    shift: b.shift,
    notes: b.notes,
    outputBatchNumber: b.outputBatchNumber,
    productionOrderRef: b.productionOrderRef,
    productionPlanRef: b.productionPlanRef,
  };
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-3">{children}</div>;
}

function Input({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-[#64748B]">{label}</span>
      <input type={type} className="w-full mt-1 border rounded p-2" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block sm:col-span-2">
      <span className="text-[#64748B]">{label}</span>
      <textarea className="w-full mt-1 border rounded p-2" rows={2} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="block">
      <span className="text-[#64748B]">{label}</span>
      <select className="w-full mt-1 border rounded p-2" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-[#64748B]">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}