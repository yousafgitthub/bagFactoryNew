'use client';

import React, { useMemo, useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { SalesPageShell } from './SalesPageShell';
import { Button } from '../../common/Button';
import { computeLineTotal, getBrandFromProductName } from '../../../sales/salesUtils';
import type { SalesInvoiceItem } from '../../../types/erp';
import { Plus, Trash2 } from 'lucide-react';

export function SalesCreateInvoiceView() {
  const { customers, inventory, warehouses, salesSettings, saveSalesInvoiceDraft, confirmSalesInvoice } = useERP();
  const finishedGoods = useMemo(() => inventory.filter((i) => i.category === 'FINISHED_GOODS'), [inventory]);
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + salesSettings.defaultPaymentTermsDays * 86400000).toISOString().split('T')[0]
  );
  const [warehouse, setWarehouse] = useState('Finished Goods Hall D');
  const [discountType, setDiscountType] = useState<'Fixed' | 'Percent'>('Fixed');
  const [discountValue, setDiscountValue] = useState(0);
  const [amountReceived, setAmountReceived] = useState(0);
  const [items, setItems] = useState<SalesInvoiceItem[]>(() => {
    const fg = finishedGoods[0];
    if (!fg) return [];
    return [
      {
        id: 'line-1',
        inventoryItemId: fg.id,
        productName: fg.name,
        brand: getBrandFromProductName(fg.name),
        color: fg.color || 'White',
        qtyKg: 50,
        ratePerKg: 400,
        totalAmount: 20000,
        batchNumber: fg.batchNumber,
      },
    ];
  });

  const pickProduct = (index: number, invId: string) => {
    const fg = finishedGoods.find((i) => i.id === invId);
    if (!fg) return;
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      inventoryItemId: fg.id,
      productName: fg.name,
      brand: getBrandFromProductName(fg.name),
      color: fg.color || 'White',
      batchNumber: fg.batchNumber,
      totalAmount: computeLineTotal(updated[index].qtyKg, updated[index].ratePerKg),
    };
    setItems(updated);
  };

  const subtotal = items.reduce((a, i) => a + i.totalAmount, 0);

  const submit = (asDraft: boolean) => {
    const id = saveSalesInvoiceDraft({
      customerId,
      saleDate,
      dueDate,
      items,
      discountType,
      discountValue,
      amountReceived,
      dispatchWarehouse: warehouse,
    });
    if (id && !asDraft) confirmSalesInvoice(id);
  };

  return (
    <SalesPageShell
      title="Create Sales Invoice"
      subtitle="Finished goods only (ABHA / Crystal). Stock deducts once on confirm — not on draft."
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => submit(true)}>
            Save draft
          </Button>
          <Button variant="primary" size="sm" onClick={() => submit(false)}>
            Confirm & dispatch
          </Button>
        </>
      }
    >
      <div className="grid lg:grid-cols-3 gap-4 text-xs">
        <div className="lg:col-span-2 space-y-3 bg-white border rounded-xl p-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              Customer
              <select className="w-full mt-1 border rounded-lg p-2" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              Dispatch warehouse
              <select className="w-full mt-1 border rounded-lg p-2" value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.name}>
                    {w.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              Invoice date
              <input type="date" className="w-full mt-1 border rounded-lg p-2" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} />
            </label>
            <label className="block">
              Due date
              <input type="date" className="w-full mt-1 border rounded-lg p-2" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </label>
          </div>
          {items.map((line, idx) => {
            const fg = finishedGoods.find((f) => f.id === line.inventoryItemId);
            return (
              <div key={line.id} className="border border-slate-200 rounded-lg p-3 grid sm:grid-cols-6 gap-2 items-end">
                <label className="sm:col-span-2 block">
                  Product (FG)
                  <select className="w-full mt-1 border rounded p-2" value={line.inventoryItemId} onChange={(e) => pickProduct(idx, e.target.value)}>
                    {finishedGoods.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.availableKg} kg)
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  Qty (kg)
                  <input
                    type="number"
                    className="w-full mt-1 border rounded p-2"
                    value={line.qtyKg}
                    onChange={(e) => {
                      const qtyKg = Number(e.target.value);
                      const updated = [...items];
                      updated[idx] = { ...line, qtyKg, totalAmount: computeLineTotal(qtyKg, line.ratePerKg) };
                      setItems(updated);
                    }}
                  />
                </label>
                <label className="block">
                  Rate/kg
                  <input
                    type="number"
                    className="w-full mt-1 border rounded p-2"
                    value={line.ratePerKg}
                    onChange={(e) => {
                      const ratePerKg = Number(e.target.value);
                      const updated = [...items];
                      updated[idx] = { ...line, ratePerKg, totalAmount: computeLineTotal(line.qtyKg, ratePerKg) };
                      setItems(updated);
                    }}
                  />
                </label>
                <p className="text-[#64748B]">
                  Avail: <strong>{fg?.availableKg ?? 0} kg</strong>
                  <br />
                  Line: Rs. {line.totalAmount.toLocaleString()}
                </p>
                <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-rose-500 p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() =>
              setItems([
                ...items,
                {
                  id: 'line-' + Date.now(),
                  inventoryItemId: finishedGoods[0]?.id,
                  productName: finishedGoods[0]?.name || '',
                  brand: getBrandFromProductName(finishedGoods[0]?.name || ''),
                  color: finishedGoods[0]?.color || 'White',
                  qtyKg: 25,
                  ratePerKg: 400,
                  totalAmount: 10000,
                  batchNumber: finishedGoods[0]?.batchNumber,
                },
              ])
            }
          >
            Add line
          </Button>
        </div>
        <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2 h-fit">
          <p className="text-sm font-semibold">Live preview</p>
          <p>Subtotal: Rs. {subtotal.toLocaleString()}</p>
          <label className="block">
            Discount type
            <select className="w-full mt-1 text-slate-900 rounded p-1" value={discountType} onChange={(e) => setDiscountType(e.target.value as 'Fixed' | 'Percent')}>
              <option value="Fixed">Fixed PKR</option>
              <option value="Percent">Percent</option>
            </select>
          </label>
          <input type="number" className="w-full text-slate-900 rounded p-2" value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value))} />
          <label className="block">
            Received now
            <input type="number" className="w-full mt-1 text-slate-900 rounded p-2" value={amountReceived} onChange={(e) => setAmountReceived(Number(e.target.value))} />
          </label>
          <p className="text-[10px] text-slate-400">Tax: {salesSettings.taxEnabled ? `${salesSettings.taxRatePct}%` : 'Disabled'}</p>
        </div>
      </div>
    </SalesPageShell>
  );
}