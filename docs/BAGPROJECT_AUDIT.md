# BagProject — Phase 1 audit (read-only)

**Audit date:** 2026-11-20  
**Assigned path:** `D:\laragon\www\BagProject`  
**Auditor scope:** Module map, data model (as designed), workflows, gaps vs Project context. No schema changes, no destructive DB operations.

---

## Executive summary

`D:\laragon\www\BagProject` is **not a Laravel application**. It is a **Next.js 14 + React 18 + TypeScript** single-page prototype (`package.json` name: `bagfactory-erp`). All business data lives in **in-memory React state** seeded from `src/data/sampleData.ts`. There is **no database**, **no API**, **no authentication backend**, and **no git repository** in this folder.

The **production Laravel ERP** for the same product vision lives at a **sibling path**: `D:\laragon\www\bagfactoryerp` (Laravel, Inertia.js, Vue, MySQL migrations, Spatie permissions, feature tests). Project context (`project-context.md`) describes BagProject as Laravel; that document should be updated to reflect this split or a planned merge.

This audit covers **both** codebases: BagProject as the UX/workflow prototype, and `bagfactoryerp` as the authoritative backend-shaped implementation.

---

## 1. Technology stack

| Location | Stack | Persistence | Auth |
|----------|--------|-------------|------|
| `BagProject` | Next.js 14, Tailwind, Recharts, jspdf | React `useState` only | Cosmetic login (role picker) |
| `bagfactoryerp` | Laravel 11, Inertia, Vue 3, Vite, Tailwind | MySQL via Eloquent | Laravel Breeze + Spatie roles |

**Related paths under `D:\laragon\www`:** `BagProject`, `bagfactoryerp` (only `Bag*` matches found).

---

## 2. BagProject — module map (UI prototype)

Navigation is client-side via `ActiveView` in `src/context/ERPContext.tsx` and `src/components/layout/Sidebar.tsx`.

| Project-context module | BagProject surface | Implementation notes |
|------------------------|-------------------|----------------------|
| Dashboard | `dashboard` | KPIs from sample data; quick actions open modals |
| Products | Settings → Products tab (mostly read-only) | Product families ABHA/Crystal in types; no CRUD persistence |
| Raw Materials | `inventory` (categories) | `NEW_BRANDED`, `WASTE_PLASTIC`, `RECYCLED_RAW`, `FINISHED_GOODS` |
| Suppliers / Purchases | `suppliers`, `purchases` | `createPurchaseBill` updates stock + supplier payable |
| Customers / Sales | `customers`, `sales`, `khata` | Invoices, khata ledger, receipts |
| Production (+ stages) | `production` | Single-step batch; status enum only `Completed` / `In Progress` / `Planned` |
| Inventory | `inventory` | Add, adjust, transfer; `stockMovements` audit list |
| QC | **Missing** | No QC view or workflow |
| Deliveries | **Partial** | Sales PDF mentions challan; `DocumentsView` lists challan category only |
| Reports | `reports` | Charts + CSV/PDF export utilities |
| *(extra)* Recycling | `recycling` | Dana/recycling line not in minimal module list but implemented |
| *(extra)* HR / payroll | `employees`, `salaries` | Combined in `EmployeeManagementView` |
| *(extra)* Loans, cash/bank, expenses, documents | sidebar modules | Full UI with sample data |
| Users & roles | `users` → `SettingsView` ROLES tab | UI mock only; no enforcement |

**Source layout (38 TS/TSX files under `src/`):**

- `src/app/` — Next.js app router (`page.tsx` → `AppShell`)
- `src/context/ERPContext.tsx` — all business rules (~1,060 lines)
- `src/types/erp.ts` — domain types
- `src/data/sampleData.ts` — seed data
- `src/components/views/*` — one view per module
- `src/utils/exportUtils.ts` — PDF exports

There are **no** `routes/web.php`, `app/Models`, or `database/migrations` under BagProject.

---

## 3. bagfactoryerp — module map (Laravel ERP)

Primary route file: `routes/web.php`. Permission-gated hubs per module.

| Module | Route prefix / hub | Controllers / services (representative) |
|--------|-------------------|----------------------------------------|
| Dashboard | `/dashboard` | `DashboardController`, `DashboardDataService` |
| Master data | `/master-data/{resource}`, `/settings` | `MasterDataController`, `MasterDataRegistry` |
| Inventory | `/inventory` | `MaterialController`, `InventoryTransactionController`, `InventoryPostingService` |
| Dana production (recycling/extrusion) | `/dana-production` | `DanaBatchController`, `DanaBatchPostingService` |
| Shopping bag production | `/shopping-bag-production` | `BagOrderController`, `BagBatchController`, `BagBatchPostingService` |
| Machines & halls | `/machines-halls` | Master data hub |
| Purchases | `/purchases` | PO → GRN → invoice → payment; `GoodsReceiptController` |
| Suppliers | `/suppliers` | `SupplierController` |
| Sales | `/sales` | Orders → invoices → receipts; `SalesInvoiceService` |
| Customers | `/customers` | `CustomerController`, customer ledger |
| HR / attendance / payroll | `/employees`, `/attendance`, `/payroll` | Full HR stack |
| Expenses | `/expenses` | `ExpenseController` |
| Accounting | `/accounting` | GL, treasury, company loans, financial reports |
| Reports | `/reports` | `ErpReportController`, multiple report services |
| Public website | `routes/website.php` | Marketing site (not operational ERP) |

Existing internal docs: `bagfactoryerp/docs/erp-ux-audit-and-plan.md`, performance audit, checkpoint docs.

**Tests:** 32 files under `bagfactoryerp/tests` including inventory posting, Dana/bag batch workflows, sales/purchase workflows, payroll, reports.

---

## 4. Database schema (bagfactoryerp only)

14 domain migrations (Nov 2026) plus Laravel defaults and Spatie permission tables.

### Master / factory

`units_of_measurement`, `production_halls`, `machine_types`, `colors`, `material_categories`, `product_categories`, `departments`, `designations`, `warehouses`, `expense_categories`, `machines`

### Inventory core

| Table | Purpose |
|-------|---------|
| `materials`, `material_variants` | Raw / FG catalog, variants, `inventory_bucket` |
| `inventory_transactions`, `inventory_transaction_items` | Draft/posted stock documents |
| `stock_lots` | FIFO-style lot tracking |
| `inventory_balances` | Per warehouse + material (+ variant) quantity |
| `inventory_ledger_entries` | Traceable movements (`movement_type`, `reference`, costs) |
| `stock_adjustments`, `stock_transfers`, `stock_transfer_items` | Adjustments and inter-warehouse moves |

Key FK patterns: materials → categories, units; all stock movements → `warehouses`, `materials`, optional `material_variants`; transactions link to `users` for posted_by / created_by.

### Dana (recycled granule / extrusion)

`dana_production_recipes`, `dana_production_recipe_lines`, `dana_batches`, inputs/operators/wastes, `dana_batch_inventory_links`, machine settings.

### Bag production

`bag_products`, `bag_product_variants`, `bag_bill_of_materials`, `bag_bom_lines`, `bag_production_orders`, `bag_production_batches`, consumptions, wastes, `bag_batch_inventory_links`, machine settings.

Configurable workflow states in `config/bag.php`: order statuses (`draft` → `released` → `in_progress` → `completed`); batch statuses through `posted` / `reversed` with explicit transitions.

### Purchases & sales

Full procure-to-pay and order-to-cash chains with ledger tables (`supplier_ledger_entries`, `customer_ledger_entries`).

### HR, payroll, accounting, website

As listed in migration grep; website tables are CMS/enquiry only.

**BagProject:** no tables. Logical entities mirror `src/types/erp.ts` only.

---

## 5. Workflow assessment

### 5.1 BagProject (prototype) — client rules in `ERPContext.tsx`

| Workflow | Status | Notes |
|----------|--------|-------|
| Purchase → stock | **Works in demo** | `createPurchaseBill` increases inventory |
| Production: raw consume → FG | **Works in demo** | Enforces NEW vs RECYCLED source category |
| Recycling: waste → recycled raw | **Works in demo** | Configurable output type via settings |
| Sales → stock out + khata | **Partial** | FG match by `productName` substring; no warehouse granularity |
| Stock transfer | **Broken/incomplete** | Deducts source only; does not add to destination warehouse row |
| Negative stock | **Partial guard** | Some checks; sales uses `Math.max(0, …)` masking negatives |
| Traceable movements | **UI only** | `stockMovements` array; lost on refresh |
| Order → production → QC → delivery | **Missing** | No sales orders, no QC, no dispatch entity |
| Auth / RBAC | **Missing** | Role picker does not gate views |

### 5.2 bagfactoryerp — server rules

| Workflow | Status | Notes |
|----------|--------|-------|
| Purchase PO → GRN post → stock | **Implemented** | Tested in `PurchaseWorkflowTest` |
| Dana batch post → inventory | **Implemented** | `DanaBatchWorkflowTest` |
| Bag order → batch → post FG/raw | **Implemented** | `BagBatchPostingService` validates mass balance, stock, machine capacity |
| Sales order → invoice post → stock + ledger | **Implemented** | `SalesWorkflowTest`; posting via `SalesInvoiceService` |
| Inventory ledger / reversal | **Implemented** | Posted transactions + reverse endpoints |
| QC operational module | **Missing** | QC exists only on public marketing site |
| Delivery / dispatch / challan | **Missing** | Invoice print exists; no `delivery_notes` or dispatch workflow |
| Accounting integration | **Optional** | `BAG_ACCOUNTING_INTEGRATION` env flag |

---

## 6. UI / workflow duplication and drift

1. **Two apps, one product name** — `bagfactory-erp` npm package vs Laravel `bagfactoryerp` folder.
2. **Recycling naming** — prototype “Recycling”; Laravel “Dana production” (same business lane).
3. **Units** — prototype uses **kg** everywhere; Laravel uses materials with UoM (bags, kg, etc.).
4. **Production granularity** — prototype one modal batch; Laravel orders, BOM versions, batch workflow states.
5. **Sidebar modules** — prototype includes khata, loans, documents; Laravel splits accounting/treasury and has no documents hub.
6. **Settings** — prototype master data UI; Laravel uses `/master-data/{resource}` CRUD.

---

## 7. Working vs partial vs broken (BagProject prototype)

| Area | Rating |
|------|--------|
| Dashboard, charts, exports | Working (demo) |
| Inventory list, modals, movements list | Working (demo) |
| Production / recycling modals | Working (demo) |
| Sales / purchases modals | Working (demo) |
| Khata, cash/bank, expenses | Working (demo) |
| Documents upload | **Partial** — list only, no upload |
| Users / RBAC settings | **Partial** — static UI |
| Salaries dedicated view | **Partial** — routed to same employee view |
| Stock transfer | **Broken** — destination stock not created |
| Persistence / multi-user | **Broken** — refresh resets all data |
| Login security | **Broken** — no real auth |

---

## 8. Top gaps vs Project context goals

1. **Wrong stack at assigned path** — Laravel ERP is not in `BagProject`; operational code is in `bagfactoryerp`.
2. **No persistent data or API in BagProject** — cannot run a factory on the prototype alone.
3. **QC module absent** in both operational codebases (required in context).
4. **Deliveries / dispatch** not modeled in Laravel; only narrative/PDF hints in prototype.
5. **Repository / deployment** — BagProject has no `.git`; Laravel app is separate; risk of continued UX/backend divergence.

---

## 9. Recommendations (audit-only)

1. Treat **`bagfactoryerp` as system of record** for migrations, posting rules, and permissions.
2. Use **BagProject** as a UX reference or future Next front-end only after API contract is defined—not as the Laravel path stated in context.
3. Update Project context to document **two-folder layout** until merge.
4. Prioritize **QC** and **delivery challan** as additive Laravel modules (see implementation plan).
5. Do not run `migrate:fresh` / `migrate:refresh` on any environment with business data (per constraints).

---

## 10. Files referenced

- `D:\laragon\www\BagProject\package.json`
- `D:\laragon\www\BagProject\src\context\ERPContext.tsx`
- `D:\laragon\www\BagProject\src\types\erp.ts`
- `D:\laragon\www\bagfactoryerp\routes\web.php`
- `D:\laragon\www\bagfactoryerp\database\migrations\*.php`
- `D:\laragon\www\bagfactoryerp\app\Services\Bag\BagBatchPostingService.php`
- `D:\laragon\www\bagfactoryerp\app\Services\Sales\SalesInvoiceService.php`