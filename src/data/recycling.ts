import type { ProcessingMachine, RecyclingOperator, RecyclingSettings } from '../types/erp';

export const INITIAL_PROCESSING_MACHINES: ProcessingMachine[] = [
  {
    id: 'rm-1',
    code: 'WASH-01',
    name: 'High-Speed Washing Line #1',
    description: 'Friction washer and float-sink tank for LDPE film scrap',
    status: 'Active',
  },
  {
    id: 'rm-2',
    code: 'AGGR-02',
    name: 'Densifier / Agglomerator Unit',
    description: 'Converts washed flakes into dense agglomerate before extrusion',
    status: 'Active',
  },
  {
    id: 'rm-3',
    code: 'PELT-01',
    name: 'Twin-Screw Pelletizer Line',
    description: 'Primary pelletizing extruder for recycled HDPE granules',
    status: 'Active',
  },
];

export const INITIAL_RECYCLING_OPERATORS: RecyclingOperator[] = [
  {
    id: 'rop-1',
    name: 'Naveed Akhtar',
    employeeRef: 'EMP-REC-01',
    status: 'Active',
  },
  {
    id: 'rop-2',
    name: 'Kamran Siddique',
    employeeRef: 'EMP-REC-02',
    status: 'Active',
  },
];

export const DEFAULT_RECYCLING_SETTINGS: RecyclingSettings = {
  batchNumberPrefix: 'REC',
  batchNumberNextSeq: 1,
  lossWarningThresholdPct: 12,
  costCategories: ['Labor', 'Electricity', 'Machine', 'Transport', 'Maintenance', 'Other'],
};