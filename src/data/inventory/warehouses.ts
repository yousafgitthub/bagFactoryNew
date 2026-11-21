import { InventoryCategory, WarehouseMaster } from '../../types/erp';

/** Phase 2 — five operational stores (kg, PKR valuation). */
export const INITIAL_WAREHOUSES: WarehouseMaster[] = [
  {
    id: 'wh-a',
    code: 'WH-A',
    name: 'Raw Material Store A',
    categoryFocus: 'NEW_BRANDED',
    location: 'North Yard, Gate 1',
    capacityKg: 12000,
    currentLoadKg: 4100,
    manager: 'Farhan Zaidi',
    status: 'Active',
  },
  {
    id: 'wh-b',
    code: 'WH-B',
    name: 'Waste Scrap Yard B',
    categoryFocus: 'WASTE_PLASTIC',
    location: 'East Sorting Bay',
    capacityKg: 8000,
    currentLoadKg: 2450,
    manager: 'Naveed Akhtar',
    status: 'Active',
  },
  {
    id: 'wh-c',
    code: 'WH-C',
    name: 'Recycled Polymer Silo C',
    categoryFocus: 'RECYCLED_RAW',
    location: 'Recycling Line Feed',
    capacityKg: 6000,
    currentLoadKg: 1300,
    manager: 'Naveed Akhtar',
    status: 'Active',
  },
  {
    id: 'wh-d',
    code: 'WH-D',
    name: 'Finished Goods Hall D',
    categoryFocus: 'FINISHED_GOODS',
    location: 'Dispatch Hall',
    capacityKg: 10000,
    currentLoadKg: 2620,
    manager: 'Shahid Mehmood',
    status: 'Active',
  },
  {
    id: 'wh-e',
    code: 'WH-E',
    name: 'Dispatch Staging E',
    categoryFocus: 'FINISHED_GOODS',
    location: 'Loading Dock Buffer',
    capacityKg: 4000,
    currentLoadKg: 180,
    manager: 'Shahid Mehmood',
    status: 'Active',
  },
];

export const INVENTORY_BRANDS = ['ABHA', 'Crystal'] as const;
export const INVENTORY_COLORS = ['White', 'Black'] as const;

export const CATEGORY_LABELS: Record<InventoryCategory, string> = {
  NEW_BRANDED: 'New Raw Material',
  WASTE_PLASTIC: 'Waste Plastic',
  RECYCLED_RAW: 'Recycled Material',
  FINISHED_GOODS: 'Finished Goods',
};

export const DEFAULT_REORDER_KG: Record<InventoryCategory, number> = {
  NEW_BRANDED: 1000,
  WASTE_PLASTIC: 500,
  RECYCLED_RAW: 400,
  FINISHED_GOODS: 500,
};