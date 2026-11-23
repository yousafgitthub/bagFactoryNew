# Phase 3 Implementation Plan — Recycling Management

Aligned to `PHASE_3_REQUIREMENTS.md` (Phase 3.docx extract).

## 1. Audit (Phase 1/2 baseline)

- **Stack:** Next.js 14, React 18, Tailwind, Recharts, centralized `ERPContext` mock state.
- **Phase 2:** `InventoryItem`, warehouses, movements, category split (`WASTE_PLASTIC`, `RECYCLED_RAW`, etc.).
- **Pre-Phase 3 recycling:** single Overview + modal completing batches immediately (no lifecycle).

## 2. Type & data layer

| File | Purpose |
|------|---------|
| `src/types/erp.ts` | `RecyclingBatchStatus`, `RecyclingOutputLine`, timeline, machines, operators, settings |
| `src/data/recycling.ts` | Default machines, operators, `RecyclingSettings` |
| `src/data/sampleData.ts` | Expanded `INITIAL_RECYCLING_BATCHES` incl. REC-2026-0001, draft, in-progress |
| `src/recycling/recyclingUtils.ts` | Metrics, allocation, validation, batch numbers, KPI aggregates |
| `src/recycling/recyclingStock.ts` | Waste deduct/restore, output post, movements |

## 3. Context operations (`ERPContext.tsx`)

- `saveRecyclingBatchDraft` / `updateRecyclingBatchDraft`
- `startRecyclingBatch` (waste deduct)
- `completeRecyclingBatch` (output post + movements)
- `cancelRecyclingBatch` (restore waste when applicable)
- `createRecyclingBatch` (quick complete from modal)
- Settings CRUD hooks for types, machines, operators

## 4. UI routes (`ActiveView` + `AppShell`)

| View ID | Component |
|---------|-----------|
| `recycling` | `RecyclingOverviewView` |
| `recycling-batches` | `RecyclingBatchesView` |
| `recycling-create` | `RecyclingCreateBatchView` |
| `recycling-batch-detail` | `RecyclingBatchDetailView` |
| `recycling-inputs` | `RecyclingInputsView` |
| `recycling-outputs` | `RecyclingOutputsView` |
| `recycling-loss` | `RecyclingLossView` |
| `recycling-costs` | `RecyclingCostsView` |
| `recycling-reports` | `RecyclingReportsView` |
| `recycling-settings` | `RecyclingSettingsView` |

Sidebar group **RECYCLING MANAGEMENT** wires all entries; Topbar titles/breadcrumbs updated.

## 5. Validations (from spec §20)

Enforced in `validateOutputAgainstInput`, `buildBatchFromForm`, and batch transition guards (waste category, qty limits, no double complete, no negative loss).

## 6. Testing & release

```bash
npm run typecheck
npm run test:inventory
npm run test:recycling
npm run build
```

Manual: draft → start → complete on REC-2026-0044 draft; quick modal from dashboard; verify waste/recycled inventory and movement ledger.

## 7. Deliverables

- This plan + `PHASE_3_SCOPE.md` + `PHASE_3_COMPLETION_REPORT.md`
- Store copies under Project Agent Store `docs/phase-3/`