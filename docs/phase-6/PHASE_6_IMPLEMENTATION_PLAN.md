# Phase 6 — Implementation Plan

1. **Types** — Extended `src/types/erp.ts` with `PurchaseOrder`, receipts, payments, returns, settings, supplier fields.
2. **Domain** — `src/purchasing/purchasingUtils.ts`, `purchasingStock.ts`, `src/context/purchasingActions.ts`.
3. **Data** — `src/data/purchasing.ts` seeded from legacy bills + partial receipt / spare parts / draft samples.
4. **State** — `ERPContext` purchase collections, handlers, derived `purchaseBills` for backward compatibility.
5. **UI** — `src/components/views/purchasing/*` wired via `AppShell`, `Sidebar`, `Topbar`.
6. **Tests** — `npm run test:purchasing` alongside Phases 2–5 scripts.
7. **Docs** — Scope, plan, completion report under `docs/phase-6/`.