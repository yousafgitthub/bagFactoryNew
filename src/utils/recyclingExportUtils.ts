import type { RecyclingBatch } from '../types/erp';
import { getBatchOutputs, getTotalOutputKg } from '../recycling/recyclingUtils';

export function exportRecyclingBatchesCSV(batches: RecyclingBatch[], filename = 'recycling-batches.csv') {
  const headers = [
    'Batch Number',
    'Date',
    'Status',
    'Waste Material',
    'Input kg',
    'Output kg',
    'Loss kg',
    'Yield %',
    'Total Cost PKR',
    'Cost/kg',
    'Operator',
  ];
  const rows = batches.map((b) => [
    b.batchNumber,
    b.processingDate,
    b.status,
    b.wasteInputName,
    b.inputWasteQtyKg,
    getTotalOutputKg(b),
    b.processingLossKg,
    b.yieldPercentage,
    b.totalBatchCost,
    b.costPerKg,
    b.operator,
  ]);
  downloadCsv(headers, rows, filename);
}

export function exportRecyclingInputsCSV(batches: RecyclingBatch[]) {
  const headers = [
    'Batch Number',
    'Date',
    'Waste Material',
    'Warehouse',
    'Qty kg',
    'Cost/kg',
    'Total Cost',
    'Operator',
  ];
  const rows = batches
    .filter((b) => b.wasteStockDeducted || b.status === 'Completed')
    .map((b) => [
      b.batchNumber,
      b.processingDate,
      b.wasteInputName,
      b.inputWarehouse,
      b.inputWasteQtyKg,
      b.wasteCostPerKg,
      b.inputWasteQtyKg * b.wasteCostPerKg,
      b.operator,
    ]);
  downloadCsv(headers, rows, 'recycling-inputs.csv');
}

export function exportRecyclingOutputsCSV(batches: RecyclingBatch[]) {
  const headers = [
    'Batch Number',
    'Date',
    'Material',
    'Qty kg',
    'Warehouse',
    'Allocated Cost',
    'Cost/kg',
    'Status',
  ];
  const rows: (string | number)[][] = [];
  batches.forEach((b) => {
    getBatchOutputs(b).forEach((o) => {
      rows.push([
        b.batchNumber,
        b.processingDate,
        o.materialName,
        o.outputQtyKg,
        o.outputWarehouse,
        o.allocatedCost,
        o.costPerKg,
        b.status,
      ]);
    });
  });
  downloadCsv(headers, rows, 'recycling-outputs.csv');
}

function downloadCsv(headers: string[], rows: (string | number)[][], filename: string) {
  const csv = [headers.join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeCsv(val: string | number) {
  const s = String(val);
  return s.includes(',') ? `"${s.replace(/"/g, '""')}"` : s;
}