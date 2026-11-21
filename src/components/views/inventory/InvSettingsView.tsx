'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { InventoryPageShell } from '../../inventory/InventoryPageShell';
import { CATEGORY_LABELS } from '../../../data/inventory';
import { Button } from '../../common/Button';
import type { InventoryCategory } from '../../../types/erp';

export function InvSettingsView() {
  const { inventoryModuleSettings, updateInventoryModuleSettings } = useERP();
  const [brands, setBrands] = useState(inventoryModuleSettings.brands.join(', '));
  const [colors, setColors] = useState(inventoryModuleSettings.colors.join(', '));
  const [reorder, setReorder] = useState({ ...inventoryModuleSettings.reorderLevelsKg });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateInventoryModuleSettings({
      brands: brands
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      colors: colors
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      reorderLevelsKg: reorder,
    });
  };

  return (
    <InventoryPageShell
      title="Inventory Settings"
      subtitle="Master data for finished-goods brands (ABHA, Crystal), colors (White, Black), and default reorder levels (kg)."
    >
      <form onSubmit={save} className="bg-white border border-slate-200 rounded-xl p-6 max-w-xl space-y-4">
        <label className="block text-xs font-medium text-slate-600">
          Product brands (comma-separated)
          <input value={brands} onChange={(e) => setBrands(e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
        </label>
        <label className="block text-xs font-medium text-slate-600">
          Colors (comma-separated)
          <input value={colors} onChange={(e) => setColors(e.target.value)} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
        </label>
        <ReorderLevelsFields reorder={reorder} setReorder={setReorder} />
        <Button type="submit" variant="primary">
          Save Settings
        </Button>
      </form>
    </InventoryPageShell>
  );
}

function ReorderLevelsFields({
  reorder,
  setReorder,
}: {
  reorder: Record<InventoryCategory, number>;
  setReorder: React.Dispatch<React.SetStateAction<Record<InventoryCategory, number>>>;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-600">Default reorder level (kg) per category</p>
      {(Object.keys(CATEGORY_LABELS) as InventoryCategory[]).map((cat) => (
        <label key={cat} className="flex items-center justify-between text-xs text-slate-600 gap-4">
          <span>{CATEGORY_LABELS[cat]}</span>
          <input
            type="number"
            min="0"
            value={reorder[cat]}
            onChange={(e) =>
              setReorder((prev) => ({
                ...prev,
                [cat]: parseFloat(e.target.value) || 0,
              }))
            }
            className="w-28 border border-slate-200 rounded-lg px-2 py-1 text-sm"
          />
        </label>
      ))}
    </div>
  );
}