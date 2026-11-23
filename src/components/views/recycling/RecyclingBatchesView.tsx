'use client';

import React, { useMemo, useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { Button } from '../../common/Button';
import { RecyclingPageShell } from './RecyclingPageShell';
import { RecyclingStatusBadge } from './RecyclingStatusBadge';
import { getTotalOutputKg } from '../../../recycling/recyclingUtils';
import { Plus, Play, CheckCircle, XCircle } from 'lucide-react';

export function RecyclingBatchesView() {
  const {
    recyclingBatches,
    setCurrentView,
    setSelectedEntityId,
    startRecyclingBatch,
    completeRecyclingBatch,
    cancelRecyclingBatch,
    searchQuery,
  } = useERP();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return recyclingBatches.filter((b) => {
      const matchSearch =
        searchQuery === '' ||
        b.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.wasteInputName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [recyclingBatches, searchQuery, statusFilter]);

  return (
    <RecyclingPageShell
      title="Recycling Batches"
      subtitle="Batch lifecycle: Draft → In Progress → Completed. Completed batches cannot be silently edited."
      actions={
        <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setCurrentView('recycling-create')}>
          Create Recycling Batch
        </Button>
      }
    >
      <div className="flex flex-wrap gap-2">
        {['all', 'Draft', 'In Progress', 'Completed', 'Cancelled'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 text-xs rounded-lg border ${statusFilter === s ? 'bg-purple-100 border-purple-300 text-purple-900 font-semibold' : 'bg-white border-slate-200 text-slate-600'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Batch #</th>
                <th className="px-3">Date</th>
                <th className="px-3">Waste Material</th>
                <th className="px-3 text-right">In kg</th>
                <th className="px-3 text-right">Out kg</th>
                <th className="px-3 text-right">Loss</th>
                <th className="px-3 text-right">Yield</th>
                <th className="px-3 text-right">Total Cost</th>
                <th className="px-3">Operator</th>
                <th className="px-3">Status</th>
                <th className="px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-bold text-purple-700">{b.batchNumber}</td>
                  <td className="px-3">{b.processingDate}</td>
                  <td className="px-3">{b.wasteInputName}</td>
                  <td className="px-3 text-right">{b.inputWasteQtyKg}</td>
                  <td className="px-3 text-right">{getTotalOutputKg(b)}</td>
                  <td className="px-3 text-right text-rose-600">{b.processingLossKg}</td>
                  <td className="px-3 text-right">{b.yieldPercentage}%</td>
                  <td className="px-3 text-right">Rs. {b.totalBatchCost.toLocaleString()}</td>
                  <td className="px-3">{b.operator}</td>
                  <td className="px-3">
                    <RecyclingStatusBadge status={b.status} />
                  </td>
                  <td className="px-4">
                    <div className="flex flex-wrap gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEntityId(b.id);
                          setCurrentView('recycling-batch-detail');
                        }}
                      >
                        View
                      </Button>
                      {b.status === 'Draft' && (
                        <Button variant="outline" size="sm" icon={<Play className="w-3 h-3" />} onClick={() => startRecyclingBatch(b.id)}>
                          Start
                        </Button>
                      )}
                      {(b.status === 'Draft' || b.status === 'In Progress') && (
                        <Button variant="primary" size="sm" icon={<CheckCircle className="w-3 h-3" />} onClick={() => completeRecyclingBatch(b.id)}>
                          Complete
                        </Button>
                      )}
                      {b.status !== 'Completed' && b.status !== 'Cancelled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<XCircle className="w-3 h-3" />}
                          onClick={() => cancelRecyclingBatch(b.id, 'Cancelled by operator from batch list')}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RecyclingPageShell>
  );
}