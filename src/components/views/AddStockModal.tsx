'use client';

import React, { useState } from 'react';
import { InventoryCategory, StockStatus } from '../../types/erp';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useERP } from '../../context/ERPContext';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddStockModal({ isOpen, onClose }: AddStockModalProps) {
  const { addStock, suppliers } = useERP();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('NEW_BRANDED');
  const [warehouse, setWarehouse] = useState('Raw Material Store A');
  const [availableKg, setAvailableKg] = useState<number>(500);
  const [unitCost, setUnitCost] = useState<number>(380);
  const [supplier, setSupplier] = useState(suppliers[0]?.name || 'Pak Polymer Industries Ltd.');
  const [batchNumber, setBatchNumber] = useState('LOT-' + Math.floor(1000 + Math.random() * 9000));
  const [reorderLevelKg, setReorderLevelKg] = useState<number>(400);
  const [grade, setGrade] = useState('');
  const [color, setColor] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const status: StockStatus =
      availableKg <= 0 ? 'Critical' : availableKg < reorderLevelKg ? 'Low Stock' : 'Healthy';

    addStock({
      name,
      category,
      warehouse,
      availableKg,
      reservedKg: 0,
      unitCost,
      supplier,
      batchNumber,
      status,
      reorderLevelKg,
      grade: grade || undefined,
      color: color || undefined,
      sourceType: category === 'NEW_BRANDED' ? 'NEW' : category === 'RECYCLED_RAW' ? 'RECYCLED' : 'PURCHASED',
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Inventory Stock Entry"
      subtitle="Record new material or bag stock into warehouse inventory"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-medium text-slate-700 mb-1">Stock Category *</label>
          <select
            value={category}
            onChange={(e) => {
              const cat = e.target.value as InventoryCategory;
              setCategory(cat);
              if (cat === 'NEW_BRANDED') setWarehouse('Raw Material Store A');
              else if (cat === 'WASTE_PLASTIC') setWarehouse('Waste Scrap Yard B');
              else if (cat === 'RECYCLED_RAW') setWarehouse('Recycled Polymer Silo C');
              else if (cat === 'FINISHED_GOODS') setWarehouse('Finished Goods Hall D');
            }}
            className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900"
          >
            <option value="NEW_BRANDED">1. New Branded Raw Material (Virgin)</option>
            <option value="WASTE_PLASTIC">2. Purchased Waste Plastic (External Scrap)</option>
            <option value="RECYCLED_RAW">3. Recycled Raw Material (Internal Output)</option>
            <option value="FINISHED_GOODS">4. Finished Shopping Bags (ABHA / Crystal)</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Item / Material Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sabic Virgin HDPE B5429 or ABHA White Bags"
            className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Warehouse Location *</label>
            <select
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900"
            >
              <option value="Raw Material Store A">Raw Material Store A</option>
              <option value="Waste Scrap Yard B">Waste Scrap Yard B</option>
              <option value="Recycled Polymer Silo C">Recycled Polymer Silo C</option>
              <option value="Finished Goods Hall D">Finished Goods Hall D</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Batch / Lot Number *</label>
            <input
              type="text"
              required
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Quantity in Kilograms (kg) *</label>
            <input
              type="number"
              min="1"
              required
              value={availableKg}
              onChange={(e) => setAvailableKg(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-semibold"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Unit Cost (PKR / kg) *</label>
            <input
              type="number"
              min="1"
              required
              value={unitCost}
              onChange={(e) => setUnitCost(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-semibold"
            />
          </div>
        </div>

        {/* Calculated Total Value */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs">
          <span className="text-blue-900 font-medium">Calculated Stock Value:</span>
          <span className="text-base font-bold text-blue-700">
            Rs. {(availableKg * unitCost).toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Supplier / Origin</label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Supplier name or Factory internal"
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Reorder Level (kg)</label>
            <input
              type="number"
              value={reorderLevelKg}
              onChange={(e) => setReorderLevelKg(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Add to Stock
          </Button>
        </div>
      </form>
    </Modal>
  );
}
