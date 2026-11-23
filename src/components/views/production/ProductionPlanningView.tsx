'use client';

import React, { useMemo, useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import type { ProductionPriority, ProductionSource } from '../../../types/erp';
import { ProductionPageShell, BatchTable } from './ProductionPageShell';
import { ProductionPlanStatusBadge } from './ProductionStatusBadge';
import { Button } from '../../common/Button';
import { estimateInputFromPlan } from '../../../production/productionUtils';

export function ProductionPlanningView() {
  const {
    productionPlans,
    inventory,
    upsertProductionPlan,
    updateProductionPlanStatus,
    convertPlanToBatch,
    setCurrentView,
    setSelectedEntityId,
  } = useERP();
  const [statusFilter, setStatusFilter] = useState('all');

  const [form, setForm] = useState({
    brand: 'ABHA',
    color: 'White',
    productName: 'ABHA Shopping Bags',
    plannedOutputQtyKg: 400,
    materialSource: 'NEW' as ProductionSource,
    targetYieldPct: 90,
    priority: 'Normal' as ProductionPriority,
    assignedOperator: 'Zahid Hussain',
    plannedProductionDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const rows = useMemo(
    () => productionPlans.filter((p) => statusFilter === 'all' || p.status === statusFilter),
    [productionPlans, statusFilter]
  );

  const stockForSource = useMemo(() => {
    const cat = form.materialSource === 'NEW' ? 'NEW_BRANDED' : 'RECYCLED_RAW';
    return inventory.filter((i) => i.category === cat).reduce((a, i) => a + i.availableKg, 0);
  }, [inventory, form.materialSource]);

  const estimatedInput = estimateInputFromPlan(form.plannedOutputQtyKg, form.targetYieldPct);
  const stockWarning = estimatedInput > stockForSource;

  const savePlan = () => {
    upsertProductionPlan({
      planningDate: new Date().toISOString().split('T')[0],
      plannedProductionDate: form.plannedProductionDate,
      brand: form.brand,
      productName: form.productName,
      color: form.color,
      plannedOutputQtyKg: form.plannedOutputQtyKg,
      materialSource: form.materialSource,
      requiredRawMaterialQtyKg: estimatedInput,
      targetYieldPct: form.targetYieldPct,
      priority: form.priority,
      assignedOperator: form.assignedOperator,
      status: 'Draft',
      notes: form.notes,
    });
  };

  return (
    <ProductionPageShell
      title="Production Planning"
      subtitle="Plans do not consume inventory — stock is affected only when a production batch starts."
      actions={<Button size="sm" onClick={savePlan}>Save draft plan</Button>}
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <FormCard className="bg-white border rounded-xl p-4 space-y-3 text-xs">
          <h3 className="font-semibold text-sm">New plan</h3>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Brand">
              <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value, productName: `${e.target.value} Shopping Bags` })} className="w-full border rounded p-2">
                <option>ABHA</option>
                <option>Crystal</option>
              </select>
            </Field>
            <Field label="Color">
              <select value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full border rounded p-2">
                <option>White</option>
                <option>Black</option>
                <option>White/Clear</option>
              </select>
            </Field>
            <Field label="Planned output (kg)">
              <input type="number" value={form.plannedOutputQtyKg} onChange={(e) => setForm({ ...form, plannedOutputQtyKg: +e.target.value })} className="w-full border rounded p-2" />
            </Field>
            <Field label="Target yield %">
              <input type="number" value={form.targetYieldPct} onChange={(e) => setForm({ ...form, targetYieldPct: +e.target.value })} className="w-full border rounded p-2" />
            </Field>
            <Field label="Material source">
              <select value={form.materialSource} onChange={(e) => setForm({ ...form, materialSource: e.target.value as ProductionSource })} className="w-full border rounded p-2">
                <option value="NEW">New Raw Material</option>
                <option value="RECYCLED">Recycled Raw Material</option>
              </select>
            </Field>
            <Field label="Priority">
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as ProductionPriority })} className="w-full border rounded p-2">
                {['Low', 'Normal', 'High', 'Urgent'].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className={`rounded-lg p-3 ${stockWarning ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-900'}`}>
            Available {form.materialSource === 'NEW' ? 'new' : 'recycled'} stock: <strong>{stockForStockLabel(stockForSource)}</strong> · Estimated input:{' '}
            <strong>{estimatedInput} kg</strong>
            {stockWarning ? ' — insufficient for planned run' : ''}
          </div>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border rounded p-2" rows={2} placeholder="Notes" />
        </FormCard>

        <div className="space-y-3">
          <select className="text-xs border rounded p-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            {['Draft', 'Planned', 'Approved', 'In Progress', 'Completed', 'Cancelled'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <BatchTable
            headers={['Plan #', 'Date', 'Brand', 'Output kg', 'Source', 'Est. input', 'Priority', 'Status', 'Actions']}
            rows={rows.map((p) => [
              p.planNumber,
              p.plannedProductionDate,
              p.brand,
              p.plannedOutputQtyKg,
              p.materialSource,
              p.requiredRawMaterialQtyKg,
              p.priority,
              p.status,
              '',
            ])}
            onRowClick={(i) => {
              const plan = rows[i];
              if (plan.status === 'Draft') updateProductionPlanStatus(plan.id, 'Planned');
            }}
          />
          <ActionRow className="flex flex-wrap gap-2">
            {rows.slice(0, 3).map((p) => (
              <div key={p.id} className="flex gap-1 items-center text-xs">
                <ProductionPlanStatusBadge status={p.status} />
                <Button size="sm" variant="outline" onClick={() => updateProductionPlanStatus(p.id, 'Approved')}>Approve</Button>
                <Button size="sm" variant="outline" onClick={() => {
                  const id = convertPlanToBatch(p.id);
                  if (id) {
                    setSelectedEntityId(id);
                    setCurrentView('production-create');
                  }
                }}>→ Batch</Button>
              </div>
            ))}
          </ActionRow>
        </div>
      </div>
    </ProductionPageShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[#64748B]">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function stockForStockLabel(kg: number) {
  return `${kg.toLocaleString()} kg`;
}

function FormCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>;
}

function ActionRow({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>;
}