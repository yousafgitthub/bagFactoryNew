import type {
  ProductionMachine,
  ProductionOperator,
  ProductionPlan,
  ProductionOrder,
  ProductionSettings,
} from '../types/erp';

export const DEFAULT_PRODUCTION_SETTINGS: ProductionSettings = {
  batchNumberPrefix: 'PROD',
  batchNumberNextSeq: 2,
  orderNumberPrefix: 'PO',
  orderNumberNextSeq: 3,
  planNumberPrefix: 'PLAN',
  planNumberNextSeq: 3,
  defaultUnit: 'kg',
  lossWarningThresholdPct: 10,
  yieldTargetPct: 90,
  brands: ['ABHA', 'Crystal'],
  colors: ['White', 'Black', 'White/Clear'],
  productVariants: [
    { id: 'pv-1', brand: 'ABHA', productName: 'ABHA Shopping Bags', color: 'White', code: 'ABHA-W' },
    { id: 'pv-2', brand: 'ABHA', productName: 'ABHA Shopping Bags', color: 'Black', code: 'ABHA-B' },
    { id: 'pv-3', brand: 'Crystal', productName: 'Crystal Shopping Bags', color: 'White', code: 'CRYS-W' },
    { id: 'pv-4', brand: 'Crystal', productName: 'Crystal Shopping Bags', color: 'Black', code: 'CRYS-B' },
  ],
  shifts: ['Morning', 'Evening', 'Night'],
};

export const INITIAL_PRODUCTION_MACHINES: ProductionMachine[] = [
  {
    id: 'pm-1',
    code: 'EXT-01',
    name: 'Extrusion Line 1',
    line: 'Hall A — Twin Screw',
    status: 'Active',
  },
  {
    id: 'pm-2',
    code: 'EXT-02',
    name: 'Extrusion Line 2',
    line: 'Hall A — Single Screw',
    status: 'Active',
  },
  {
    id: 'pm-3',
    code: 'SEAL-01',
    name: 'Sealing & Cutting Line',
    line: 'Hall B',
    status: 'Active',
  },
];

export const INITIAL_PRODUCTION_OPERATORS: ProductionOperator[] = [
  { id: 'po-1', name: 'Muhammad Rafiq (Extrusion Master)', status: 'Active' },
  { id: 'po-2', name: 'Zahid Hussain', status: 'Active' },
  { id: 'po-3', name: 'Shahid Mehmood', status: 'Active' },
];

export const INITIAL_PRODUCTION_PLANS: ProductionPlan[] = [
  {
    id: 'plan-1',
    planNumber: 'PLAN-2026-0001',
    planningDate: '2026-11-18',
    plannedProductionDate: '2026-11-20',
    brand: 'ABHA',
    productName: 'ABHA Shopping Bags',
    color: 'White',
    plannedOutputQtyKg: 480,
    materialSource: 'NEW',
    requiredRawMaterialQtyKg: 533,
    targetYieldPct: 90,
    priority: 'High',
    assignedOperator: 'Zahid Hussain',
    status: 'Approved',
    notes: 'Retail chain order — verify virgin resin stock',
  },
  {
    id: 'plan-2',
    planNumber: 'PLAN-2026-0002',
    planningDate: '2026-11-19',
    plannedProductionDate: '2026-11-22',
    brand: 'ABHA',
    productName: 'ABHA Shopping Bags',
    color: 'Black',
    plannedOutputQtyKg: 400,
    materialSource: 'RECYCLED',
    requiredRawMaterialQtyKg: 444,
    targetYieldPct: 90,
    priority: 'Normal',
    assignedOperator: 'Muhammad Rafiq (Extrusion Master)',
    status: 'Draft',
    notes: 'Use Grade-A recycled granules from Silo C',
  },
];

export const INITIAL_PRODUCTION_ORDERS: ProductionOrder[] = [
  {
    id: 'ord-1',
    orderNumber: 'PO-2026-0001',
    orderDate: '2026-11-17',
    plannedProductionDate: '2026-11-20',
    brand: 'ABHA',
    productName: 'ABHA Shopping Bags',
    color: 'White',
    plannedQtyKg: 480,
    materialSource: 'NEW',
    priority: 'High',
    status: 'Approved',
    notes: 'Linked to PLAN-2026-0001',
    linkedBatchIds: [],
  },
  {
    id: 'ord-2',
    orderNumber: 'PO-2026-0002',
    orderDate: '2026-11-14',
    plannedProductionDate: '2026-11-15',
    brand: 'Crystal',
    productName: 'Crystal Shopping Bags',
    color: 'Black',
    plannedQtyKg: 335,
    materialSource: 'NEW',
    priority: 'Normal',
    status: 'In Progress',
    notes: 'PRD-2026-090 extrusion run',
    linkedBatchIds: ['prd-4'],
  },
];