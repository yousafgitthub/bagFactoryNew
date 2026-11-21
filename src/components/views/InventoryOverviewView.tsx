'use client';

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { InventoryCategory, InventoryItem, StockStatus } from '../../types/erp';
import { KPICard } from '../common/KPICard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { InventoryDetailModal } from './InventoryDetailModal';
import { AddStockModal } from './AddStockModal';
import { StockTransferModal, StockAdjustModal } from './StockTransferModal';
import {
  Boxes,
  Plus,
  ArrowRightLeft,
  Filter,
  Search,
  AlertTriangle,
  History,
  Layers,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

export function InventoryOverviewView() {
  const { inventory, searchQuery, setSearchQuery, warehouses, setCurrentView } = useERP();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals state
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<InventoryItem | null>(null);
  const [transferItem, setTransferItem] = useState<InventoryItem | null>(null);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);

  // Filter items
  const filteredItems = inventory.filter((item) => {
    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesWarehouse =
      selectedWarehouse === 'ALL' || item.warehouse === selectedWarehouse;
    const matchesStatus =
      selectedStatus === 'ALL' || item.status === selectedStatus;
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesWarehouse && matchesStatus && matchesSearch;
  });

  // Category counts and totals
  const totalStockKg = inventory.reduce((acc, i) => acc + i.availableKg, 0);
  const totalStockValuation = inventory.reduce((acc, i) => acc + i.totalValue, 0);
  const lowStockCount = inventory.filter(
    (i) => i.status === 'Low Stock' || i.status === 'Critical'
  ).length;

  const categoryPills = [
    { id: 'ALL', label: 'All Inventory' },
    { id: 'NEW_BRANDED', label: '1. New Branded Polymer' },
    { id: 'WASTE_PLASTIC', label: '2. Waste Plastic Scrap' },
    { id: 'RECYCLED_RAW', label: '3. Recycled Raw Material' },
    { id: 'FINISHED_GOODS', label: '4. Finished Bags (ABHA / Crystal)' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B] tracking-tight">Factory Inventory Management</h2>
          <p className="text-xs text-[#64748B]">
            Strict separation maintained between raw polymer, waste plastic, recycled raw material, and finished bags
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setCurrentView('inv-receive')}
          >
            Receive Stock
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Stock on Hand"
          value={`${totalStockKg.toLocaleString()} kg`}
          subtitle="Physical weight in plant"
          icon={Boxes}
          highlightColor="blue"
        />
        <KPICard
          title="Total Inventory Valuation"
          value={`Rs. ${totalStockValuation.toLocaleString()}`}
          subtitle="Weighted cost in PKR"
          icon={Layers}
          highlightColor="green"
        />
        <KPICard
          title="Distinct Stock Batches"
          value={inventory.length}
          subtitle="Tracked lots & silos"
          icon={SlidersHorizontal}
          highlightColor="navy"
        />
        <KPICard
          title="Reorder Alerts"
          value={lowStockCount}
          subtitle="Below safety threshold"
          icon={AlertTriangle}
          highlightColor={lowStockCount > 0 ? 'amber' : 'green'}
        />
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-card space-y-4">
        {/* Category Pill Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categoryPills.map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedCategory(pill.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === pill.id
                  ? 'bg-[#142238] text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Second Row: Warehouse, Status & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Warehouse select */}
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium"
            >
              <option value="ALL">All Warehouses & Silos</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.name}>
                  {w.name}
                </option>
              ))}
            </select>

            {/* Status select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium"
            >
              <option value="ALL">All Stock Statuses</option>
              <option value="Healthy">Healthy</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="w-full sm:w-64 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search item, batch, supplier..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1E293B]">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Material / Product</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Warehouse</th>
                <th className="py-3 px-3 text-right">Available (kg)</th>
                <th className="py-3 px-3 text-right">Unit Cost (PKR)</th>
                <th className="py-3 px-3 text-right">Stock Value (PKR)</th>
                <th className="py-3 px-3">Supplier / Batch</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{item.name}</span>
                        {item.color && (
                          <span className="text-[11px] text-slate-500">Color: {item.color}</span>
                        )}
                        {item.grade && (
                          <span className="text-[10px] text-slate-400">{item.grade}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          item.category === 'NEW_BRANDED'
                            ? 'new'
                            : item.category === 'RECYCLED_RAW'
                            ? 'recycled'
                            : item.category === 'WASTE_PLASTIC'
                            ? 'warning'
                            : 'primary'
                        }
                      >
                        {item.category.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{item.warehouse}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 text-sm">
                      {item.availableKg.toLocaleString()} kg
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700">
                      Rs. {item.unitCost.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-blue-600">
                      Rs. {item.totalValue.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{item.batchNumber}</span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
                          {item.supplier || 'Internal Output'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge
                        variant={
                          item.status === 'Healthy'
                            ? 'success'
                            : item.status === 'Low Stock'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDetailItem(item)}
                          title="View Details & Ledger"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setTransferItem(item)}
                          title="Transfer Warehouse"
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No inventory records match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredItems.length} of {inventory.length} inventory items</span>
          <span>Primary unit: Kilograms (kg) • Currency: PKR (Rs.)</span>
        </div>
      </div>

      {/* Modals */}
      <AddStockModal isOpen={isAddStockOpen} onClose={() => setIsAddStockOpen(false)} />
      <InventoryDetailModal
        item={detailItem}
        isOpen={Boolean(detailItem)}
        onClose={() => setDetailItem(null)}
        onOpenAdjust={(item) => setAdjustItem(item)}
        onOpenTransfer={(item) => setTransferItem(item)}
      />
      <StockTransferModal
        item={transferItem}
        isOpen={Boolean(transferItem)}
        onClose={() => setTransferItem(null)}
      />
      <StockAdjustModal
        item={adjustItem}
        isOpen={Boolean(adjustItem)}
        onClose={() => setAdjustItem(null)}
      />
    </div>
  );
}
