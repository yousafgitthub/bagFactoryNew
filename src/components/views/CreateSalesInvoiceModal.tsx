'use client';

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useERP } from '../../context/ERPContext';
import { Plus, Trash2, Printer, CheckCircle2, Building2, Download } from 'lucide-react';
import { SalesInvoice } from '../../types/erp';
import { Badge } from '../common/Badge';
import { generateInvoicePDF } from '../../utils/exportUtils';

interface CreateSalesInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateSalesInvoiceModal({ isOpen, onClose }: CreateSalesInvoiceModalProps) {
  const { customers, inventory, createSalesInvoice } = useERP();

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Math.floor(1050 + Math.random() * 900)}`);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');

  // Finished Goods available for sale
  const finishedGoods = inventory.filter((i) => i.category === 'FINISHED_GOODS' && i.availableKg > 0);

  // Line Items (sold by kg!)
  const [items, setItems] = useState([
    {
      id: 'item-1',
      productName: 'ABHA White Shopping Bags (Standard)',
      color: 'White',
      qtyKg: 100,
      ratePerKg: 400,
      totalAmount: 40000,
    },
  ]);

  const [discount, setDiscount] = useState<number>(0);
  const [amountReceived, setAmountReceived] = useState<number>(15000);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Cheque'>('Bank Transfer');

  const selectedCustomer = customers.find((c) => c.id === customerId) || customers[0];

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };
    if (field === 'qtyKg' || field === 'ratePerKg') {
      item.totalAmount = item.qtyKg * item.ratePerKg;
    }
    updated[index] = item;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: 'item-' + Date.now(),
        productName: finishedGoods[0]?.name || 'Crystal White Bags',
        color: 'White',
        qtyKg: 50,
        ratePerKg: 580,
        totalAmount: 50 * 580,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((acc, i) => acc + i.totalAmount, 0);
  const grandTotal = Math.max(0, subtotal - discount);
  const remainingBalance = Math.max(0, grandTotal - amountReceived);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    createSalesInvoice({
      invoiceNumber,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      saleDate,
      dueDate,
      items,
      subtotal,
      discount,
      grandTotal,
      amountReceived,
      paymentMethod,
      notes: notes || `Shopping bags delivery via transport`,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Sales Commercial Invoice"
      subtitle="Billed primarily in kilograms (kg) • Automatically updates Customer Khata"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Customer & Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="block font-medium text-slate-700 mb-1">Customer *</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-bold"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.city})
                </option>
              ))}
            </select>
            {selectedCustomer && (
              <span className="text-[10px] text-slate-500 mt-1 block">
                Current Khata Balance:{' '}
                <span className="font-bold text-rose-600">
                  Rs. {selectedCustomer.currentBalance.toLocaleString()}
                </span>
              </span>
            )}
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Invoice Number *</label>
            <input
              type="text"
              required
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Sale Date *</label>
            <input
              type="date"
              required
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-800">
              Product Line Items (Sold in Kilograms)
            </label>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> + Add Product Line
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                <tr>
                  <th className="py-2 px-3">Product Name</th>
                  <th className="py-2 px-2">Color</th>
                  <th className="py-2 px-2 text-right">Quantity (kg)</th>
                  <th className="py-2 px-2 text-right">Rate / kg (PKR)</th>
                  <th className="py-2 px-3 text-right">Amount (PKR)</th>
                  <th className="py-2 px-2 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => (
                  <tr key={item.id} className="bg-white">
                    <td className="py-2 px-3">
                      <select
                        value={item.productName}
                        onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                        className="w-full p-1 border border-slate-200 rounded text-xs font-semibold"
                      >
                        {finishedGoods.map((fg) => (
                          <option key={fg.id} value={fg.name}>
                            {fg.name} ({fg.availableKg} kg in stock)
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.color}
                        onChange={(e) => handleItemChange(index, 'color', e.target.value)}
                        className="w-20 p-1 border border-slate-200 rounded text-xs"
                      />
                    </td>
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        min="1"
                        value={item.qtyKg}
                        onChange={(e) => handleItemChange(index, 'qtyKg', Number(e.target.value))}
                        className="w-20 p-1 border border-slate-200 rounded text-right font-bold text-xs"
                      />
                    </td>
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        min="1"
                        value={item.ratePerKg}
                        onChange={(e) => handleItemChange(index, 'ratePerKg', Number(e.target.value))}
                        className="w-20 p-1 border border-slate-200 rounded text-right font-semibold text-xs"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-blue-600">
                      Rs. {item.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Totals & Payment Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Payment received now */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="font-bold text-slate-800">Payment Collection</h4>
            <div>
              <label className="block text-slate-600 text-[11px] mb-1">
                Amount Received Right Now (PKR)
              </label>
              <input
                type="number"
                min="0"
                max={grandTotal}
                value={amountReceived}
                onChange={(e) => setAmountReceived(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-600 text-[11px] mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900"
              >
                <option value="Cash">Cash (Factory Cash Safe)</option>
                <option value="Bank Transfer">Bank Transfer (Meezan / HBL)</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 text-[11px] mb-1">Due Date for Balance</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-1.5 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          {/* Totals Summary */}
          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-semibold text-slate-900">Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Discount (PKR):</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-24 p-1 border border-slate-300 rounded text-right text-xs"
                />
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-blue-200 pt-1.5 text-blue-950">
                <span>Grand Total:</span>
                <span className="text-blue-700">Rs. {grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs pt-1">
                <span className="text-slate-600">Amount Received:</span>
                <span className="font-bold text-emerald-700">Rs. {amountReceived.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-blue-200 flex justify-between items-center">
              <span className="font-bold text-slate-800">Added to Customer Khata:</span>
              <span className="text-sm font-bold text-rose-600">
                Rs. {remainingBalance.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Confirm & Issue Invoice
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface InvoiceDetailModalProps {
  invoice: SalesInvoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceDetailModal({ invoice, isOpen, onClose }: InvoiceDetailModalProps) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Commercial Invoice: ${invoice.invoiceNumber}`}
      subtitle="Official sales invoice & delivery challan"
      maxWidth="2xl"
    >
      <div className="space-y-6 text-xs text-slate-800 printable-area">
        {/* Printable Header */}
        <div className="flex items-start justify-between border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[#142238] text-white flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">BagFactory ERP</h3>
                <p className="text-[10px] text-slate-500">Shopping Bag Manufacturing Plant Ltd.</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Plot 48, Industrial Area, Karachi / Gujranwala • Tel: +92 21 35009182
            </p>
            <p className="text-[11px] text-slate-500">NTN: 8192049-2 • Sales Tax # 17-00-8192-001</p>
          </div>

          <div className="text-right">
            <span className="text-lg font-black text-blue-600 tracking-tight block">COMMERCIAL INVOICE</span>
            <span className="font-bold text-slate-900 text-sm">{invoice.invoiceNumber}</span>
            <p className="text-[11px] text-slate-500 mt-1">Date: {invoice.saleDate}</p>
            <p className="text-[11px] text-slate-500">Due Date: {invoice.dueDate}</p>
            <div className="mt-2">
              <Badge variant={invoice.paymentStatus === 'Paid' ? 'success' : invoice.paymentStatus === 'Partial' ? 'warning' : 'danger'}>
                {invoice.paymentStatus}
              </Badge>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Billed To (Customer)</span>
          <p className="text-sm font-bold text-slate-900">{invoice.customerName}</p>
          <p className="text-[11px] text-slate-600 mt-0.5">Commercial Delivery Address: Karachi / Regional Store</p>
        </div>

        {/* Line Items */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b">
              <tr>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3">Color</th>
                <th className="py-2.5 px-3 text-right">Quantity (kg)</th>
                <th className="py-2.5 px-3 text-right">Rate / kg (PKR)</th>
                <th className="py-2.5 px-3 text-right">Total (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{item.productName}</td>
                  <td className="py-2.5 px-3 text-slate-600">{item.color}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">{item.qtyKg} kg</td>
                  <td className="py-2.5 px-3 text-right text-slate-700">Rs. {item.ratePerKg}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    Rs. {item.totalAmount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Breakdown */}
        <div className="flex justify-end">
          <div className="w-72 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal:</span>
              <span className="font-semibold text-slate-800">Rs. {invoice.subtotal.toLocaleString()}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Discount:</span>
                <span>- Rs. {invoice.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm border-t pt-1 text-slate-900">
              <span>Grand Total:</span>
              <span>Rs. {invoice.grandTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold pt-1">
              <span>Paid / Received:</span>
              <span>Rs. {invoice.amountReceived.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-rose-600 font-bold border-t pt-1">
              <span>Remaining Balance:</span>
              <span>Rs. {invoice.remainingBalance.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer Signatures */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-slate-500">
          <div>
            <div className="border-b border-dashed border-slate-400 h-8 mb-1" />
            <span className="text-[11px]">Factory Dispatch Officer</span>
          </div>
          <div>
            <div className="border-b border-dashed border-slate-400 h-8 mb-1" />
            <span className="text-[11px]">Customer Receiver Stamp & Signature</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-end gap-2 pt-4 border-t print:hidden">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4 text-blue-600" />}
            onClick={() => generateInvoicePDF(invoice)}
          >
            Download PDF
          </Button>
          <Button variant="primary" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Print Invoice
          </Button>
        </div>
      </div>
    </Modal>
  );
}
