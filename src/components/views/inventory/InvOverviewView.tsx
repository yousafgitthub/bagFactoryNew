'use client';

import React, { useMemo } from 'react';
import { useERP } from '../../../context/ERPContext';
import { InventoryPageShell } from '../../inventory/InventoryPageShell';
import { KPICard } from '../../common/KPICard';
import { CATEGORY_LABELS } from '../../../data/inventory';
import { sumByCategory } from '../../../inventory/inventoryUtils';
import { Boxes, ArrowRight, Warehouse } from 'lucide-react';
import { Button } from '../../common/Button';
import type { InventoryCategory } from '../../../types/erp';
import type { ActiveView } from '../../../context/ERPContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const CATEGORY_VIEWS: Record<InventoryCategory, ActiveView> = {
  NEW_BRANDED: 'inv-new-raw',
  WASTE_PLASTIC: 'inv-waste',
  RECYCLED_RAW: 'inv-recycled',
  FINISHED_GOODS: 'inv-finished',
};

const CHART_COLORS = ['#2563EB', '#F59E0B', '#10B981', '#8B5CF6', '#64748B'];

export function InvOverviewView() {
  const { inventory, warehouses, setCurrentView, stockMovements } = useERP();

  const totalKg = inventory.reduce((a, i) => a + i.availableKg, 0);
  const totalVal = inventory.reduce((a, i) => a + i.totalValue, 0);
  const lowCount = inventory.filter((i) => i.status === 'Low Stock' || i.status === 'Critical').length;
  const movementCount = stockMovements.length;

  const categoryChart = useMemo(
    () =>
      (Object.keys(CATEGORY_LABELS) as InventoryCategory[]).map((cat, idx) => ({
        name: CATEGORY_LABELS[cat].split('(')[0].trim().slice(0, 18),
        qtyKg: sumByCategory(inventory, cat).qtyKg,
        valuePkr: sumByCategory(inventory, cat).valuePkr,
        fill: CHART_COLORS[idx],
      })),
    [inventory]
  );

  const warehouseChart = useMemo(
    () =>
      warehouses.map((w, idx) => {
        const load = inventory.filter((i) => i.warehouse === w.name).reduce((a, i) => a + i.availableKg, 0);
        return { name: w.code, loadKg: load, fill: CHART_COLORS[idx % CHART_COLORS.length] };
      }),
    [warehouses, inventory]
  );

  const movementTrend = useMemo(() => {
    const buckets: Record<string, { inKg: number; outKg: number }> = {};
    stockMovements.forEach((m) => {
      const day = m.date.slice(0, 10);
      if (!buckets[day]) buckets[day] = { inKg: 0, outKg: 0 };
      if (m.type === 'IN' || m.type === 'PRODUCTION_OUTPUT' || m.type === 'RECYCLING_OUTPUT') {
        buckets[day].inKg += m.qtyKg;
      }
      if (m.type === 'OUT' || m.type === 'PRODUCTION_CONSUME' || m.type === 'RECYCLING_CONSUME') {
        buckets[day].outKg += m.qtyKg;
      }
    });
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, v]) => ({ date: date.slice(5), inKg: Math.round(v.inKg), outKg: Math.round(v.outKg) }));
  }, [stockMovements]);

  return (
    <InventoryPageShell
      title="Inventory Management Hub"
      subtitle="Phase 2 command center — four isolated material categories (kg + PKR), five warehouses, weighted-average costing on receipt."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentView('inv-all')}>
            All Inventory
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentView('inv-issue')}>
            Issue Stock
          </Button>
          <Button variant="primary" size="sm" onClick={() => setCurrentView('inv-receive')}>
            Receive Stock
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total On Hand" value={`${totalKg.toLocaleString()} kg`} icon={Boxes} highlightColor="blue" />
        <KPICard title="Inventory Value" value={`Rs. ${totalVal.toLocaleString()}`} icon={Boxes} highlightColor="navy" />
        <KPICard title="Stock Alerts" value={String(lowCount)} icon={Boxes} highlightColor={lowCount ? 'amber' : 'green'} />
        <KPICard title="Movement Ledger" value={String(movementCount)} subtitle="Audit trail entries" icon={Boxes} highlightColor="navy" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Stock by category (kg)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="qtyKg" name="kg" radius={[4, 4, 0, 0]}>
                  {categoryChart.map((entry, index) => (
                    <Cell key={`c-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Valuation by category (PKR)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [`Rs. ${v.toLocaleString()}`, 'Value']} />
                <Bar dataKey="valuePkr" name="PKR" fill="#142238" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Warehouse load distribution</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={warehouseChart} dataKey="loadKg" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {warehouseChart.map((entry, index) => (
                    <Cell key={`w-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()} kg`, 'Load']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Stock in / out trend (14 days)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={movementTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="inKg" name="Inbound kg" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="outKg" name="Outbound kg" stroke="#EF4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.keys(CATEGORY_LABELS) as InventoryCategory[]).map((cat) => {
          const t = sumByCategory(inventory, cat);
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCurrentView(CATEGORY_VIEWS[cat])}
              className="text-left bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{CATEGORY_LABELS[cat]}</p>
                  <p className="text-lg font-bold text-slate-800 mt-1">{t.qtyKg.toLocaleString()} kg</p>
                  <p className="text-xs text-slate-500">Rs. {t.valuePkr.toLocaleString()}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Warehouse className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-800">Warehouse Utilization</h3>
        </div>
        <div className="space-y-3">
          {warehouses.map((w) => {
            const load = inventory.filter((i) => i.warehouse === w.name).reduce((a, i) => a + i.availableKg, 0);
            const pct = Math.min(100, Math.round((load / w.capacityKg) * 100));
            return (
              <div key={w.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">{w.name}</span>
                  <span className="text-slate-500">
                    {load.toLocaleString()} / {w.capacityKg.toLocaleString()} kg ({pct}%)
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </InventoryPageShell>
  );
}