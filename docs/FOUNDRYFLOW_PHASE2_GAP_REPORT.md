# FoundryFlow ERP — Phase 2 Gap Report

**Audited codebase:** `D:\laragon\www\BagProject`  
**Spec reference:** `Phase 2.docx` (sections 3–24) — *source file not present on this machine* (`/home/ubuntu/.cursor/projects/agent/uploads/Phase_2_8748.docx`). Requirements below are reconciled from Project store `internal/phase2-docx-gap-check.md`, Phase 2 kickoff, user-assigned extended checklist, and inspection of `src/`.  
**Audit date:** 2026-11-20  
**Mode:** Read-only (no code changes)

Canonical Project store copy: `C:\Users\hp\AppData\Local\Cursor\AgentStores\cursor_agent_stores\bc-ea672566-ee80-48bc-becb-b0a19a83baac\files\docs\FOUNDRYFLOW_PHASE2_GAP_REPORT.md`

---

## Executive summary

| Metric | Count |
|--------|------:|
| **Met** | 38 |
| **Partial** | 22 |
| **Missing** | 11 |
| **Total requirements checked** | 71 |

Phase 2 delivers a coherent **11-page inventory module** with shared state, weighted-average receive, fixed inter-warehouse transfers, adjustments, movement ledger, warehouses, reports CSV, and settings. Largest gaps vs the master doc: **no wired “All Inventory” or “Low Stock Alerts” routes**, **no dedicated Issue Stock workflow**, **warehouse activate/deactivate UI**, **thin reports/charts**, **category detail transfer/adjust actions broken**, and **legacy modal warehouse list omitting the fifth store**.

---

## Priority fixes (top 10)

1. **Wire or restore “All Inventory”** — implement `inv-all` (or route legacy `InventoryOverviewView`) in `AppShell.tsx` / `Sidebar.tsx`.
2. **Dedicated Low Stock Alerts page** — KPI/badge only today; add filterable alert table with reorder gap and quick actions.
3. **Issue Stock workflow** — no `issueStock` / Issue modal or page.
4. **Warehouse activate / deactivate** — `InvWarehousesView.tsx` is read-only.
5. **Fix category detail modal actions** — `CategoryStockView.tsx` no-op `onOpenAdjust` / `onOpenTransfer`.
6. **Align transfer modals with five warehouses** — `StockTransferModal.tsx` missing **Dispatch Staging E**.
7. **Movement ledger columns** — add operator, unit cost, notes to `InvMovementsView.tsx`.
8. **Inventory reports breadth** — expand `InvReportsView.tsx` exports and charts.
9. **Overview analytics** — add charts to `InvOverviewView.tsx`.
10. **Settings reorder propagation** — recompute existing SKU `reorderLevelKg` on save.

**Obvious 1-line bugs (note only):** `CategoryStockView.tsx` lines 128–129 — transfer/adjust callbacks are stubs; `StockTransferModal.tsx` — fifth warehouse missing from `<select>`.

---

## Requirement matrix

### §3 — Module structure & navigation

| Requirement | Status | Evidence (file / route) |
|-------------|--------|-------------------------|
| Inventory section in sidebar under INVENTORY MANAGEMENT | Met | `src/components/layout/Sidebar.tsx` |
| Doc §3: Inventory Overview | Partial | `inv-overview` → `InvOverviewView.tsx` |
| Doc §3: All Inventory | Missing | `InventoryOverviewView.tsx` not in `AppShell.tsx` |
| Doc §3: New Raw Material page | Met | `inv-new-raw` → `InvNewRawView.tsx` |
| Doc §3: Waste Plastic page | Met | `inv-waste` → `InvWasteView.tsx` |
| Doc §3: Recycled Material page | Met | `inv-recycled` → `InvRecycledView.tsx` |
| Doc §3: Finished Goods page | Met | `inv-finished` → `InvFinishedView.tsx` |
| Doc §3: Stock Movements | Partial | `inv-movements` → `InvMovementsView.tsx` |
| Doc §3: Low Stock Alerts | Missing | No page; badges in `Topbar.tsx` / hub only |
| Doc §3: Warehouse Management | Met | `inv-warehouses` → `InvWarehousesView.tsx` |
| Extended: Inventory Reports | Met | `inv-reports` → `InvReportsView.tsx` |
| Extended: Inventory Settings | Met | `inv-settings` → `InvSettingsView.tsx` |
| Receive / Transfer / Adjustment pages | Met | `inv-receive`, `inv-transfer`, `inv-adjustments` |
| Legacy `inventory` alias → hub | Met | `AppShell.tsx` |

### §4 — Inventory overview / hub

| Requirement | Status | Evidence |
|-------------|--------|----------|
| KPIs: total kg, valuation, alerts, movement count | Met | `InvOverviewView.tsx` |
| Category summary cards with navigation | Met | `InvOverviewView.tsx` |
| Warehouse utilization by store | Met | `InvOverviewView.tsx` |
| Charts (valuation / movement trends) | Missing | No Recharts under `views/inventory/` |
| Quick link to receive | Met | Hub CTA |
| Dashboard inventory KPIs live | Met | `DashboardView.tsx` |

### §5 — All Inventory (unified catalog)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Single table across all categories | Missing | Unwired `InventoryOverviewView.tsx` |
| Category / warehouse / status filters + search | Partial | Legacy view only; WH-E omitted in legacy warehouse filter |
| Full column set + actions | Partial | Legacy table only |
| Pagination on filtered data | Partial | `InventoryDataTable.tsx` on category pages; not on legacy all view |
| CSV export full stock | Met | `exportInventoryStockCSV`, table exports |

### §6–9 — Category stock pages

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Isolated ledger per category (kg, PKR) | Met | `CategoryStockView.tsx` |
| Category KPIs + warehouse/status filters | Met | `useCategoryInventory.ts` |
| Standard table columns | Met | `CategoryStockView.tsx` |
| FG brand/color filters | Partial | No ABHA/Crystal filter |
| Material detail + transfer/adjust from detail | Partial | `InventoryDetailModal.tsx`; category callbacks broken |
| Pagination + CSV | Met | `InventoryDataTable.tsx` |

### §10 — Receive stock

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Receive form fields | Met | `InvReceiveView.tsx` |
| Weighted-average merge | Met | `inventoryUtils.ts`, `ERPContext.receiveStock` |
| Active warehouses only | Met | `InvReceiveView.tsx` |
| Movement IN + unit tests | Met | Context + `inventoryUtils.test.ts` |
| Validation UX | Partial | Silent fail on invalid submit |

### §11 — Issue stock

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Issue Stock page/modal/workflow | Missing | No `issueStock`; sales `OUT` only |

### §12 — Transfer

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Form + destination merge + history | Met | `InvTransferView.tsx`, `applyTransfer` |
| Modal from detail lists all warehouses | Partial | `StockTransferModal.tsx` — 4 of 5 WH |

### §13 — Adjustments

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Form + history + movement | Met | `InvAdjustmentsView.tsx`, `adjustStock` |

### §14 — Movement ledger

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Types + filter + core columns | Met | `InvMovementsView.tsx` |
| Operator, unit cost/kg, notes columns | Missing | Omitted from ledger table |
| Date range filter | Missing | — |
| Pagination + CSV | Met | `InventoryDataTable.tsx` |

### §15 — Low stock alerts

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Dedicated alerts page | Missing | — |
| Aggregated alert UX elsewhere | Partial | Hub, sidebar badge, topbar |

### §16 — Warehouses

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Five stores + live load table | Met | `warehouses.ts`, `InvWarehousesView.tsx` |
| Activate / deactivate | Missing | No toggle UI |

### §17 — Reports

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Category valuation + stock CSV | Met | `InvReportsView.tsx` |
| Extended report types / charts | Missing / Partial | Reports hub minimal |

### §18 — Settings

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Brands, colors, reorder defaults | Met | `InvSettingsView.tsx` |
| Reorder apply to existing lines | Missing | Settings save only affects new receives |

### §19–24 — Architecture, sample data, tests

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Typed mock data + `ERPContext` + utils | Met | `data/inventory/`, `inventoryUtils.ts` |
| Integration with purchase/production/sales/recycling | Met | `ERPContext.tsx` |
| Sample data across categories/warehouses | Met | `INITIAL_INVENTORY` (11 lines) |
| Key validations + inventory unit test | Met | Context guards + `test:inventory` |
| Build/typecheck | Met | Completion report |
| Lint / persistence | Partial / Missing | No ESLint config; in-memory only |

---

## Spec §3 nav vs code

| Spec | Route | Status |
|------|-------|--------|
| Inventory Overview | `inv-overview` | Partial |
| All Inventory | — | Missing |
| Four category pages | `inv-new-raw` … `inv-finished` | Met |
| Stock Movements | `inv-movements` | Partial |
| Low Stock Alerts | — | Missing |
| Warehouses | `inv-warehouses` | Partial |
| Reports / Settings (ext.) | `inv-reports`, `inv-settings` | Partial |

**Extra nav (workflows):** Receive, Transfers, Adjustments — Met.

---

*Read-only audit. Reconcile against full `Phase_2_8748.docx` when uploaded to Context.*

---

## Post-remediation (2026-11-20)

Priority 10 items implemented. See **`FOUNDRYFLOW_PHASE2_REMEDIATION.md`**. Routes: `inv-all`, `inv-low-stock`, `inv-issue`. Context: `issueStock`, `setWarehouseStatus`, reorder propagation, inactive warehouse guards on receive/transfer.