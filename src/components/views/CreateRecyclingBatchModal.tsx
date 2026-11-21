'use client';

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useERP } from '../../context/ERPContext';
import { Recycle, AlertCircle, Plus } from 'lucide-react';

interface CreateRecyclingBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateRecyclingBatchModal({ isOpen, onClose }: CreateRecyclingBatchModalProps) {
  const { inventory, createRecyclingBatch, recyclingOutputTypes, addRecyclingOutputType } = useERP();

  const wasteInventory = inventory.filter((i) => i.category === 'WASTE_PLASTIC' && i.availableKg > 0);
  const defaultWaste = wasteInventory[0];

  const [selectedWasteId, setSelectedWasteId] = useState<string>(defaultWaste?.id || '');
  const [inputWasteQtyKg, setInputWasteQtyKg] = useState<number>(500);
  const [outputMaterialType, setOutputMaterialType] = useState<string>(
    recyclingOutputTypes[0]?.name || 'Reprocessed HDPE Granules Grade-A'
  );
  const [outputQtyKg, setOutputQtyKg] = useState<number>(455);
  const [laborCost, setLaborCost] = useState<number>(5000);
  const [electricityCost, setElectricityCost] = useState<number>(9000);
  const [machineCost, setMachineCost] = useState<number>(3000);
  const [otherCosts, setOtherCosts] = useState<number>(1500);
  const [operator, setOperator] = useState('Naveed Akhtar (Recycling Supervisor)');
  const [destinationWarehouse, setDestinationWarehouse] = useState('Recycled Polymer Silo C');
  const [notes, setNotes] = useState('');

  // Custom output material inline creator
  const [isAddingNewType, setIsAddingNewType] = useState(false);
  const [customTypeName, setCustomTypeName] = useState('');

  const activeWasteItem = wasteInventory.find((w) => w.id === selectedWasteId) || defaultWaste;
  const wasteUnitCost = activeWasteItem ? activeWasteItem.unitCost : 120;
  const availableWasteKg = activeWasteItem ? activeWasteItem.availableKg : 0;

  // Real-time calculations
  const rawWasteCost = inputWasteQtyKg * wasteUnitCost;
  const totalProcessingCost = laborCost + electricityCost + machineCost + otherCosts;
  const totalBatchCost = rawWasteCost + totalProcessingCost;
  const processingLossKg = Math.max(0, inputWasteQtyKg - outputQtyKg);
  const yieldPercentage =
    inputWasteQtyKg > 0 ? Number(((outputQtyKg / inputWasteQtyKg) * 100).toFixed(2)) : 0;
  const costPerKg = outputQtyKg > 0 ? Number((totalBatchCost / outputQtyKg).toFixed(2)) : 0;

  const batchNumber = `REC-2026-${Math.floor(100 + Math.random() * 900)}`;

  const handleAddNewCustomType = () => {
    if (!customTypeName.trim()) return;
    addRecyclingOutputType(customTypeName.trim(), 'Custom factory configured output type');
    setOutputMaterialType(customTypeName.trim());
    setCustomTypeName('');
    setIsAddingNewType(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWasteItem) return;

    createRecyclingBatch({
      batchNumber,
      wasteInputBatchId: activeWasteItem.id,
      wasteInputName: activeWasteItem.name,
      inputWasteQtyKg,
      wasteCostPerKg: wasteUnitCost,
      outputMaterialType, // Configurable!
      outputQtyKg,
      laborCost,
      electricityCost,
      machineCost,
      otherCosts,
      processingDate: new Date().toISOString().split('T')[0],
      operator,
      status: 'Completed',
      notes: notes || `Recycled output material: ${outputMaterialType}`,
      destinationWarehouse,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Recycling Batch"
      subtitle="Transform purchased waste plastic into configurable recycled raw material"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Workflow reminder banner */}
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between text-purple-900">
          <div className="flex items-center gap-2">
            <Recycle className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <span className="font-semibold">
              External Waste Plastic &rarr; Shredding & Washing &rarr; Extrusion &rarr; Configurable Recycled Material
            </span>
          </div>
        </div>

        {/* 1. Input Waste Batch Selection */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Input Waste Plastic Batch *
          </label>
          <select
            value={activeWasteItem ? activeWasteItem.id : ''}
            onChange={(e) => setSelectedWasteId(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold"
          >
            {wasteInventory.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} [{w.batchNumber}] — {w.availableKg} kg available (@ Rs. {w.unitCost}/kg)
              </option>
            ))}
          </select>
        </div>

        {/* 2. Output Material Type (Configurable - NEVER assume granules) */}
        <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-800">
              Configurable Output Material Type *
            </label>
            <button
              type="button"
              onClick={() => setIsAddingNewType(!isAddingNewType)}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              {isAddingNewType ? 'Choose from list' : '+ Add New Material Type'}
            </button>
          </div>

          {!isAddingNewType ? (
            <select
              value={outputMaterialType}
              onChange={(e) => setOutputMaterialType(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-bold"
            >
              {recyclingOutputTypes.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.code})
                </option>
              ))}
            </select>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Densified Agglomerate Grade B, Re-Pelletized Film Resin..."
                value={customTypeName}
                onChange={(e) => setCustomTypeName(e.target.value)}
                className="flex-1 p-2 border border-blue-400 rounded-lg text-slate-900 font-medium"
              />
              <Button type="button" size="sm" onClick={handleAddNewCustomType}>
                Save Type
              </Button>
            </div>
          )}
          <p className="text-[10px] text-slate-500">
            System allows any factory output type (Granules, Flakes, Pellets, Agglomerates, Re-compounded resin).
          </p>
        </div>

        {/* 3. Input & Output Quantities (kg) */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Input Waste Quantity (kg) *
            </label>
            <input
              type="number"
              min="10"
              max={availableWasteKg}
              required
              value={inputWasteQtyKg}
              onChange={(e) => setInputWasteQtyKg(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold text-sm"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Available in yard: {availableWasteKg} kg
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Usable Output Quantity (kg) *
            </label>
            <input
              type="number"
              min="1"
              max={inputWasteQtyKg}
              required
              value={outputQtyKg}
              onChange={(e) => setOutputQtyKg(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold text-sm text-purple-700"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Processing loss: <span className="font-bold text-rose-600">{processingLossKg} kg</span> ({((processingLossKg / inputWasteQtyKg) * 100 || 0).toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* 4. Processing Costs (Electricity, Labor, Machine, Overheads) */}
        <div className="space-y-2">
          <label className="block font-semibold text-slate-800">
            Attributable Recycling Processing Costs
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <span className="text-[11px] text-slate-600 block mb-0.5">Direct Labor (PKR)</span>
              <input
                type="number"
                value={laborCost}
                onChange={(e) => setLaborCost(Number(e.target.value))}
                className="w-full p-1.5 border border-slate-300 rounded-md text-slate-900 font-medium"
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-600 block mb-0.5">Electricity / Power</span>
              <input
                type="number"
                value={electricityCost}
                onChange={(e) => setElectricityCost(Number(e.target.value))}
                className="w-full p-1.5 border border-slate-300 rounded-md text-slate-900 font-medium"
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-600 block mb-0.5">Machine & Wear</span>
              <input
                type="number"
                value={machineCost}
                onChange={(e) => setMachineCost(Number(e.target.value))}
                className="w-full p-1.5 border border-slate-300 rounded-md text-slate-900 font-medium"
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-600 block mb-0.5">Water & Additives</span>
              <input
                type="number"
                value={otherCosts}
                onChange={(e) => setOtherCosts(Number(e.target.value))}
                className="w-full p-1.5 border border-slate-300 rounded-md text-slate-900 font-medium"
              />
            </div>
          </div>
        </div>

        {/* 5. Real-Time Calculation Summary */}
        <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-purple-900 font-medium">Waste Plastic Consumed Cost:</span>
            <span className="font-semibold text-slate-900">Rs. {rawWasteCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-purple-900 font-medium">Total Processing Overheads:</span>
            <span className="font-semibold text-slate-900">Rs. {totalProcessingCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-xs border-t border-purple-200 pt-1.5">
            <span className="font-bold text-purple-950">Total Batch Cost:</span>
            <span className="text-base font-bold text-purple-700">
              Rs. {totalBatchCost.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs pt-1 border-t border-purple-100">
            <span className="text-slate-600">Calculated Recycled Raw Material Cost:</span>
            <span className="font-bold text-emerald-700 text-sm">
              Rs. {costPerKg.toLocaleString()} / kg (Yield: {yieldPercentage}%)
            </span>
          </div>
        </div>

        {/* 6. Destination Silo & Operator */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Destination Warehouse</label>
            <select
              value={destinationWarehouse}
              onChange={(e) => setDestinationWarehouse(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900"
            >
              <option value="Recycled Polymer Silo C">Recycled Polymer Silo C</option>
              <option value="Raw Material Store A">Raw Material Store A</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Recycling Supervisor</label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Execute & Post Batch
          </Button>
        </div>
      </form>
    </Modal>
  );
}
