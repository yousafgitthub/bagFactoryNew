'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { PurchasingPageShell } from './PurchasingPageShell';
import { Button } from '../../common/Button';
import { computeLineTotal, computePurchaseTotals, inventoryCategoryForPurchase } from '../../../purchasing/purchasingUtils';
import type { PurchaseCategory, PurchaseItem } from '../../../types/erp';

export function PurchasingCreateView() {
  const { suppliers, warehouses, savePurchaseDraft, confirmPurchaseOrder, setCurrentView } = useERP();
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? '');
  const [category, setCategory] = useState<PurchaseCategory>('NEW_RAW_MATERIAL');
  const [warehouse, setWarehouse] = useState(warehouses[0]?.name ?? 'Raw Material Store A');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [lines, setLines] = useState([
    { itemName: 'Virgin Grade HDPE Resin (Sabic B5429)', orderedQty: 500, ratePerUnit: 380, unit: 'kg' as const },
  ]);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [discount, setDiscount] = useState(0);

  const enriched: PurchaseItem[] = lines.map((l, idx) => ({
    id: `new-l${idx}`,
    itemName: l.itemName,
    inventoryCategory: inventoryCategoryForPurchase(category),
    orderedQty: l.orderedQty,
    receivedQty: 0,
    ratePerUnit: l.ratePerUnit,
    unit: l.unit,
    lineTotal: computeLineTotal(l.orderedQty, l.ratePerUnit),
  }));
  const totals = computePurchaseTotals(enriched, 'Fixed', discount, additionalCharges, false, 0);

  const submitDraft = (e: React.FormEvent) => {
    e.preventDefault();
    const id = savePurchaseDraft({
      supplierId,
      purchaseDate,
      paymentDueDate: dueDate,
      purchaseCategory: category,
      warehouse,
      discountType: 'Fixed',
      discount,
      additionalCharges,
      items: lines.map((l) => ({
        itemName: l.itemName,
        inventoryCategory: inventoryCategoryForPurchase(category),
        orderedQty: l.orderedQty,
        ratePerUnit: l.ratePerUnit,
        unit: l.unit,
      })),
    });
    if (id) setCurrentView('purchases-all');
  };

  const submitConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const id = savePurchaseDraft({
      supplierId,
      purchaseDate,
      paymentDueDate: dueDate,
      purchaseCategory: category,
      warehouse,
      discountType: 'Fixed',
      discount,
      additionalCharges,
      documentStatus: 'Ordered',
      items: lines.map((l) => ({
        itemName: l.itemName,
        inventoryCategory: inventoryCategoryForPurchase(category),
        orderedQty: l.orderedQty,
        ratePerUnit: l.ratePerUnit,
        unit: l.unit,
      })),
    });
    if (id) {
      confirmPurchaseOrder(id);
      setCurrentView('purchases-receive');
    }
  };

  return (
    <PurchasingPageShell title="Create Purchase" subtitle="Draft purchases do not increase stock until goods receiving">
      <form className="bg-white border rounded-xl p-4 text-xs space-y-4 max-w-4xl">
        <div className="grid md:grid-cols-3 gap-3">
          <select className="border rounded-lg p-2" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="border rounded-lg p-2" value={category} onChange={(e) => setCategory(e.target.value as PurchaseCategory)}>
            <option value="NEW_RAW_MATERIAL">New Raw Material</option>
            <option value="WASTE_PLASTIC">Waste Plastic</option>
            <option value="SPARE_PARTS">Spare Parts</option>
            <option value="PACKAGING">Packaging</option>
            <option value="OTHER">Other</option>
          </select>
          <select className="border rounded-lg p-2" value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>
            {warehouses.map((w) => <option key={w.id} value={w.name}>{w.name}</option>)}
          </select>
          <input type="date" className="border rounded-lg p-2" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
          <input type="date" className="border rounded-lg p-2" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        {lines.map((line, idx) => (
          <div key={idx} className="grid md:grid-cols-4 gap-2 border p-3 rounded-lg">
            <input className="border rounded p-2 md:col-span-2" value={line.itemName} onChange={(e) => {
              const copy = [...lines]; copy[idx].itemName = e.target.value; setLines(copy);
            }} />
            <input type="number" className="border rounded p-2" value={line.orderedQty} onChange={(e) => { const copy = [...lines]; copy[idx].orderedQty = Number(e.target.value); setLines(copy); }} placeholder="Qty kg" />
            <input type="number" className="border rounded p-2" value={line.ratePerUnit} onChange={(e) => { const copy = [...lines]; copy[idx].ratePerUnit = Number(e.target.value); setLines(copy); }} placeholder="Rate PKR/kg" />
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => setLines([...lines, { itemName: 'Line item', orderedQty: 100, ratePerUnit: 100, unit: 'kg' }])}>+ Line</Button>
        <div className="grid grid-cols-2 gap-3">
          <input type="number" className="border rounded p-2" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} placeholder="Discount PKR" />
          <input type="number" className="border rounded p-2" value={additionalCharges} onChange={(e) => setAdditionalCharges(Number(e.target.value))} placeholder="Transport / charges PKR" />
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 font-semibold text-blue-900">
          Net purchase total: Rs. {totals.netTotal.toLocaleString()} (PKR)
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={submitDraft}>Save draft</Button>
          <Button variant="primary" onClick={submitConfirm}>Confirm order</Button>
        </div>
      </form>
    </PurchasingPageShell>
  );
}