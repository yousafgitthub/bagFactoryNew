'use client';

import React, { useMemo } from 'react';
import { useERP } from '../../../context/ERPContext';
import { InventoryPageShell } from '../../inventory/InventoryPageShell';
import { CATEGORY_LABELS } from '../../../data/inventory';
import { sumByCategory } from '../../../inventory/inventoryUtils';
import { Button } from '../../common/Button';
import {
  exportInventoryStockCSV,
  exportLowStockCSV,
  exportMovementsCSV,
  exportWarehouseSummaryCSV,
} from '../../../utils/exportUtils';
import type { InventoryCategory } from '../../../types/erp';

export function InvReportsView() {
  const { inventory, stockMovements, stockTransferRecords, stockAdjustmentRecords, warehouses } = useERP();

  const lowStockLines = useMemo(
    () => inventory.filter((i) => i.status === 'Low Stock' || i.status === 'Critical'),
    [inventory]
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <InventoryPageShell
      title="Inventory Reports"
      subtitle="Valuation, movement exports, and warehouse summaries from live client state."
      actions={
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            Print report
          </Button>
          <Button variant="primary" size="sm" onClick={() => exportInventoryStockCSV(inventory)}>
            Export Stock CSV
          </Button>
        </div>
      }
    >
      <div className="printable-area space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          {(Object.keys(CATEGORY_LABELS) as InventoryCategory[]).map((cat) => {
            const t = sumByCategory(inventory, cat);
            return (
              <div key={cat} className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase">{CATEGORY_LABELS[cat]}</p>
                <p className="text-lg font-bold text-slate-800 mt-1">{t.qtyKg.toLocaleString()} kg</p>
                <p className="text-sm text-slate-600">Rs. {t.valuePkr.toLocaleString()}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-1">
          <p>
            Movement entries: <strong>{stockMovements.length}</strong>
          </p>
          <p>
            Transfer documents: <strong>{stockTransferRecords.length}</strong>
          </p>
          <p>
            Adjustment documents: <strong>{stockAdjustmentRecords.length}</strong>
          </p>
          <p>
            Low / critical SKUs: <strong>{lowStockLines.length}</strong>
          </p>
        </div>

        <div className="flex flex-wrap gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={() => exportMovementsCSV(stockMovements)}>
            Export Movements CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportLowStockCSV(inventory)}>
            Export Low Stock CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportWarehouseSummaryCSV(warehouses, inventory)}>
            Export Warehouse Summary CSV
          </Button>
        </div>
      </div>
    </InventoryPageShell>
  );
}