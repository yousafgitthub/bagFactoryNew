# FoundryFlow ERP — Phase 3 Scope (Recycling Management)

**Status:** Implemented (mock/client state)  
**Authoritative spec:** `PHASE_3_REQUIREMENTS.md` (extract from Phase 3.docx)  
**Also archived:** Project store `docs/phase-3/Phase_3_1b52.docx`

## Objective

Deliver a complete **Recycling Management** module for the shopping-bag factory: waste plastic intake → batch processing → configurable recycled raw material output, with traceability, yield/loss, PKR costing, and **tight integration with Phase 2 inventory** (no separate inventory silo).

## In scope

| Area | Scope |
|------|--------|
| Navigation | Sidebar group **Recycling Management**: Overview, Batches, Create Batch, Inputs, Outputs, Processing Loss, Costs, Reports, Settings |
| Dashboard | KPIs (batches, waste in, recycled out, loss, yield, total cost, avg cost/kg), 4 charts, recent batches, quick actions |
| Batches | Draft / In Progress / Completed / Cancelled; list actions (view, start, complete, cancel); detail with costs, outputs, timeline, print/CSV |
| Create workflow | 6-step wizard + quick modal; waste-only input; multi-output lines; live loss/yield/cost; proportional cost allocation |
| Inventory | Draft = no stock change; start = waste deduct; complete = recycled output post + movements; cancel restores waste if started |
| Settings | Output types, machines, operators, batch number format, loss warning % |
| Data | Centralized `ERPContext` + `sampleData` / `recycling.ts`; REC-2026-0001 reference batch |
| Tests | `recyclingUtils` unit tests; existing `inventoryUtils` tests unchanged |

## Out of scope (Phase 4+)

- Production / manufacturing workflow expansion  
- External database, destructive migrations  
- Accounting journal entries  
- Phase 1 dashboard / login redesign  
- Phase 2 inventory module rewrite  

## Phase 1/2 protection

Inventory categories, receive/issue/transfer/adjust, warehouses, and dashboard remain as delivered in Phase 2. Recycling only adds views, types, context methods, and stock movement types already anticipated (`RECYCLING_CONSUME`, `RECYCLING_OUTPUT`).

## Assumptions / design notes

- **Stock reservation:** not present in Phase 2; **waste is deducted on “Start Processing”** (or atomically on quick-complete). Documented in completion report.
- **Completed batches** cannot be edited or re-completed; cancel applies only to Draft/In Progress.
- **`batchNumber`:** generated via `REC-YYYY-####` helper aligned with settings.

## Source reconciliation

Initial work used Downloads `Phase 3.docx`; scope was **reconciled** against the Project store extract (`PHASE_3_REQUIREMENTS.md`) before final implementation.