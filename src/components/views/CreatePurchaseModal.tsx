'use client';

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useERP } from '../../context/ERPContext';
import { ShoppingCart } from 'lucide-react';

interface CreatePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePurchaseModal({ isOpen, onClose }: CreatePurchaseModalProps) {
  const { suppliers, createPurchaseBill } = useERP();

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [purchaseNumber, setPurchaseNumber] = useState(`PUR-${Math.floor(210 + Math.random() * 800)}`);
  const [category, setCategory] = useState<'NEW_BRANDED' | 'WASTE_PLASTIC' | 'SUPPLIES'>('NEW_BRANDED');
  const [materialName, setMaterialName] = useState('Virgin Grade HDPE Resin (Sabic B5429)');
  const [quantityKg, setQuantityKg] = useState<number>(1000);
  const [ratePerKg, setRatePerKg] = useState<number>(380);
  const [paidAmount, setPaidAmount] = useState<number>(200000);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [warehouse, setWarehouse] = useState('Raw Material Store A');
  const [documentRef, setDocumentRef] = useState('');
  const [notes, setNotes] = useState('');

  const selectedSupplier = suppliers.find((s) => s.id === supplierId) || suppliers[0];
  const totalAmount = quantityKg * ratePerKg;
  const remainingPayable = Math.max(0, totalAmount - paidAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;

    createPurchaseBill({
      purchaseNumber,
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      category,
      materialName,
      quantityKg,
      ratePerKg,
      totalAmount,
      paidAmount,
      purchaseDate,
      dueDate,
      warehouse,
      documentRef: documentRef || undefined,
      notes: notes || `Received at ${warehouse}`,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Supplier Purchase Bill"
      subtitle="Procure virgin polymer, waste scrap, or factory consumables"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="block font-medium text-slate-700 mb-1">Supplier *</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-bold"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Purchase Bill # *</label>
            <input
              type="text"
              required
              value={purchaseNumber}
              onChange={(e) => setPurchaseNumber(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Purchase Date *</label>
            <input
              type="date"
              required
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Material Category *</label>
            <select
              value={category}
              onChange={(e) => {
                const cat = e.target.value as any;
                setCategory(cat);
                if (cat === 'WASTE_PLASTIC') {
                  setWarehouse('Waste Scrap Yard B');
                  setRatePerKg(120);
                  setMaterialName('Post-Consumer LDPE Clean Film Scrap');
                } else {
                  setWarehouse('Raw Material Store A');
                  setRatePerKg(380);
                  setMaterialName('Virgin Grade HDPE Resin (Sabic B5429)');
                }
              }}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold"
            >
              <option value="NEW_BRANDED">New Branded Raw Material (Virgin)</option>
              <option value="WASTE_PLASTIC">Purchased Waste Plastic (Recycling Feed)</option>
              <option value="SUPPLIES">Factory Consumables & Supplies</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Receiving Warehouse *</label>
            <select
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900"
            >
              <option value="Raw Material Store A">Raw Material Store A</option>
              <option value="Waste Scrap Yard B">Waste Scrap Yard B</option>
              <option value="Finished Goods Hall D">Finished Goods Hall D</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Material / Supply Name *</label>
          <input
            type="text"
            required
            value={materialName}
            onChange={(e) => setMaterialName(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-medium"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Quantity in kg *</label>
            <input
              type="number"
              min="1"
              required
              value={quantityKg}
              onChange={(e) => setQuantityKg(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Rate per kg (PKR) *</label>
            <input
              type="number"
              min="1"
              required
              value={ratePerKg}
              onChange={(e) => setRatePerKg(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
            />
          </div>
        </div>

        {/* Financials */}
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-blue-950">Total Bill Value:</span>
            <span className="text-base font-bold text-blue-700">
              Rs. {totalAmount.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-blue-200">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Paid Amount (PKR)</label>
              <input
                type="number"
                min="0"
                max={totalAmount}
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="w-full p-1.5 border border-slate-300 rounded text-slate-900 font-bold"
              />
            </div>
            <div>
              <span className="block text-slate-600 mb-1">Payable Balance:</span>
              <span className="text-sm font-bold text-rose-600 block pt-1">
                Rs. {remainingPayable.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Payment Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Weighbridge / Bill Slip Ref</label>
            <input
              type="text"
              placeholder="e.g. WEIGH-4892.pdf"
              value={documentRef}
              onChange={(e) => setDocumentRef(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Post Purchase Bill
          </Button>
        </div>
      </form>
    </Modal>
  );
}
