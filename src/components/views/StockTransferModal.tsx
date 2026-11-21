'use client';

import React, { useState } from 'react';
import { InventoryItem } from '../../types/erp';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useERP } from '../../context/ERPContext';

interface StockTransferModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StockTransferModal({ item, isOpen, onClose }: StockTransferModalProps) {
  const { transferStock, warehouses } = useERP();

  const destinationOptions = warehouses.filter(
    (w) => w.status === 'Active' && w.name !== item?.warehouse
  );
  const [toWarehouse, setToWarehouse] = useState(destinationOptions[0]?.name ?? '');
  const [qtyKg, setQtyKg] = useState<number>(100);

  if (!item) return null;

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (qtyKg <= 0 || qtyKg > item.availableKg) return;

    transferStock(item.id, item.warehouse, toWarehouse, qtyKg);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Warehouse Stock Transfer"
      subtitle={`Moving: ${item.name} (${item.batchNumber})`}
      maxWidth="md"
    >
      <form onSubmit={handleTransfer} className="space-y-4 text-xs">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex justify-between">
            <span className="text-[#64748B]">From Warehouse:</span>
            <span className="font-bold text-[#1E293B]">{item.warehouse}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[#64748B]">Available to Transfer:</span>
            <span className="font-bold text-blue-600">{item.availableKg} kg</span>
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Destination Warehouse *</label>
          <select
            value={toWarehouse}
            onChange={(e) => setToWarehouse(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900"
          >
            {destinationOptions.map((w) => (
              <option key={w.id} value={w.name}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Transfer Quantity (kg) *</label>
          <input
            type="number"
            min="1"
            max={item.availableKg}
            required
            value={qtyKg}
            onChange={(e) => setQtyKg(Number(e.target.value))}
            className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Confirm Transfer
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface StockAdjustModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StockAdjustModal({ item, isOpen, onClose }: StockAdjustModalProps) {
  const { adjustStock } = useERP();

  const [newQtyKg, setNewQtyKg] = useState<number>(item?.availableKg || 0);
  const [reason, setReason] = useState('Physical audit count verification');

  if (!item) return null;

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    adjustStock(item.id, newQtyKg, reason);
    onClose();
  };

  const diff = newQtyKg - item.availableKg;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Physical Stock Count Adjustment"
      subtitle={`Adjusting stock count for: ${item.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleAdjust} className="space-y-4 text-xs">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
          <div className="flex justify-between">
            <span className="text-[#64748B]">System Recorded Quantity:</span>
            <span className="font-bold text-[#1E293B]">{item.availableKg} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#64748B]">Variance / Difference:</span>
            <span className={`font-bold ${diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {diff >= 0 ? `+${diff}` : diff} kg
            </span>
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">New Verified Physical Quantity (kg) *</label>
          <input
            type="number"
            min="0"
            required
            value={newQtyKg}
            onChange={(e) => setNewQtyKg(Number(e.target.value))}
            className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
          />
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Adjustment Reason *</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900"
          >
            <option value="Physical audit count verification">Physical audit count verification</option>
            <option value="Weighbridge discrepancy correction">Weighbridge discrepancy correction</option>
            <option value="Damaged scrap disposal">Damaged scrap disposal</option>
            <option value="Moisture evaporation loss in waste">Moisture evaporation loss in waste</option>
            <option value="Other authorized adjustment">Other authorized adjustment</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" type="submit">
            Apply Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
