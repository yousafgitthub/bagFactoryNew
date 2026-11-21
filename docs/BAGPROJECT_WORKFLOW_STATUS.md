# BagProject — workflow status matrix

**Legend:** ✅ Pass (implemented & consistent) · ⚠️ Partial · ❌ Missing · 🔶 Prototype-only (in-memory, no persistence)

Rows follow Project context end-to-end expectations. Columns: **Prototype** (`BagProject`) vs **Laravel** (`bagfactoryerp`).

---

## Core manufacturing & inventory

| Workflow step | Prototype | Laravel | Business rule alignment |
|---------------|-----------|---------|-------------------------|
| Define products / variants | 🔶 UI mock in Settings | ✅ `bag_products`, variants | Laravel authoritative |
| Define raw materials | 🔶 Inventory categories | ✅ `materials`, categories, buckets | Laravel authoritative |
| Purchase order created | ❌ Direct purchase bill only | ✅ `purchase_orders` | ⚠️ Prototype skips PO |
| Goods receipt → raw stock | ⚠️ Bill creates stock | ✅ GRN post → inventory | ✅ Laravel |
| Traceable stock movements | 🔶 `stockMovements` array | ✅ `inventory_ledger_entries` | ❌ Prototype not durable |
| Prevent negative stock | ⚠️ Some checks | ✅ Posting service exceptions | ✅ Laravel |
| Prevent duplicate deductions | ⚠️ No concurrency | ✅ DB transactions, post guards | ✅ Laravel |
| Inter-warehouse transfer | 🔶 Broken (no dest increment) | ✅ `stock_transfers` + posting | ❌ Prototype |
| Dana / recycling batch | 🔶 `createRecyclingBatch` | ✅ `dana_batches` + post | ✅ Laravel (different UX label) |
| Production batch consume raw | 🔶 `createProductionBatch` | ✅ `bag_production_batches` | ✅ Laravel richer |
| Configurable production stages | ❌ Single step | ⚠️ Order + batch status machine | ⚠️ Not user-defined stages table |
| FG stock from production | 🔶 Merges by name | ✅ Posted FG via inventory links | ✅ Laravel |
| QC hold / release before FG | ❌ | ❌ | ❌ Required gap |
| Sales order | ❌ Invoice only | ✅ `sales_orders` | ⚠️ Prototype |
| Production linked to sales order | ❌ | ⚠️ Manual coordination | ❌ Gap |
| Sales invoice → FG deduction | 🔶 Name match on FG | ✅ Posted invoice lines | ✅ Laravel |
| Customer ledger (khata) | 🔶 In-memory khata | ✅ `customer_ledger_entries` | ✅ Laravel |
| Supplier ledger | 🔶 In supplier entity | ✅ `supplier_ledger_entries` | ✅ Laravel |
| Delivery / dispatch / challan | ⚠️ PDF text only | ❌ No dispatch entity | ❌ Required gap |
| Delivery confirms shipment | ❌ | ❌ | ❌ |

---

## Supporting modules

| Module workflow | Prototype | Laravel |
|-----------------|-----------|---------|
| Dashboard KPIs | 🔶 | ✅ |
| Reports / analytics | 🔶 Charts + export | ✅ ERP reports hub + CSV |
| Expenses | 🔶 | ✅ |
| Cash / bank / treasury | 🔶 | ✅ `treasury_accounts` |
| Company loans | 🔶 | ✅ |
| Employee / payroll | 🔶 | ✅ Full payroll runs |
| Documents repository | ⚠️ List only | ❌ Not in ERP sidebar |
| User roles enforced | ❌ | ✅ Spatie permissions |
| Public marketing website | ❌ | ✅ `routes/website.php` |

---

## End-to-end paths (summary)

| End-to-end path | Prototype | Laravel |
|-----------------|-----------|---------|
| **Purchase → stock** | ⚠️ (bill shortcut) | ✅ |
| **Order → production → QC → FG → delivery** | ❌ | ⚠️ (missing QC + delivery) |
| **Invoice → stock out → customer balance** | 🔶 | ✅ |
| **Recycling → recycled raw → bag production** | 🔶 | ✅ (dana → materials → bag batch) |

---

## Test coverage signal (Laravel only)

Feature tests exist for: inventory posting, Dana batch workflow, bag batch workflow, purchase workflow, sales workflow, payroll, accounting, reports reconciliation, ERP navigation/authorization.

No automated tests in BagProject (no test script beyond `next lint`).