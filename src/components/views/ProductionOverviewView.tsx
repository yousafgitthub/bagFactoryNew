'use client';

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ProductionBatch, ProductionSource } from '../../types/erp';
import { KPICard } from '../common/KPICard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { CreateProductionBatchModal, ProductionBatchDetailModal } from './CreateProductionBatchModal';
import { Factory, Plus, AlertCircle, Eye, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

export function ProductionOverviewView() {
  const { productionBatches, searchQuery } = useERP();

  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'NEW' | 'RECYCLED'>('ALL');
  const [productFilter, setProductFilter] = useState<'ALL' | 'ABHA' | 'Crystal'>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailBatch, setDetailBatch] = useState<ProductionBatch | null>(null);

  const filteredBatches = productionBatches.filter((b) => {
    const matchesSource = sourceFilter === 'ALL' || b.materialSource === sourceFilter;
    const matchesProduct = productFilter === 'ALL' || b.productName === productFilter;
    const matchesSearch =
      searchQuery === '' ||
      b.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.operator.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSource && matchesProduct && matchesSearch;
  });

  const totalOutputKg = productionBatches.reduce((acc, b) => acc + b.finishedGoodsOutputKg, 0);
  const recycledOutputKg = productionBatches
    .filter((b) => b.materialSource === 'RECYCLED')
    .reduce((acc, b) => acc + b.finishedGoodsOutputKg, 0);
  const newOutputKg = productionBatches
    .filter((b) => b.materialSource === 'NEW')
    .reduce((acc, b) => acc + b.finishedGoodsOutputKg, 0);

  const avgYield = Number(
    (
      productionBatches.reduce((acc, b) => acc + b.yieldPercentage, 0) /
      (productionBatches.length || 1)
    ).toFixed(1)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B] tracking-tight">Shopping Bag Production & Extrusion</h2>
          <p className="text-xs text-[#64748B]">
            Strict separation: Batches run on 100% Recycled Material OR 100% New Branded Material
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsCreateOpen(true)}
        >
          New Production Batch
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Production Output"
          value={`${totalOutputKg.toLocaleString()} kg`}
          subtitle="Finished bags manufactured"
          icon={Factory}
          highlightColor="blue"
        />
        <KPICard
          title="Recycled Source Output"
          value={`${recycledOutputKg.toLocaleString()} kg`}
          subtitle="ABHA bags manufactured"
          icon={Sparkles}
          highlightColor="green"
        />
        <KPICard
          title="New Branded Source Output"
          value={`${newOutputKg.toLocaleString()} kg`}
          subtitle="Crystal bags manufactured"
          icon={Factory}
          highlightColor="navy"
        />
        <KPICard
          title="Average Extrusion Yield"
          value={`${avgYield}%`}
          subtitle="6.3% processing loss"
          icon={CheckCircle2}
          highlightColor="green"
        />
      </div>

      {/* Strict Separation Callout */}
      <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl shadow-card flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1E293B]">Material Source Segregation Enforcement</h4>
            <p className="text-xs text-[#64748B]">
              Every production batch is assigned an immutable source class. Mixed-source extrusion is prohibited.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Filter by Source:</span>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setSourceFilter('ALL')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                sourceFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              All Batches
            </button>
            <button
              onClick={() => setSourceFilter('RECYCLED')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                sourceFilter === 'RECYCLED' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              Recycled Only
            </button>
            <button
              onClick={() => setSourceFilter('NEW')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                sourceFilter === 'NEW' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              New Branded Only
            </button>
          </div>
        </div>
      </div>

      {/* Production Batches Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1E293B]">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Batch Number</th>
                <th className="py-3 px-3">Product & Color</th>
                <th className="py-3 px-3">Material Source</th>
                <th className="py-3 px-3 text-right">Input (kg)</th>
                <th className="py-3 px-3 text-right">Output (kg)</th>
                <th className="py-3 px-3 text-right">Loss (kg)</th>
                <th className="py-3 px-3 text-right">Yield %</th>
                <th className="py-3 px-3 text-right">Total Cost (PKR)</th>
                <th className="py-3 px-3 text-right">Cost / kg</th>
                <th className="py-3 px-3">Operator</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-600">
                    {batch.batchNumber}
                    <span className="block text-[10px] text-slate-400 font-normal">{batch.productionDate}</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {batch.productName}
                    <span className="block text-[11px] text-slate-500 font-medium">Color: {batch.color}</span>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={batch.materialSource === 'RECYCLED' ? 'recycled' : 'new'}>
                      {batch.materialSource}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-800">
                    {batch.rawMaterialQtyKg} kg
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-700">
                    {batch.finishedGoodsOutputKg} kg
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-rose-600">
                    {batch.processingLossKg} kg
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    {batch.yieldPercentage}%
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-900">
                    Rs. {batch.totalCost.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-blue-700">
                    Rs. {batch.costPerKg}
                  </td>
                  <td className="py-3 px-3 text-slate-600 truncate max-w-[120px]">
                    {batch.operator}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setDetailBatch(batch)}
                      title="Inspect Cost Breakdown & Details"
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateProductionBatchModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <ProductionBatchDetailModal
        batch={detailBatch}
        isOpen={Boolean(detailBatch)}
        onClose={() => setDetailBatch(null)}
      />
    </div>
  );
}
