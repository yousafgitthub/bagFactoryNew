import type { ActiveView } from '../../context/ERPContext';

export interface NavTab {
  id: ActiveView;
  label: string;
}

export interface ModuleNav {
  views: ActiveView[];
  primary: NavTab[];
  more: NavTab[];
  activeAlias?: Partial<Record<ActiveView, ActiveView>>;
}

export interface SidebarItem {
  id: ActiveView;
  label: string;
  isActive: (view: ActiveView) => boolean;
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const is = (...ids: ActiveView[]) => (view: ActiveView) => ids.includes(view);

export const sidebarSections: SidebarSection[] = [
  {
    title: 'Dashboard',
    items: [{ id: 'dashboard', label: 'Dashboard', isActive: is('dashboard') }],
  },
  {
    title: 'Daily operations',
    items: [
      {
        id: 'sales',
        label: 'Sales',
        isActive: (view) => view === 'sales' || view.startsWith('sales-'),
      },
      {
        id: 'purchases',
        label: 'Purchases',
        isActive: (view) => view === 'purchases' || view.startsWith('purchases-'),
      },
      { id: 'khata', label: 'Customer Khata', isActive: is('khata') },
      { id: 'suppliers', label: 'Supplier Khata', isActive: is('suppliers') },
    ],
  },
  {
    title: 'Factory',
    items: [
      {
        id: 'inv-overview',
        label: 'Inventory',
        isActive: (view) => view === 'inventory' || view.startsWith('inv-'),
      },
      {
        id: 'production',
        label: 'Bag production',
        isActive: (view) => view === 'production' || view.startsWith('production-'),
      },
      {
        id: 'recycling',
        label: 'Recycling',
        isActive: (view) => view === 'recycling' || view.startsWith('recycling-'),
      },
    ],
  },
  {
    title: 'Management',
    items: [
      { id: 'customers', label: 'Customers', isActive: is('customers') },
      {
        id: 'purchase-suppliers',
        label: 'Suppliers',
        isActive: is('purchase-suppliers', 'purchase-supplier-detail', 'purchase-supplier-statement'),
      },
      { id: 'employees', label: 'Employees', isActive: is('employees', 'salaries') },
      { id: 'expenses', label: 'Expenses', isActive: is('expenses') },
      { id: 'cash-bank', label: 'Cash & bank', isActive: is('cash-bank') },
      { id: 'loans', label: 'Loans', isActive: is('loans') },
      { id: 'reports', label: 'Reports', isActive: is('reports') },
      { id: 'documents', label: 'Documents', isActive: is('documents') },
    ],
  },
  {
    title: 'Settings',
    items: [
      { id: 'users', label: 'Users & roles', isActive: is('users') },
      { id: 'settings', label: 'General settings', isActive: is('settings') },
    ],
  },
];

export const moduleNavs: ModuleNav[] = [
  {
    views: [
      'sales',
      'sales-all',
      'sales-create',
      'sales-returns',
      'sales-payments',
      'sales-outstanding',
      'sales-reports',
      'sales-settings',
      'sales-invoice-detail',
    ],
    primary: [
      { id: 'sales', label: 'Overview' },
      { id: 'sales-all', label: 'All sales' },
      { id: 'sales-create', label: 'New invoice' },
      { id: 'sales-payments', label: 'Payments' },
      { id: 'sales-outstanding', label: 'Outstanding' },
    ],
    more: [
      { id: 'sales-returns', label: 'Returns' },
      { id: 'sales-reports', label: 'Reports' },
      { id: 'sales-settings', label: 'Settings' },
    ],
    activeAlias: { 'sales-invoice-detail': 'sales-all' },
  },
  {
    views: [
      'purchases',
      'purchases-all',
      'purchases-create',
      'purchases-receive',
      'purchases-returns',
      'purchases-payments',
      'purchases-outstanding',
      'purchases-reports',
      'purchases-settings',
      'purchases-detail',
    ],
    primary: [
      { id: 'purchases', label: 'Overview' },
      { id: 'purchases-all', label: 'All purchases' },
      { id: 'purchases-create', label: 'New purchase' },
      { id: 'purchases-receive', label: 'Receive goods' },
      { id: 'purchases-payments', label: 'Payments' },
      { id: 'purchases-outstanding', label: 'Outstanding' },
    ],
    more: [
      { id: 'purchases-returns', label: 'Returns' },
      { id: 'purchases-reports', label: 'Reports' },
      { id: 'purchases-settings', label: 'Settings' },
    ],
    activeAlias: { 'purchases-detail': 'purchases-all' },
  },
  {
    views: [
      'inventory',
      'inv-overview',
      'inv-all',
      'inv-low-stock',
      'inv-issue',
      'inv-new-raw',
      'inv-waste',
      'inv-recycled',
      'inv-finished',
      'inv-receive',
      'inv-transfer',
      'inv-adjustments',
      'inv-movements',
      'inv-warehouses',
      'inv-reports',
      'inv-settings',
    ],
    primary: [
      { id: 'inv-overview', label: 'Overview' },
      { id: 'inv-all', label: 'All stock' },
      { id: 'inv-low-stock', label: 'Low stock' },
      { id: 'inv-receive', label: 'Receive' },
      { id: 'inv-issue', label: 'Issue' },
    ],
    more: [
      { id: 'inv-new-raw', label: 'New raw material' },
      { id: 'inv-waste', label: 'Waste plastic' },
      { id: 'inv-recycled', label: 'Recycled material' },
      { id: 'inv-finished', label: 'Finished bags' },
      { id: 'inv-transfer', label: 'Transfers' },
      { id: 'inv-adjustments', label: 'Adjustments' },
      { id: 'inv-movements', label: 'Movement ledger' },
      { id: 'inv-warehouses', label: 'Warehouses' },
      { id: 'inv-reports', label: 'Reports' },
      { id: 'inv-settings', label: 'Settings' },
    ],
    activeAlias: { inventory: 'inv-overview' },
  },
  {
    views: [
      'production',
      'production-planning',
      'production-orders',
      'production-create',
      'production-active',
      'production-completed',
      'production-consumption',
      'production-output',
      'production-loss',
      'production-costs',
      'production-reports',
      'production-settings',
      'production-batch-detail',
    ],
    primary: [
      { id: 'production', label: 'Overview' },
      { id: 'production-planning', label: 'Planning' },
      { id: 'production-orders', label: 'Orders' },
      { id: 'production-create', label: 'New batch' },
      { id: 'production-active', label: 'Active' },
      { id: 'production-completed', label: 'Completed' },
    ],
    more: [
      { id: 'production-consumption', label: 'Consumption' },
      { id: 'production-output', label: 'Output' },
      { id: 'production-loss', label: 'Loss' },
      { id: 'production-costs', label: 'Costs' },
      { id: 'production-reports', label: 'Reports' },
      { id: 'production-settings', label: 'Settings' },
    ],
    activeAlias: { 'production-batch-detail': 'production' },
  },
  {
    views: [
      'recycling',
      'recycling-batches',
      'recycling-create',
      'recycling-inputs',
      'recycling-outputs',
      'recycling-loss',
      'recycling-costs',
      'recycling-reports',
      'recycling-settings',
      'recycling-batch-detail',
    ],
    primary: [
      { id: 'recycling', label: 'Overview' },
      { id: 'recycling-batches', label: 'Batches' },
      { id: 'recycling-create', label: 'New batch' },
    ],
    more: [
      { id: 'recycling-inputs', label: 'Inputs' },
      { id: 'recycling-outputs', label: 'Outputs' },
      { id: 'recycling-loss', label: 'Loss' },
      { id: 'recycling-costs', label: 'Costs' },
      { id: 'recycling-reports', label: 'Reports' },
      { id: 'recycling-settings', label: 'Settings' },
    ],
    activeAlias: { 'recycling-batch-detail': 'recycling-batches' },
  },
  {
    views: ['purchase-suppliers', 'purchase-supplier-detail', 'purchase-supplier-statement'],
    primary: [{ id: 'purchase-suppliers', label: 'All suppliers' }],
    more: [],
    activeAlias: {
      'purchase-supplier-detail': 'purchase-suppliers',
      'purchase-supplier-statement': 'purchase-suppliers',
    },
  },
];

export function moduleForView(view: ActiveView): ModuleNav | undefined {
  return moduleNavs.find((module) => module.views.includes(view));
}

const viewMetaMap: Record<ActiveView, { title: string; section: string }> = {
  login: { title: 'Sign in', section: 'Account' },
  dashboard: { title: 'Dashboard', section: 'Dashboard' },
  inventory: { title: 'Inventory', section: 'Factory' },
  'inv-overview': { title: 'Inventory', section: 'Factory' },
  'inv-all': { title: 'All stock', section: 'Factory' },
  'inv-low-stock': { title: 'Low stock', section: 'Factory' },
  'inv-issue': { title: 'Issue stock', section: 'Factory' },
  'inv-new-raw': { title: 'New raw material', section: 'Factory' },
  'inv-waste': { title: 'Waste plastic', section: 'Factory' },
  'inv-recycled': { title: 'Recycled material', section: 'Factory' },
  'inv-finished': { title: 'Finished bags', section: 'Factory' },
  'inv-receive': { title: 'Receive stock', section: 'Factory' },
  'inv-transfer': { title: 'Transfers', section: 'Factory' },
  'inv-adjustments': { title: 'Adjustments', section: 'Factory' },
  'inv-movements': { title: 'Movement ledger', section: 'Factory' },
  'inv-warehouses': { title: 'Warehouses', section: 'Factory' },
  'inv-reports': { title: 'Inventory reports', section: 'Factory' },
  'inv-settings': { title: 'Inventory settings', section: 'Factory' },
  production: { title: 'Bag production', section: 'Factory' },
  'production-planning': { title: 'Production planning', section: 'Factory' },
  'production-orders': { title: 'Production orders', section: 'Factory' },
  'production-create': { title: 'New production batch', section: 'Factory' },
  'production-active': { title: 'Active production', section: 'Factory' },
  'production-completed': { title: 'Completed production', section: 'Factory' },
  'production-consumption': { title: 'Material used', section: 'Factory' },
  'production-output': { title: 'Production output', section: 'Factory' },
  'production-loss': { title: 'Production loss', section: 'Factory' },
  'production-costs': { title: 'Production costs', section: 'Factory' },
  'production-reports': { title: 'Production reports', section: 'Factory' },
  'production-settings': { title: 'Production settings', section: 'Factory' },
  'production-batch-detail': { title: 'Production batch', section: 'Factory' },
  recycling: { title: 'Recycling', section: 'Factory' },
  'recycling-batches': { title: 'Recycling batches', section: 'Factory' },
  'recycling-create': { title: 'New recycling batch', section: 'Factory' },
  'recycling-batch-detail': { title: 'Recycling batch', section: 'Factory' },
  'recycling-inputs': { title: 'Recycling inputs', section: 'Factory' },
  'recycling-outputs': { title: 'Recycling outputs', section: 'Factory' },
  'recycling-loss': { title: 'Processing loss', section: 'Factory' },
  'recycling-costs': { title: 'Recycling costs', section: 'Factory' },
  'recycling-reports': { title: 'Recycling reports', section: 'Factory' },
  'recycling-settings': { title: 'Recycling settings', section: 'Factory' },
  sales: { title: 'Sales', section: 'Daily operations' },
  'sales-all': { title: 'All sales', section: 'Daily operations' },
  'sales-create': { title: 'New invoice', section: 'Daily operations' },
  'sales-returns': { title: 'Sales returns', section: 'Daily operations' },
  'sales-payments': { title: 'Customer payments', section: 'Daily operations' },
  'sales-outstanding': { title: 'Outstanding sales', section: 'Daily operations' },
  'sales-reports': { title: 'Sales reports', section: 'Daily operations' },
  'sales-settings': { title: 'Sales settings', section: 'Daily operations' },
  'sales-invoice-detail': { title: 'Invoice', section: 'Daily operations' },
  purchases: { title: 'Purchases', section: 'Daily operations' },
  'purchases-all': { title: 'All purchases', section: 'Daily operations' },
  'purchases-create': { title: 'New purchase', section: 'Daily operations' },
  'purchases-receive': { title: 'Receive goods', section: 'Daily operations' },
  'purchases-returns': { title: 'Purchase returns', section: 'Daily operations' },
  'purchases-payments': { title: 'Supplier payments', section: 'Daily operations' },
  'purchases-outstanding': { title: 'Outstanding payables', section: 'Daily operations' },
  'purchases-reports': { title: 'Purchase reports', section: 'Daily operations' },
  'purchases-settings': { title: 'Purchase settings', section: 'Daily operations' },
  'purchases-detail': { title: 'Purchase', section: 'Daily operations' },
  'purchase-suppliers': { title: 'Suppliers', section: 'Management' },
  'purchase-supplier-detail': { title: 'Supplier', section: 'Management' },
  'purchase-supplier-statement': { title: 'Supplier statement', section: 'Management' },
  customers: { title: 'Customers', section: 'Management' },
  suppliers: { title: 'Supplier Khata', section: 'Daily operations' },
  khata: { title: 'Customer Khata', section: 'Daily operations' },
  expenses: { title: 'Expenses', section: 'Management' },
  employees: { title: 'Employees', section: 'Management' },
  salaries: { title: 'Salaries', section: 'Management' },
  loans: { title: 'Loans', section: 'Management' },
  'cash-bank': { title: 'Cash & bank', section: 'Management' },
  reports: { title: 'Reports', section: 'Management' },
  documents: { title: 'Documents', section: 'Management' },
  users: { title: 'Users & roles', section: 'Settings' },
  settings: { title: 'General settings', section: 'Settings' },
};

export function viewMeta(view: ActiveView): { title: string; section: string } {
  return viewMetaMap[view] ?? { title: 'Overview', section: 'Home' };
}
