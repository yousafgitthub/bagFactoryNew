'use client';

import React, { useState } from 'react';
import { ProductionSource } from '../../types/erp';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useERP } from '../../context/ERPContext';
import { AlertCircle, CheckCircle2, Factory } from 'lucide-react';

interface CreateProductionBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProductionBatchModal({
  isOpen,
  onClose,
}: CreateProductionBatchModalProps) {
  const { inventory, createProductionBatch, currentUser } = useERP();

  const [productName, setProductName] = useState<'ABHA' | 'Crystal'>('ABHA');
  const [color, setColor] = useState('White');
  const [materialSource, setMaterialSource] = useState<ProductionSource>('RECYCLED');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [rawMaterialQtyKg, setRawMaterialQtyKg] = useState<number>(300);
  const [finishedGoodsOutputKg, setFinishedGoodsOutputKg] = useState<number>(276);
  const [laborCost, setLaborCost] = useState<number>(5000);
  const [electricityCost, setElectricityCost] = useState<number>(7500);
  const [machineCost, setMachineCost] = useState<number>(2500);
  const [otherCosts, setOtherCosts] = useState<number>(1000);
  const [operator, setOperator] = useState('Muhammad Rafiq (Extrusion Master)');
  const [notes, setNotes] = useState('');

  // Auto-generate batch number
  const batchNumber = `PRD-2026-${Math.floor(100 + Math.random() * 900)}`;

  // Filter eligible raw materials strictly by source!
  // NEW source can ONLY use category NEW_BRANDED
  // RECYCLED source can ONLY use category RECYCLED_RAW
  const eligibleMaterials = inventory.filter((item) => {
    if (materialSource === 'NEW') {
      return item.category === 'NEW_BRANDED' && item.availableKg > 0;
    } else {
      return item.category === 'RECYCLED_RAW' && item.availableKg > 0;
    }
  });

  // Auto-select first eligible item if not selected
  const activeSelectedBatch =
    eligibleMaterials.find((m) => m.id === selectedBatchId) || eligibleMaterials[0];

  const currentAvailableKg = activeSelectedBatch ? activeSelectedBatch.availableKg : 0;
  const currentUnitCost = activeSelectedBatch ? activeSelectedBatch.unitCost : 0;

  // Real-time calculations
  const rawMaterialCost = rawMaterialQtyKg * currentUnitCost;
  const totalOverhead = laborCost + electricityCost + machineCost + otherCosts;
  const totalProductionCost = rawMaterialCost + totalOverhead;
  const processingLossKg = Math.max(0, rawMaterialQtyKg - finishedGoodsOutputKg);
  const yieldPercentage =
    rawMaterialQtyKg > 0
      ? Number(((finishedGoodsOutputKg / rawMaterialQtyKg) * 100).toFixed(2))
      : 0;
  const costPerKg =
    finishedGoodsOutputKg > 0
      ? Number((totalProductionCost / finishedGoodsOutputKg).toFixed(2))
      : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSelectedBatch) return;

    createProductionBatch({
      batchNumber,
      productName,
      color,
      materialSource, // STRICT: Only NEW or RECYCLED!
      rawMaterialName: activeSelectedBatch.name,
      rawMaterialBatchId: activeSelectedBatch.id,
      inputWarehouse: activeSelectedBatch.warehouse,
      rawMaterialQtyKg,
      rawMaterialCostPerKg: activeSelectedBatch.unitCost,
      finishedGoodsOutputKg,
      rejectedOutputKg: 0,
      reusableByproductKg: 0,
      productionDate: new Date().toISOString().split('T')[0],
      laborCost,
      electricityCost,
      machineCost,
      maintenanceCost: 0,
      packagingCost: 0,
      transportCost: 0,
      otherCosts,
      operator,
      status: 'Completed',
      notes: notes || `Extrusion and sealing for ${productName} ${color}`,
      outputBatchNumber: `FG-${productName.slice(0, 4).toUpperCase()}-${color.slice(0, 1).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      finishedGoodsWarehouse: 'Finished Goods Hall D',
      rawStockDeducted: false,
      finishedStockPosted: false,
      timeline: [],
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Production Batch"
      subtitle="Extrusion & bag making run with strict material source separation"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Strict Separation Rule Banner */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-amber-900 leading-relaxed">
            <span className="font-bold">Strict Factory Separation Rule:</span> Both material sources
            are processed independently. Never combine New Branded and Recycled polymer in the same
            batch.
          </div>
        </div>

        {/* 1. Material Source Toggle */}
        <div>
          <label className="block font-semibold text-slate-800 mb-1.5">
            Material Source Selection *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setMaterialSource('RECYCLED');
                setSelectedBatchId('');
              }}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                materialSource === 'RECYCLED'
                  ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Badge variant="recycled">RECYCLED RAW MATERIAL</Badge>
                {materialSource === 'RECYCLED' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Utilize internally processed recycled polymer (e.g. for standard ABHA bags)
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setMaterialSource('NEW');
                setSelectedBatchId('');
              }}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                materialSource === 'NEW'
                  ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Badge variant="new">NEW BRANDED RAW MATERIAL</Badge>
                {materialSource === 'NEW' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Utilize virgin imported polymer (Sabic / Borouge) for high-clarity bags
              </p>
            </button>
          </div>
        </div>

        {/* 2. Product and Color Selection */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Finished Product Line *</label>
            <select
              value={productName}
              onChange={(e) => setProductName(e.target.value as 'ABHA' | 'Crystal')}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold"
            >
              <option value="ABHA">ABHA Shopping Bags</option>
              <option value="Crystal">Crystal Shopping Bags (High-Strength)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Color / Variant *</label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold"
            >
              <option value="White">White (Standard)</option>
              <option value="Black">Black (Heavy Duty)</option>
              <option value="White/Clear">White / Clear Transparent</option>
              <option value="Blue">Blue Printed</option>
            </select>
          </div>
        </div>

        {/* 3. Raw Material Input Batch */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Available {materialSource === 'NEW' ? 'New Branded' : 'Recycled'} Raw Material Batch *
          </label>
          <select
            value={activeSelectedBatch ? activeSelectedBatch.id : ''}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-medium"
          >
            {eligibleMaterials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} [Batch: {m.batchNumber}] — {m.availableKg} kg available (@ Rs. {m.unitCost}/kg)
              </option>
            ))}
          </select>
        </div>

        {/* 4. Quantities & Output (kg) */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Raw Material Input (kg) *
            </label>
            <input
              type="number"
              min="10"
              max={currentAvailableKg}
              required
              value={rawMaterialQtyKg}
              onChange={(e) => setRawMaterialQtyKg(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold text-sm"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Max available: {currentAvailableKg} kg
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Finished Goods Output (kg) *
            </label>
            <input
              type="number"
              min="1"
              max={rawMaterialQtyKg}
              required
              value={finishedGoodsOutputKg}
              onChange={(e) => setFinishedGoodsOutputKg(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold text-sm text-emerald-700"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Processing loss: <span className="font-bold text-rose-600">{processingLossKg} kg</span> ({((processingLossKg / rawMaterialQtyKg) * 100 || 0).toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* 5. Production Conversion Costs */}
        <div className="space-y-2">
          <label className="block font-semibold text-slate-800">
            Conversion Costs (Direct Factory Overheads)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <span className="text-[11px] text-slate-600 block mb-0.5">Labor Cost (PKR)</span>
              <input
                type="number"
                value={laborCost}
                onChange={(e) => setLaborCost(Number(e.target.value))}
                className="w-full p-1.5 border border-slate-300 rounded-md text-slate-900 font-medium"
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-600 block mb-0.5">Electricity Cost (PKR)</span>
              <input
                type="number"
                value={electricityCost}
                onChange={(e) => setElectricityCost(Number(e.target.value))}
                className="w-full p-1.5 border border-slate-300 rounded-md text-slate-900 font-medium"
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-600 block mb-0.5">Machine Run (PKR)</span>
              <input
                type="number"
                value={machineCost}
                onChange={(e) => setMachineCost(Number(e.target.value))}
                className="w-full p-1.5 border border-slate-300 rounded-md text-slate-900 font-medium"
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-600 block mb-0.5">Other Overheads (PKR)</span>
              <input
                type="number"
                value={otherCosts}
                onChange={(e) => setOtherCosts(Number(e.target.value))}
                className="w-full p-1.5 border border-slate-300 rounded-md text-slate-900 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Real-time Summary Card */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-blue-900 font-medium">Raw Material Cost:</span>
            <span className="font-semibold text-slate-900">Rs. {rawMaterialCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-blue-900 font-medium">Conversion Overheads:</span>
            <span className="font-semibold text-slate-900">Rs. {totalOverhead.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-xs border-t border-blue-200 pt-1.5">
            <span className="font-bold text-blue-950">Total Batch Cost:</span>
            <span className="text-base font-bold text-blue-700">
              Rs. {totalProductionCost.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs pt-1 border-t border-blue-100">
            <span className="text-slate-600">Calculated Cost Per Kg Finished Goods:</span>
            <span className="font-bold text-emerald-700 text-sm">
              Rs. {costPerKg.toLocaleString()} / kg (Yield: {yieldPercentage}%)
            </span>
          </div>
        </div>

        {/* Operator and Notes */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Extrusion Master / Operator</label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Batch Run Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Standard micron thickness maintained"
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Complete & Post Batch
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface ProductionBatchDetailModalProps {
  batch: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductionBatchDetailModal({
  batch,
  isOpen,
  onClose,
}: ProductionBatchDetailModalProps) {
  if (!batch) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Batch: ${batch.batchNumber}`}
      subtitle={`${batch.productName} ${batch.color} • ${batch.materialSource} Material Source`}
      maxWidth="xl"
    >
      <div className="space-y-4 text-xs text-slate-800">
        <div className="flex items-center justify-between pb-3 border-b">
          <Badge variant={batch.materialSource === 'RECYCLED' ? 'recycled' : 'new'}>
            {batch.materialSource} SOURCE
          </Badge>
          <span className="font-semibold text-slate-500">Date: {batch.productionDate}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-500 text-[11px] block">Material Consumed</span>
            <span className="text-base font-bold text-slate-900">{batch.rawMaterialQtyKg} kg</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg">
            <span className="text-emerald-800 text-[11px] block">Finished Output</span>
            <span className="text-base font-bold text-emerald-900">{batch.finishedGoodsOutputKg} kg</span>
          </div>
          <div className="p-3 bg-rose-50 rounded-lg">
            <span className="text-rose-800 text-[11px] block">Processing Loss</span>
            <span className="text-base font-bold text-rose-900">{batch.processingLossKg} kg</span>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-800 text-[11px] block">Yield %</span>
            <span className="text-base font-bold text-blue-900">{batch.yieldPercentage}%</span>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 space-y-2">
          <h4 className="font-bold text-sm text-slate-900">Cost Composition</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Labor Cost: <span className="font-bold">Rs. {batch.laborCost.toLocaleString()}</span></div>
            <div>Power / Electricity: <span className="font-bold">Rs. {batch.electricityCost.toLocaleString()}</span></div>
            <div>Machine Run: <span className="font-bold">Rs. {batch.machineCost.toLocaleString()}</span></div>
            <div>Other Overheads: <span className="font-bold">Rs. {batch.otherCosts.toLocaleString()}</span></div>
          </div>
          <div className="pt-2 border-t flex justify-between items-center">
            <span className="font-bold text-slate-900">Total Production Cost:</span>
            <span className="text-base font-bold text-blue-600">Rs. {batch.totalCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Unit Cost to Manufacture:</span>
            <span className="font-bold text-emerald-700">Rs. {batch.costPerKg} / kg</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-[11px] text-slate-500">Extrusion Master / Operator: <span className="font-bold text-slate-800">{batch.operator}</span></p>
          <p className="text-[11px] text-slate-500 mt-1">Output Batch Assigned: <span className="font-bold text-slate-800">{batch.outputBatchNumber}</span></p>
          {batch.notes && <p className="text-[11px] text-slate-500 mt-1">Notes: {batch.notes}</p>}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
