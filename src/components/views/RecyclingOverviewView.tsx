'use client';

import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { KPICard } from '../common/KPICard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { CreateRecyclingBatchModal } from './CreateRecyclingBatchModal';
import { Recycle, Plus, CheckCircle2, ArrowRight, Sparkles, Sliders } from 'lucide-react';

export function RecyclingOverviewView() {
  const { recyclingBatches, recyclingOutputTypes, searchQuery } = useERP();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const totalInputWasteKg = recyclingBatches.reduce((acc, b) => acc + b.inputWasteQtyKg, 0);
  const totalOutputKg = recyclingBatches.reduce((acc, b) => acc + b.outputQtyKg, 0);
  const avgYield = Number(
    (
      recyclingBatches.reduce((acc, b) => acc + b.yieldPercentage, 0) /
      (recyclingBatches.length || 1)
    ).toFixed(1)
  );
  const avgCostPerKg = Number(
    (
      recyclingBatches.reduce((acc, b) => acc + b.costPerKg, 0) /
      (recyclingBatches.length || 1)
    ).toFixed(2)
  );

  const filteredBatches = recyclingBatches.filter((b) => {
    return (
      searchQuery === '' ||
      b.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.wasteInputName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.outputMaterialType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.operator.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B] tracking-tight">Recycling Operations & Processing</h2>
          <p className="text-xs text-[#64748B]">
            Convert externally purchased waste plastic into configurable recycled raw materials
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsCreateOpen(true)}
        >
          New Recycling Batch
        </Button>
      </div>

      {/* Process Workflow Banner */}
      <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl shadow-card">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Manufacturing Material Workflow
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Stage 1</span>
            <p className="text-xs font-bold text-slate-800 mt-0.5">External Suppliers</p>
            <p className="text-[11px] text-slate-500 mt-1">Purchased scrap film & rigid plastic</p>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <span className="text-[10px] font-bold text-amber-600 uppercase">Stage 2</span>
            <p className="text-xs font-bold text-amber-900 mt-0.5">Waste Plastic Inventory</p>
            <p className="text-[11px] text-amber-700 mt-1">Stored separately in Scrap Yard B</p>
          </div>

          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <span className="text-[10px] font-bold text-purple-600 uppercase">Stage 3</span>
            <p className="text-xs font-bold text-purple-900 mt-0.5">Internal Recycling Mill</p>
            <p className="text-[11px] text-purple-700 mt-1">Washing, densifying, & re-extrusion</p>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <span className="text-[10px] font-bold text-emerald-600 uppercase">Stage 4</span>
            <p className="text-xs font-bold text-emerald-900 mt-0.5">Recycled Raw Material</p>
            <p className="text-[11px] text-emerald-700 mt-1">Configurable output types & pellets</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Waste Consumed"
          value={`${totalInputWasteKg.toLocaleString()} kg`}
          subtitle="Processed through recycling lines"
          icon={Recycle}
          highlightColor="amber"
        />
        <KPICard
          title="Recycled Output Produced"
          value={`${totalOutputKg.toLocaleString()} kg`}
          subtitle="Ready for bag manufacturing"
          icon={Sparkles}
          highlightColor="green"
        />
        <KPICard
          title="Average Yield Efficiency"
          value={`${avgYield}%`}
          subtitle="Approx. 8.6% washing & melt loss"
          icon={CheckCircle2}
          highlightColor="green"
        />
        <KPICard
          title="Average Cost / kg"
          value={`Rs. ${avgCostPerKg}`}
          subtitle="Waste cost + processing overheads"
          icon={Sliders}
          highlightColor="blue"
        />
      </div>

      {/* Configured Output Material Types Master Summary */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="text-sm font-bold text-[#1E293B]">Active Configured Output Material Types</h4>
            <p className="text-xs text-[#64748B]">
              The factory is not locked to granules; custom material outputs can be produced anytime
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
            {recyclingOutputTypes.length} Configured Types
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {recyclingOutputTypes.map((type) => (
            <div
              key={type.id}
              className="px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50/60 text-xs flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              <span className="font-bold text-purple-900">{type.name}</span>
              <span className="text-[10px] text-purple-600 bg-purple-100 px-1 rounded">{type.code}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1E293B]">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Batch Number</th>
                <th className="py-3 px-3">Input Waste Material</th>
                <th className="py-3 px-3 text-right">Input (kg)</th>
                <th className="py-3 px-3">Configurable Output Type</th>
                <th className="py-3 px-3 text-right">Output (kg)</th>
                <th className="py-3 px-3 text-right">Loss (kg)</th>
                <th className="py-3 px-3 text-right">Yield %</th>
                <th className="py-3 px-3 text-right">Processing Cost</th>
                <th className="py-3 px-3 text-right">Output Cost / kg</th>
                <th className="py-3 px-3">Supervisor</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBatches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-purple-700">
                    {b.batchNumber}
                    <span className="block text-[10px] text-slate-400 font-normal">{b.processingDate}</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{b.wasteInputName}</td>
                  <td className="py-3 px-3 text-right font-medium text-slate-700">{b.inputWasteQtyKg} kg</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {b.outputMaterialType}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-700">{b.outputQtyKg} kg</td>
                  <td className="py-3 px-3 text-right font-medium text-rose-600">{b.processingLossKg} kg</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">{b.yieldPercentage}%</td>
                  <td className="py-3 px-3 text-right font-medium text-slate-900">
                    Rs. {b.totalProcessingCost.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-purple-700 text-sm">
                    Rs. {b.costPerKg}
                  </td>
                  <td className="py-3 px-3 text-slate-600 truncate max-w-[120px]">{b.operator}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="success">{b.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateRecyclingBatchModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
