'use client';

import React, { useMemo, useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { KPICard } from '../../common/KPICard';
import { Button } from '../../common/Button';
import { ProductionPageShell } from './ProductionPageShell';
import { ProductionStatusBadge } from './ProductionStatusBadge';
import { aggregateProductionKpis, completedProductionBatches, getBatchBrand } from '../../../production/productionUtils';
import { Factory, Plus, TrendingUp, DollarSign, Layers, BarChart3 } from 'lucide-react';
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

const PIE_COLORS = ['#2563eb', '#059669', '#7c3aed', '#d97706'];

export function ProductionOverviewView() {
  const { productionBatches, setCurrentView, setSelectedEntityId, searchQuery } = useERP();
  const completed = useMemo(() => completedProductionBatches(productionBatches), [productionBatches]);
  const kpis = useMemo(() => aggregateProductionKpis(productionBatches), [productionBatches]);

  const monthlyTrend = useMemo(() => {
    const map: Record<string, { month: string; output: number }> = {};
    completed.forEach((b) => {
      const month = b.productionDate.slice(0, 7);
      if (!map[month]) map[month] = { month, output: 0 };
      map[month].output += b.finishedGoodsOutputKg;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [completed]);

  const sourceConsumption = useMemo(() => {
    let n = 0,
      r = 0;
    completed.forEach((b) => {
      if (b.materialSource === 'NEW') n += b.rawMaterialQtyKg;
      else r += b.rawMaterialQtyKg;
    });
    return [
      { name: 'New Raw', value: n },
      { name: 'Recycled', value: r },
    ];
  }, [completed]);

  const brandData = useMemo(() => {
    const map: Record<string, number> = {};
    completed.forEach((b) => {
      const brand = getBatchBrand(b);
      map[brand] = (map[brand] || 0) + b.finishedGoodsOutputKg;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [completed]);

  const colorData = useMemo(() => {
    const map: Record<string, number> = {};
    completed.forEach((b) => {
      map[b.color] = (map[b.color] || 0) + b.finishedGoodsOutputKg;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [completed]);

  const yieldTrend = useMemo(
    () =>
      [...completed]
        .sort((a, b) => a.productionDate.localeCompare(b.productionDate))
        .slice(-10)
        .map((b) => ({ batch: b.batchNumber.split('-').pop(), yield: b.yieldPercentage })),
    [completed]
  );

  const costBreakdown = useMemo(() => {
    const sums = { raw: 0, labor: 0, electricity: 0, machine: 0, other: 0 };
    completed.forEach((b) => {
      sums.raw += b.rawMaterialQtyKg * b.rawMaterialCostPerKg;
      sums.labor += b.laborCost;
      sums.electricity += b.electricityCost;
      sums.machine += b.machineCost;
      sums.other +=
        b.maintenanceCost + b.packagingCost + b.transportCost + b.otherCosts;
    });
    return [
      { name: 'Raw material', value: sums.raw },
      { name: 'Labor', value: sums.labor },
      { name: 'Electricity', value: sums.electricity },
      { name: 'Machine', value: sums.machine },
      { name: 'Other', value: sums.other },
    ];
  }, [completed]);

  const recent = productionBatches
    .filter(
      (b) =>
        searchQuery === '' ||
        b.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getBatchBrand(b).toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 8);

  return (
    <ProductionPageShell
      title="Production Overview"
      subtitle="Shopping bag manufacturing — strict NEW vs RECYCLED source separation per batch."
      actions={
        <>
          <Button size="sm" variant="outline" onClick={() => setCurrentView('production-reports')}>
            Reports
          </Button>
          <Button size="sm" variant="primary" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setCurrentView('production-create')}>
            Create Batch
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Batches" value={String(kpis.totalBatches)} subtitle={`${kpis.completedCount} completed`} icon={Factory} highlightColor="blue" />
        <KPICard title="Today's Output" value={`${kpis.todayKg.toLocaleString()} kg`} subtitle="Finished goods" icon={Layers} highlightColor="green" />
        <KPICard title="Monthly Output" value={`${kpis.monthKg.toLocaleString()} kg`} subtitle="Current month" icon={TrendingUp} highlightColor="navy" />
        <KPICard title="Avg Yield" value={`${kpis.avgYield}%`} subtitle={`${kpis.lossKg.toLocaleString()} kg total loss`} icon={BarChart3} highlightColor="green" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Raw Consumed" value={`${kpis.consumedKg.toLocaleString()} kg`} subtitle="All completed runs" icon={Layers} highlightColor="navy" />
        <KPICard title="Finished Produced" value={`${kpis.finishedKg.toLocaleString()} kg`} subtitle="Saleable output" icon={Factory} highlightColor="blue" />
        <KPICard title="Production Cost" value={`Rs. ${kpis.totalCost.toLocaleString()}`} subtitle="Completed batches" icon={DollarSign} highlightColor="green" />
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
          <strong>Source rule:</strong> Each batch uses only New Raw Material <em>or</em> Recycled Raw Material — never both.
        </div>
      </div>

      <details className="rounded-xl border border-[#E2E8F0] bg-white">
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-[#1E293B]">
          Charts
        </summary>
        <div className="grid lg:grid-cols-2 gap-4 p-4 pt-0">
        <ChartCard title="Monthly production trend (kg)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="output" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Raw material consumption by source">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={sourceConsumption} dataKey="value" nameKey="name" outerRadius={80} label>
                {sourceConsumption.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Production by brand">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={brandData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Production by color">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={colorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Yield trend %">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={yieldTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="batch" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="yield" stroke="#059669" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Cost analysis (PKR)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={costBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        </div>
      </details>

      <Section title="Recent production activity">
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-[#F1F5F9] text-[#64748B]">
              <tr>
                {['Batch', 'Product', 'Source', 'In kg', 'Out kg', 'Date', 'Status'].map((h) => (
                  <th key={h} className="text-left px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((b) => (
                <tr
                  key={b.id}
                  className="border-t hover:bg-[#F8FAFC] cursor-pointer"
                  onClick={() => {
                    setSelectedEntityId(b.id);
                    setCurrentView('production-batch-detail');
                  }}
                >
                  <td className="px-4 py-3 font-medium">{b.batchNumber}</td>
                  <td className="px-4 py-3">
                    {getBatchBrand(b)} {b.color}
                  </td>
                  <td className="px-4 py-3">{b.materialSource === 'NEW' ? 'New Raw' : 'Recycled'}</td>
                  <td className="px-4 py-3">{b.rawMaterialQtyKg}</td>
                  <td className="px-4 py-3">{b.finishedGoodsOutputKg}</td>
                  <td className="px-4 py-3">{b.productionDate}</td>
                  <td className="px-4 py-3">
                    <ProductionStatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={() => setCurrentView('production-active')}>
            Active production
          </Button>
          <Button size="sm" variant="outline" onClick={() => setCurrentView('inv-finished')}>
            Finished goods inventory
          </Button>
        </div>
      </Section>
    </ProductionPageShell>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
      <h3 className="text-xs font-semibold text-[#475569] mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-[#1E293B]">{title}</h3>
      {children}
    </div>
  );
}