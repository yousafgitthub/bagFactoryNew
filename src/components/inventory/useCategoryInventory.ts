'use client';

import { useMemo, useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { InventoryCategory, InventoryItem } from '../../types/erp';

export function useCategoryInventory(category: InventoryCategory) {
  const { inventory, searchQuery, warehouses } = useERP();
  const [warehouseFilter, setWarehouseFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filtered = useMemo(() => {
    return inventory.filter((item) => {
      if (item.category !== category) return false;
      if (warehouseFilter !== 'ALL' && item.warehouse !== warehouseFilter) return false;
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.batchNumber.toLowerCase().includes(q) ||
          (item.supplier?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [inventory, category, warehouseFilter, statusFilter, searchQuery]);

  const totals = useMemo(() => {
    const rows = inventory.filter((i) => i.category === category);
    return {
      qtyKg: rows.reduce((a, i) => a + i.availableKg, 0),
      valuePkr: rows.reduce((a, i) => a + i.totalValue, 0),
      lowCount: rows.filter((i) => i.status === 'Low Stock' || i.status === 'Critical').length,
    };
  }, [inventory, category]);

  return {
    items: filtered as InventoryItem[],
    totals,
    warehouseFilter,
    setWarehouseFilter,
    statusFilter,
    setStatusFilter,
    warehouseOptions: warehouses.map((w) => w.name),
  };
}