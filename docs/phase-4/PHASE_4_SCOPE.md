# FoundryFlow ERP — Phase 4 Scope (Production Management)

**Status:** Implemented (mock/client state)  
**Authoritative spec:** `PHASE_4_REQUIREMENTS.md` (Project store + repo mirror)  
**Reconciled:** Monday, 23 Nov 2026 (UTC+5)

## Objective

Deliver **Complete Production & Manufacturing Management** for the shopping-bag factory: planning, orders, batch lifecycle (draft → start → complete), strict single raw-material source per batch, costing/yield/loss, and **integrated Phase 2 inventory** consumption and finished-goods posting.

## In scope

| Area | Scope |
|------|--------|
| Navigation | Sidebar **Production Management** (12 pages per spec §3) |
| Overview | KPIs, 6 chart types, recent activity, quick actions (§4) |
| Planning | Plans with priority/status, stock availability, no inventory consume (§5) |
| Orders | CRUD-lite, approve, convert to batch, duplicate-active guard (§6) |
| Batch wizard | 8-step create flow, source mutual exclusion (§7) |
| Execution | Active / completed lists, detail view, timeline, movements (§8–10) |
| Sub-ledgers | Consumption, output, loss, costs, reports, settings (§11–16) |
| Sample data | `PROD-2026-0001` (NEW) + `PROD-2026-0002` (RECYCLED) (§17) |
| Tests | `productionUtils` unit tests; inventory + recycling tests unchanged |

## Out of scope (per spec)

- Sales, purchasing, accounting journals, external DB  
- Inventory / recycling module rewrites  

## Phase 1–3 protection

No changes to login/dashboard shell, inventory workflows, or recycling batch logic beyond shared `ERPContext` inventory arrays and movement types already used for production.

## Inventory integration (§9)

- **Draft:** no stock impact  
- **Start:** deduct raw material (`NEW_BRANDED` or `RECYCLED_RAW` only)  
- **Complete:** post saleable finished goods (rejected excluded); `PRODUCTION_CONSUME` / `PRODUCTION_OUTPUT` movements  
- **Cancel:** restore raw if started; reverse FG if posted  
- Demo completed batches flagged `rawStockDeducted` / `finishedStockPosted` so seed data does not double-post on load  

## Assumptions / limits

- No formal stock reservation table: **deduct on start** (same pattern documented for Phase 3 waste).  
- Machine-wise / operator-wise reports are batch-derived tables (not separate time-tracking).  
- Quick modal still provides one-step complete for dashboard shortcut.