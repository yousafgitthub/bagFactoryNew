'use client';

import React from 'react';
import { InventoryItem } from '../../types/erp';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useERP } from '../../context/ERPContext';
import { Boxes, MapPin, Tag, Truck, History } from 'lucide-react';

interface InventoryDetailModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAdjust: (item: InventoryItem) => void;
  onOpenTransfer: (item: InventoryItem) => void;
}

export function InventoryDetailModal({
  item,
  isOpen,
  onClose,
  onOpenAdjust,
  onOpenTransfer,
}: InventoryDetailModalProps) {
  const { stockMovements } = useERP();

  if (!item) return null;

  const itemMovements = stockMovements.filter((m) => m.itemId === item.id || m.batchNumber === item.batchNumber);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item.name}
      subtitle={`Batch: ${item.batchNumber} • Warehouse: ${item.warehouse}`}
      maxWidth="2xl"
    >
      <div className="space-y-6 text-xs text-[#1E293B]">
        {/* Top Highlight Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[#64748B] block text-[11px]">Available Stock</span>
            <span className="text-xl font-bold text-[#1E293B] mt-0.5 block">
              {item.availableKg.toLocaleString()} kg
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[#64748B] block text-[11px]">Unit Cost</span>
            <span className="text-xl font-bold text-[#1E293B] mt-0.5 block">
              Rs. {item.unitCost.toLocaleString()} <span className="text-xs font-normal">/ kg</span>
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[#64748B] block text-[11px]">Total Stock Value</span>
            <span className="text-xl font-bold text-blue-600 mt-0.5 block">
              Rs. {item.totalValue.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[#64748B] block text-[11px]">Stock Status</span>
            <div className="mt-1">
              <Badge variant={item.status === 'Healthy' ? 'success' : item.status === 'Low Stock' ? 'warning' : 'danger'}>
                {item.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3">
          <h4 className="font-bold text-sm text-[#1E293B] border-b pb-2">Material Specifications & Origin</h4>
          <div className="grid grid-cols-2 gap-y-2.5 text-xs">
            <div>
              <span className="text-[#64748B]">Category:</span>{' '}
              <span className="font-semibold">{item.category.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="text-[#64748B]">Warehouse Location:</span>{' '}
              <span className="font-semibold">{item.warehouse}</span>
            </div>
            <div>
              <span className="text-[#64748B]">Supplier / Origin:</span>{' '}
              <span className="font-semibold">{item.supplier || 'Factory Internal'}</span>
            </div>
            <div>
              <span className="text-[#64748B]">Material Source:</span>{' '}
              <span className="font-semibold">{item.sourceType || 'Standard'}</span>
            </div>
            {item.grade && (
              <div>
                <span className="text-[#64748B]">Grade / Spec:</span>{' '}
                <span className="font-semibold">{item.grade}</span>
              </div>
            )}
            {item.color && (
              <div>
                <span className="text-[#64748B]">Color / Variant:</span>{' '}
                <span className="font-semibold">{item.color}</span>
              </div>
            )}
            <div>
              <span className="text-[#64748B]">Reorder Threshold:</span>{' '}
              <span className="font-semibold">{item.reorderLevelKg} kg</span>
            </div>
            <div>
              <span className="text-[#64748B]">Last Updated:</span>{' '}
              <span className="font-semibold">{item.lastUpdated}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              onOpenTransfer(item);
            }}
          >
            Transfer to Warehouse
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              onClose();
              onOpenAdjust(item);
            }}
          >
            Adjust Physical Count
          </Button>
        </div>

        {/* Audit Movements Ledger for this item */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" /> Recent Stock Movements
            </h4>
            <span className="text-[11px] text-slate-400">Auditable transactions</span>
          </div>

          <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Ref #</th>
                  <th className="py-2 px-3 text-right">Qty (kg)</th>
                  <th className="py-2 px-3">Operator</th>
                  <th className="py-2 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {itemMovements.length > 0 ? (
                  itemMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-500">{m.date}</td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {m.type}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-blue-600">{m.referenceNo}</td>
                      <td className="py-2 px-3 text-right font-bold">{m.qtyKg} kg</td>
                      <td className="py-2 px-3 text-slate-600">{m.operator}</td>
                      <td className="py-2 px-3 text-slate-500 truncate max-w-xs">{m.notes}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-slate-400">
                      No stock movements recorded yet for this item.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}
