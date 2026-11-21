import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  SalesInvoice,
  Customer,
  KhataEntry,
  InventoryItem,
  PurchaseBill,
  ExpenseRecord,
  StockMovement,
  WarehouseMaster,
} from '../types/erp';

// ----------------------------------------------------
// 1. Generic CSV Export Utility (Excel compatible)
// ----------------------------------------------------
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const sanitizeCell = (cell: string | number) => {
    const str = String(cell ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(sanitizeCell).join(','),
    ...rows.map((row) => row.map(sanitizeCell).join(',')),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ----------------------------------------------------
// 2. Commercial Invoice PDF Generator
// ----------------------------------------------------
export function generateInvoicePDF(invoice: SalesInvoice, customer?: Customer) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Header Banner - Navy Blue
  doc.setFillColor(20, 34, 56); // #142238
  doc.rect(0, 0, 210, 36, 'F');

  // Brand Info
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('BagFactory ERP', 14, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Shopping Bag Manufacturing Plant (Pvt) Ltd.', 14, 20);
  doc.text('Plot 48, Sector 15, Industrial Area, Karachi / Gujranwala • Tel: +92 21 35009182', 14, 25);
  doc.text('NTN: 8192049-2  |  Sales Tax Registration #: 17-00-8192-001', 14, 30);

  // Title Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(147, 197, 253); // light blue
  doc.text('COMMERCIAL INVOICE', 196, 14, { align: 'right' });
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 196, 20, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${invoice.saleDate}`, 196, 25, { align: 'right' });
  doc.text(`Due Date: ${invoice.dueDate}`, 196, 30, { align: 'right' });

  // Bill To Section
  doc.setFillColor(248, 250, 252); // #F8FAFC
  doc.rect(14, 42, 182, 24, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, 42, 182, 24, 'S');

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('BILLED TO (CUSTOMER):', 18, 48);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.text(invoice.customerName, 18, 54);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Address: ${customer?.address || 'Industrial Market Distribution'}${customer?.city ? `, ${customer.city}` : ''}`, 18, 60);
  doc.text(`Phone: ${customer?.phone || '+92 300 0000000'}  |  Payment Status: ${invoice.paymentStatus.toUpperCase()}`, 130, 60);

  // Line Items Table
  const tableHeaders = [['Item Description', 'Color / Spec', 'Quantity (kg)', 'Rate / kg (PKR)', 'Total Amount (PKR)']];
  const tableData = invoice.items.map((item) => [
    item.productName,
    item.color,
    `${item.qtyKg.toLocaleString()} kg`,
    `Rs. ${item.ratePerKg.toLocaleString()}`,
    `Rs. ${item.totalAmount.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: 72,
    head: tableHeaders,
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [37, 99, 235], // #2563EB
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 32 },
      2: { cellWidth: 26, halign: 'right' },
      3: { cellWidth: 26, halign: 'right' },
      4: { cellWidth: 28, halign: 'right' },
    },
  });

  // Financial Summary
  const finalY = (doc as any).lastAutoTable.finalY + 6;
  const summaryX = 130;

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal:', summaryX, finalY);
  doc.text(`Rs. ${invoice.subtotal.toLocaleString()}`, 196, finalY, { align: 'right' });

  if (invoice.discount > 0) {
    doc.setTextColor(220, 38, 38);
    doc.text('Discount:', summaryX, finalY + 5);
    doc.text(`- Rs. ${invoice.discount.toLocaleString()}`, 196, finalY + 5, { align: 'right' });
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(20, 34, 56);
  doc.text('Grand Total:', summaryX, finalY + 11);
  doc.text(`Rs. ${invoice.grandTotal.toLocaleString()}`, 196, finalY + 11, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(22, 163, 74);
  doc.text('Amount Received:', summaryX, finalY + 17);
  doc.text(`Rs. ${invoice.amountReceived.toLocaleString()}`, 196, finalY + 17, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text('Remaining Balance (Khata):', summaryX, finalY + 23);
  doc.text(`Rs. ${invoice.remainingBalance.toLocaleString()}`, 196, finalY + 23, { align: 'right' });

  // Notes & Signatures
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Terms & Conditions:', 14, finalY);
  doc.text('1. Goods once inspected and dispatched from weighbridge are not returnable without challan.', 14, finalY + 4);
  doc.text('2. Please deposit outstanding balance into factory Meezan / HBL bank accounts.', 14, finalY + 8);

  const signY = finalY + 38;
  doc.setDrawColor(148, 163, 184);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(14, signY, 70, signY);
  doc.line(140, signY, 196, signY);

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Authorized Factory Dispatcher', 14, signY + 4);
  doc.text('Customer Receiver Signature & Stamp', 140, signY + 4);

  // Download PDF
  doc.save(`${invoice.invoiceNumber}_Commercial_Invoice.pdf`);
}

// ----------------------------------------------------
// 3. Customer Khata Statement PDF Generator
// ----------------------------------------------------
export function generateKhataStatementPDF(customer: Customer, ledgerEntries: KhataEntry[]) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Header Banner
  doc.setFillColor(20, 34, 56);
  doc.rect(0, 0, 210, 34, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('BagFactory ERP — Account Statement', 14, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Official Customer Ledger Statement (PKR)', 14, 20);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 14, 26);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(253, 224, 71); // amber
  doc.text(`Closing Balance: Rs. ${customer.currentBalance.toLocaleString()}`, 196, 20, { align: 'right' });
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Net Receivable', 196, 26, { align: 'right' });

  // Customer Summary Card
  doc.setFillColor(248, 250, 252);
  doc.rect(14, 40, 182, 22, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, 40, 182, 22, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`${customer.name} (${customer.code})`, 18, 46);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Company: ${customer.companyName}  |  City: ${customer.city}  |  Phone: ${customer.phone}`, 18, 51);
  doc.text(`Opening Balance: Rs. ${customer.openingBalance.toLocaleString()}  |  Total Sales: Rs. ${customer.totalSales.toLocaleString()}  |  Total Paid: Rs. ${customer.paymentsReceived.toLocaleString()}`, 18, 57);

  // Running Ledger Table
  const headers = [['Date', 'Ref #', 'Description / Particulars', 'Debit (Billed)', 'Credit (Paid)', 'Balance (PKR)']];
  const rows = ledgerEntries.map((e) => [
    e.date,
    e.referenceNo,
    e.description,
    e.debit > 0 ? `Rs. ${e.debit.toLocaleString()}` : '-',
    e.credit > 0 ? `Rs. ${e.credit.toLocaleString()}` : '-',
    `Rs. ${e.runningBalance.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: 68,
    head: headers,
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [20, 34, 56],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 24 },
      2: { cellWidth: 70 },
      3: { cellWidth: 22, halign: 'right' },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 20, halign: 'right', fontStyle: 'bold' },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('This is a computer-generated ledger statement and does not require an ink signature.', 14, finalY);

  doc.save(`${customer.code}_${customer.name.replace(/\s+/g, '_')}_Khata_Statement.pdf`);
}

// ----------------------------------------------------
// 4. Financial Statements PDF (P&L & Balance Sheet)
// ----------------------------------------------------
export function generateFinancialReportPDF(
  reportType: 'PL' | 'BALANCE_SHEET',
  data: {
    totalRevenue: number;
    costOfGoodsSold: number;
    grossProfit: number;
    totalOperatingExpenses: number;
    netOperatingProfit: number;
    expenses: ExpenseRecord[];
    liquidCashBank?: number;
    totalReceivables?: number;
    totalStockValuation?: number;
    totalAssets?: number;
    totalPayables?: number;
    totalLiabilities?: number;
    ownerEquity?: number;
  }
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  doc.setFillColor(20, 34, 56);
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('BagFactory ERP — Executive Financial Statements', 14, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Report: ${reportType === 'PL' ? 'Profit & Loss Statement (YTD)' : 'Statement of Financial Position (Balance Sheet)'}`, 14, 20);
  doc.text(`Reporting Currency: PKR (Rs.)  |  Generated: ${new Date().toLocaleDateString('en-GB')}`, 14, 25);

  if (reportType === 'PL') {
    const headers = [['Account Head / Category', 'Amount (PKR)']];
    const rows: (string | number)[][] = [
      ['Gross Sales Revenue (ABHA & Crystal Shopping Bags)', `Rs. ${data.totalRevenue.toLocaleString()}`],
      ['Cost of Goods Sold - Direct Raw Polymer Consumed', `Rs. ${(data.costOfGoodsSold * 0.65).toLocaleString()}`],
      ['Cost of Goods Sold - Direct Labor & Extruder Wages', `Rs. ${(data.costOfGoodsSold * 0.15).toLocaleString()}`],
      ['Cost of Goods Sold - Electricity & Extrusion Power', `Rs. ${(data.costOfGoodsSold * 0.20).toLocaleString()}`],
      ['TOTAL COST OF GOODS SOLD (COGS)', `Rs. ${data.costOfGoodsSold.toLocaleString()}`],
      ['GROSS MANUFACTURING PROFIT', `Rs. ${data.grossProfit.toLocaleString()}`],
      ...data.expenses.map((e) => [`Operating Expense: ${e.category} (${e.payee})`, `Rs. ${e.amount.toLocaleString()}`]),
      ['TOTAL OPERATING OVERHEADS', `Rs. ${data.totalOperatingExpenses.toLocaleString()}`],
      ['NET FACTORY OPERATING PROFIT', `Rs. ${data.netOperatingProfit.toLocaleString()}`],
    ];

    autoTable(doc, {
      startY: 40,
      head: headers,
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235], fontSize: 9 },
      styles: { fontSize: 8.5 },
      columnStyles: {
        0: { cellWidth: 130 },
        1: { cellWidth: 52, halign: 'right' },
      },
    });
    doc.save('BagFactory_Profit_and_Loss_Statement_FY2026.pdf');
  } else {
    const headers = [['Balance Sheet Category', 'Assets (PKR)', 'Liabilities & Equity (PKR)']];
    const rows: (string | number)[][] = [
      ['Cash & Bank Balances (Safe, Meezan, HBL)', `Rs. ${(data.liquidCashBank || 0).toLocaleString()}`, '-'],
      ['Accounts Receivable (Customer Khata)', `Rs. ${(data.totalReceivables || 0).toLocaleString()}`, '-'],
      ['Physical Inventory Stock (4 Segregated Categories)', `Rs. ${(data.totalStockValuation || 0).toLocaleString()}`, '-'],
      ['Fixed Assets: Extrusion Plants & Recycling Mill', 'Rs. 4,500,000', '-'],
      ['Accounts Payable (Supplier Khata)', '-', `Rs. ${(data.totalPayables || 0).toLocaleString()}`],
      ['Commercial Machinery Loans & Liabilities', '-', 'Rs. 1,320,000'],
      ['Owner Equity & Retained Surplus', '-', `Rs. ${(data.ownerEquity || 0).toLocaleString()}`],
      ['TOTAL BALANCED ASSETS & LIABILITIES', `Rs. ${(data.totalAssets || 0).toLocaleString()}`, `Rs. ${(data.totalAssets || 0).toLocaleString()}`],
    ];

    autoTable(doc, {
      startY: 40,
      head: headers,
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [20, 34, 56], fontSize: 9 },
      styles: { fontSize: 8.5 },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 46, halign: 'right' },
        2: { cellWidth: 46, halign: 'right' },
      },
    });
    doc.save('BagFactory_Commercial_Balance_Sheet.pdf');
  }
}

// ----------------------------------------------------
// 5. 1-Click CSV / Excel Exports
// ----------------------------------------------------
export function exportSalesRegisterCSV(salesInvoices: SalesInvoice[]) {
  const headers = ['Invoice #', 'Sale Date', 'Customer', 'Products', 'Total Qty (kg)', 'Subtotal (PKR)', 'Discount (PKR)', 'Grand Total (PKR)', 'Amount Received', 'Remaining Balance', 'Payment Status', 'Payment Method'];
  const rows = salesInvoices.map((inv) => [
    inv.invoiceNumber,
    inv.saleDate,
    inv.customerName,
    inv.items.map((i) => `${i.productName} (${i.color})`).join('; '),
    inv.items.reduce((s, i) => s + i.qtyKg, 0),
    inv.subtotal,
    inv.discount,
    inv.grandTotal,
    inv.amountReceived,
    inv.remainingBalance,
    inv.paymentStatus,
    inv.paymentMethod || 'Credit',
  ]);
  exportToCSV('BagFactory_Sales_Register', headers, rows);
}

export function exportMovementsCSV(movements: StockMovement[]) {
  const headers = [
    'Date',
    'Type',
    'Item',
    'Warehouse',
    'Qty (kg)',
    'Unit Cost (PKR/kg)',
    'Total PKR',
    'Reference',
    'Operator',
    'Notes',
  ];
  const rows = movements.map((m) => [
    m.date,
    m.type,
    m.itemName,
    m.warehouse,
    m.qtyKg,
    m.unitCost,
    m.totalCost,
    m.referenceNo,
    m.operator,
    m.notes ?? '',
  ]);
  exportToCSV('BagFactory_Inventory_Movements', headers, rows);
}

export function exportLowStockCSV(inventory: InventoryItem[]) {
  const alerts = inventory.filter((i) => i.status === 'Low Stock' || i.status === 'Critical');
  const headers = [
    'Item',
    'Category',
    'Warehouse',
    'Available (kg)',
    'Reorder (kg)',
    'Shortage (kg)',
    'Status',
    'Batch',
  ];
  const rows = alerts.map((i) => [
    i.name,
    i.category,
    i.warehouse,
    i.availableKg,
    i.reorderLevelKg,
    Math.max(0, i.reorderLevelKg - i.availableKg),
    i.status,
    i.batchNumber,
  ]);
  exportToCSV('BagFactory_Low_Stock_Alerts', headers, rows);
}

export function exportWarehouseSummaryCSV(warehouses: WarehouseMaster[], inventory: InventoryItem[]) {
  const headers = ['Code', 'Warehouse', 'Status', 'Capacity (kg)', 'On Hand (kg)', 'Utilization %', 'Value (PKR)'];
  const rows = warehouses.map((w) => {
    const load = inventory.filter((i) => i.warehouse === w.name).reduce((a, i) => a + i.availableKg, 0);
    const value = inventory.filter((i) => i.warehouse === w.name).reduce((a, i) => a + i.totalValue, 0);
    const pct = w.capacityKg > 0 ? Math.round((load / w.capacityKg) * 100) : 0;
    return [w.code, w.name, w.status, w.capacityKg, load, pct, value];
  });
  exportToCSV('BagFactory_Warehouse_Summary', headers, rows);
}

export function exportInventoryStockCSV(inventory: InventoryItem[]) {
  const headers = ['Item Name', 'Category', 'Warehouse', 'Available Qty (kg)', 'Reserved Qty (kg)', 'Unit Cost (PKR/kg)', 'Total Value (PKR)', 'Batch #', 'Supplier / Origin', 'Status', 'Last Updated'];
  const rows = inventory.map((item) => [
    item.name,
    item.category,
    item.warehouse,
    item.availableKg,
    item.reservedKg,
    item.unitCost,
    item.totalValue,
    item.batchNumber,
    item.supplier || 'Internal',
    item.status,
    item.lastUpdated,
  ]);
  exportToCSV('BagFactory_Inventory_Stock_Report', headers, rows);
}

export function exportPurchasesCSV(purchaseBills: PurchaseBill[]) {
  const headers = ['Purchase #', 'Date', 'Supplier', 'Category', 'Material Name', 'Quantity (kg)', 'Rate / kg (PKR)', 'Total Bill (PKR)', 'Paid Amount', 'Remaining Payable', 'Status', 'Warehouse'];
  const rows = purchaseBills.map((b) => [
    b.purchaseNumber,
    b.purchaseDate,
    b.supplierName,
    b.category,
    b.materialName,
    b.quantityKg,
    b.ratePerKg,
    b.totalAmount,
    b.paidAmount,
    b.remainingPayable,
    b.paymentStatus,
    b.warehouse,
  ]);
  exportToCSV('BagFactory_Purchases_Register', headers, rows);
}

export function exportKhataLedgerCSV(customer: Customer, entries: KhataEntry[]) {
  const headers = ['Date', 'Reference #', 'Particulars / Description', 'Debit (Billed PKR)', 'Credit (Received PKR)', 'Running Balance (PKR)'];
  const rows = entries.map((e) => [
    e.date,
    e.referenceNo,
    e.description,
    e.debit,
    e.credit,
    e.runningBalance,
  ]);
  exportToCSV(`Khata_Statement_${customer.code}_${customer.name.replace(/\s+/g, '_')}`, headers, rows);
}
