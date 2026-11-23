'use client';

import React, { useMemo, useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { KPICard } from '../../common/KPICard';
import { Button } from '../../common/Button';
import { RecyclingPageShell } from './RecyclingPageShell';
import { RecyclingStatusBadge } from './RecyclingStatusBadge';
import { CreateRecyclingBatchModal } from '../CreateRecyclingBatchModal';
import { aggregateRecyclingKpis, completedBatchesOnly, getTotalOutputKg } from '../../../recycling/recyclingUtils';
import { Recycle, Plus, TrendingUp, DollarSign, Layers } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const PIE_COLORS = ['#7c3aed', '#059669', '#2563eb', '#d97706', '#db2777'];

export function RecyclingOverviewView() {
  const { recyclingBatches, recyclingOutputTypes, setCurrentView, setSelectedEntityId, searchQuery } = useERP();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const completed = useMemo(() => completedBatchesOnly(recyclingBatches), [recyclingBatches]);
  const kpis = useMemo(() => aggregateRecyclingKpis(recyclingBatches), [recyclingBatches]);

  const monthlyActivity = useMemo(() => {
    const map: Record<string, { month: string; input: number; output: number; loss: number }> = {};
    completed.forEach((b) => {
      const month = b.processingDate.slice(0, 7);
      if (!map[month]) map[month] = { month, input: 0, output: 0, loss: 0 };
      map[month].input += b.inputWasteQtyKg;
      map[month].output += getTotalOutputKg(b);
      map[month].loss += b.processingLossKg;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [completed]);

  const yieldTrend = useMemo(
    () =>
      [...completed]
        .sort((a, b) => a.processingDate.localeCompare(b.processingDate))
        .slice(-8)
        .map((b) => ({ batch: b.batchNumber.split('-').pop(), yield: b.yieldPercentage })),
    [completed]
  );

  const costBreakdown = useMemo(() => {
    const sums = { waste: 0, labor: 0, electricity: 0, machine: 0, other: 0 };
    completed.forEach((b) => {
      sums.waste += b.inputWasteQtyKg * b.wasteCostPerKg;
      sums.labor += b.laborCost;
      sums.electricity += b.electricityCost;
      sums.machine += b.machineCost;
      sums.other += b.transportCost + b.maintenanceCost + b.otherCosts;
    });
    return [
      { name: 'Waste material', value: sums.waste },
      { name: 'Labor', value: sums.labor },
      { name: 'Electricity', value: sums.electricity },
      { name: 'Machine', value: sums.machine },
      { name: 'Other', value: sums.other },
    ];
  }, [completed]);

  const outputDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    completed.forEach((b) => {
      b.outputs.forEach((o) => {
        map[o.materialName] = (map[o.materialName] || 0) + o.outputQtyKg;
      });
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [completed]);

  const recent = recyclingBatches
    .filter(
      (b) =>
        searchQuery === '' ||
        b.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.wasteInputName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 8);

  return (
    <RecyclingPageShell
      title="Recycling Overview"
      subtitle="Waste plastic intake, processing yield, cost, and output distribution from live batch records."
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => setCurrentView('recycling-batches')}>
            View All Batches
          </Button>
          <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsCreateOpen(true)}>
            Create Recycling Batch
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard title="Total Batches" value={String(kpis.totalBatches)} subtitle="All lifecycle statuses" icon={Layers} highlightColor="blue" />
        <KPICard title="Waste Input" value={`${kpis.totalWasteInput.toLocaleString()} kg`} subtitle={`Loss ${kpis.totalLoss.toLocaleString()} kg`} icon={Recycle} highlightColor="amber" />
        <KPICard title="Recycled Output" value={`${kpis.totalOutput.toLocaleString()} kg`} subtitle={`Avg yield ${kpis.avgYield}%`} icon={TrendingUp} highlightColor="green" />
        <KPICard title="Total Recycling Cost" value={`Rs. ${kpis.totalCost.toLocaleString()}`} subtitle={`Rs. ${kpis.avgCostPerKg}/kg avg`} icon={DollarSign} highlightColor="green" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Monthly Recycling Activity">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="input" fill="#d97706" name="Waste in" />
              <Bar dataKey="output" fill="#059669" name="Recycled out" />
              <Bar dataKey="loss" fill="#e11d48" name="Loss" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Recycling Yield Trend">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={yieldTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="batch" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="yield" stroke="#7c3aed" strokeWidth={2} name="Yield %" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Recycling Cost Analysis">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={costBreakdown} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={75} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" name="PKR" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Output Material Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={outputDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>
                {outputDistribution.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <span className="text-xs text-slate-500">{recyclingOutputTypes.filter((t) => t.active).length} active output material types configured</span>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-card">
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800">Recent Recycling Batches</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentView('recycling-reports')}>
              Reports
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentView('inv-recycled')}>
              Recycled Inventory
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Batch</th>
                <th className="px-3">Input</th>
                <th className="px-3 text-right">Out kg</th>
                <th className="px-3 text-right">Yield</th>
                <th className="px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-slate-50 cursor-pointer"
                  onClick={() => {
                    setSelectedEntityId(b.id);
                    setCurrentView('recycling-batch-detail');
                  }}
                >
                  <td className="py-2.5 px-4 font-semibold text-purple-700">{b.batchNumber}</td>
                  <td className="px-3">{b.wasteInputName}</td>
                  <td className="px-3 text-right">{getTotalOutputKg(b)}</td>
                  <td className="px-3 text-right">{b.yieldPercentage}%</td>
                  <td className="px-3">
                    <RecyclingStatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateRecyclingBatchModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </RecyclingPageShell>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-card">
      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">{title}</h4>
      {children}
    </div>
  );
}