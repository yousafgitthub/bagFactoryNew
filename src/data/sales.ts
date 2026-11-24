import type { CustomerPayment, SalesReturn, SalesSettings } from '../types/erp';

export const DEFAULT_SALES_SETTINGS: SalesSettings = {
  invoiceNumberPrefix: 'INV',
  invoiceNumberNextSeq: 1005,
  defaultPaymentTermsDays: 14,
  defaultCurrency: 'PKR',
  defaultUnit: 'kg',
  discountEnabled: true,
  taxEnabled: false,
  taxRatePct: 0,
  invoiceFooter: 'Thank you for your business. Goods sold by weight (kg). Payment due per agreed terms.',
  factoryName: 'BagFactory ERP — Shopping Bag Manufacturing',
  factoryAddress: 'Industrial Area, Karachi, Sindh, Pakistan',
  factoryPhone: '+92-21-34567890',
  paymentMethods: ['Cash', 'Bank Transfer', 'Cheque', 'Other'],
  returnPolicyNote: 'Returns require inspection. Only saleable stock is restored to finished goods.',
  brands: ['ABHA', 'Crystal'],
  colors: ['White', 'Black', 'White/Clear'],
};

export const INITIAL_CUSTOMER_PAYMENTS: CustomerPayment[] = [
  {
    id: 'pay-1001',
    paymentReference: 'RCP-2026-1101',
    paymentDate: '2026-11-14',
    customerId: 'cust-1',
    customerName: 'Al-Rahim Supermarket Chain',
    invoiceId: 'inv-1001',
    invoiceNumber: 'INV-2026-0001',
    amount: 20000,
    paymentMethod: 'Bank Transfer',
    accountRef: 'Meezan Bank — Current',
    transactionRef: 'TXN-MZN-88120',
    notes: 'Partial payment against INV-1001',
  },
  {
    id: 'pay-1002',
    paymentReference: 'RCP-2026-1102',
    paymentDate: '2026-11-11',
    customerId: 'cust-2',
    customerName: 'Iqbal General Store & Cash & Carry',
    invoiceId: 'inv-1002',
    invoiceNumber: 'INV-2026-0002',
    amount: 48500,
    paymentMethod: 'Cash',
    notes: 'Full payment on delivery',
  },
];

export const INITIAL_SALES_RETURNS: SalesReturn[] = [
  {
    id: 'ret-001',
    returnReference: 'SRET-2026-0001',
    invoiceId: 'inv-1002',
    invoiceNumber: 'INV-2026-0002',
    customerId: 'cust-2',
    customerName: 'Iqbal General Store & Cash & Carry',
    returnDate: '2026-11-15',
    items: [
      {
        id: 'ri-1',
        invoiceItemId: 'item-2',
        productName: 'Crystal White Transparent High-Strength Bags',
        brand: 'Crystal',
        color: 'White/Clear',
        qtyReturnedKg: 5,
        condition: 'Saleable',
        batchNumber: 'FG-CRYS-W-12',
      },
    ],
    reason: 'Minor packaging damage — bags saleable after QA',
    status: 'Completed',
    stockRestored: true,
    financialCredit: 2900,
    notes: '5 kg credited at pro-rata rate',
  },
];