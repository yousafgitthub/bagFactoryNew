'use client';

import React from 'react';
import { useERP } from '../../../context/ERPContext';
import { InventoryPageShell } from '../../inventory/InventoryPageShell';
import { InventoryDataTable } from '../../inventory/InventoryDataTable';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';
import { CATEGORY_LABELS } from '../../../data/inventory';
import type { InventoryCategory } from '../../../types/erp';

export function InvWarehousesView() {
  const { warehouses, inventory, setWarehouseStatus } = useERP();

  const rows = warehouses.map((w) => {
    const load = inventory.filter((i) => i.warehouse === w.name).reduce((a, i) => a + i.availableKg, 0);
    const value = inventory.filter((i) => i.warehouse === w.name).reduce((a, i) => a + i.totalValue, 0);
    return { ...w, loadKg: load, valuePkr: value };
  });

  return (
    <InventoryPageShell
      title="Warehouses"
      subtitle="Five operational stores — activate or deactivate sites; inactive stores are blocked on receive and transfer."
    >
      <InventoryDataTable
        rows={rows}
        csvFileName="warehouses"
        columns={[
          { key: 'code', header: 'Code', render: (r) => r.code, csvValue: (r) => r.code },
          { key: 'name', header: 'Name', render: (r) => r.name, csvValue: (r) => r.name },
          {
            key: 'focus',
            header: 'Category focus',
            render: (r) =>
              r.categoryFocus === 'MIXED' ? 'Mixed' : CATEGORY_LABELS[r.categoryFocus as InventoryCategory],
            csvValue: (r) => String(r.categoryFocus),
          },
          { key: 'loc', header: 'Location', render: (r) => r.location, csvValue: (r) => r.location },
          {
            key: 'cap',
            header: 'Capacity (kg)',
            render: (r) => r.capacityKg.toLocaleString(),
            csvValue: (r) => r.capacityKg,
          },
          { key: 'load', header: 'On hand (kg)', render: (r) => r.loadKg.toLocaleString(), csvValue: (r) => r.loadKg },
          {
            key: 'val',
            header: 'Value (PKR)',
            render: (r) => r.valuePkr.toLocaleString(),
            csvValue: (r) => r.valuePkr,
          },
          { key: 'mgr', header: 'Manager', render: (r) => r.manager, csvValue: (r) => r.manager },
          {
            key: 'status',
            header: 'Status',
            render: (r) => (
              <Badge variant={r.status === 'Active' ? 'success' : 'secondary'}>{r.status}</Badge>
            ),
            csvValue: (r) => r.status,
          },
          {
            key: 'toggle',
            header: '',
            render: (r) => (
              <Button
                variant={r.status === 'Active' ? 'outline' : 'primary'}
                size="sm"
                onClick={() => setWarehouseStatus(r.id, r.status === 'Active' ? 'Inactive' : 'Active')}
              >
                {r.status === 'Active' ? 'Deactivate' : 'Activate'}
              </Button>
            ),
          },
        ]}
      />
    </InventoryPageShell>
  );
}