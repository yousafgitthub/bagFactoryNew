# Phase 4 — Implementation Plan

**Spec source:** `PHASE_4_REQUIREMENTS.md`  
**Repo:** `D:\laragon\www\BagProject`

## 1. Types & data

- Extend `src/types/erp.ts`: `ProductionPlan`, `ProductionOrder`, `ProductionSettings`, full `ProductionBatch` with timeline/flags/cost lines  
- `src/data/production.ts`: settings, machines, operators, seed plans/orders  
- Enrich `INITIAL_PRODUCTION_BATCHES` in `sampleData.ts`

## 2. Domain logic

- `src/production/productionUtils.ts` — yield/loss/cost, validation, KPIs, numbering  
- `src/production/productionStock.ts` — deduct/restore raw, post FG, movements  

## 3. State (`ERPContext`)

- Plans, orders, settings collections  
- `saveProductionBatchDraft`, `startProductionBatch`, `completeProductionBatch`, `completeProductionFromInput`, `cancelProductionBatch`  
- Plan/order CRUD + convert helpers  

## 4. UI (`src/components/views/production/`)

| View | Spec |
|------|------|
| `ProductionOverviewView` | §4 |
| `ProductionPlanningView` | §5 |
| `ProductionOrdersView` | §6 |
| `ProductionCreateBatchView` | §7 |
| `ProductionListViews` | §8 (active/completed) |
| `ProductionHistoryViews` | §11–15 |
| `ProductionBatchDetailView` | §10 |
| `ProductionSettingsView` | §16 |

## 5. Wiring

- `Sidebar.tsx`, `AppShell.tsx`, `Topbar.tsx` — routes & breadcrumbs  
- `CreateProductionBatchModal` — uses atomic complete path  

## 6. Verification

```bash
npm run typecheck
npm run test:inventory
npm run test:recycling
npm run test:production
npm run build
```

## 7. Deliverables

- Repo: `docs/phase-4/*`  
- Store mirror: `/cursor/stores/self/docs/phase-4/`