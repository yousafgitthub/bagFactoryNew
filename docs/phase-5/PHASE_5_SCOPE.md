# FoundryFlow ERP — Phase 5 Scope (Sales & Invoicing)

**Status:** Implemented (mock / client state)  
**Spec:** `PHASE_5_REQUIREMENTS.md` (Project store)  
**Reconciled:** Tuesday, 24 Nov 2026 (UTC+5)

## Objective

Deliver **Complete Sales & Invoicing Management** for the shopping-bag factory: invoice lifecycle (draft → confirm → cancel), FG stock integration (single deduct), customer payments, returns with inspection, receivables, reports, and settings — PKR and kg only.

## Phase 1–4 audit (prerequisites)

| Prerequisite | Finding |
|--------------|---------|
| Finished goods inventory | `FINISHED_GOODS` items for ABHA / Crystal × White / Black (+ staging) in `sampleData` |
| Customers | Shared `Customer` module — reused, not duplicated |
| Stock movements | Extended with `SALES_DISPATCH`, `SALES_RETURN`, `SALES_CANCEL_RESTORE` |
| Prior sales hook | Legacy `createSalesInvoice` immediately deducted FG — refactored to draft/confirm |

## In scope

| Area | Deliverable |
|------|-------------|
| Navigation | **Sales Management** — 8 sidebar pages |
| Overview | KPIs, charts, recent invoices/payments/returns |
| Invoices | Draft save, confirm (stock once), cancel (restore), detail/print/PDF |
| Payments | Invoice-scoped payments, duplicate ref guard |
| Returns | Status workflow; saleable restock only |
| Reports | 10 report lenses + CSV export |
| Settings | Prefix/sequence, terms, tax off by default, factory footer |
| Utils | `src/sales/salesUtils.ts`, `src/sales/salesStock.ts` |
| Demo data | Paid, partial, unpaid, overdue, draft, return sample |
| Tests | `npm run test:sales` + Phases 2–4 tests unchanged |

## Out of scope

Phase 6 purchasing, full Khata rewrite, double-entry GL, external database.

## FG rules

- **Draft:** no stock change  
- **Confirm:** validate FG only, deduct once, `stockDeducted` flag  
- **Cancel:** restore if deducted  
- No sales of raw / waste / recycled through sales workflow