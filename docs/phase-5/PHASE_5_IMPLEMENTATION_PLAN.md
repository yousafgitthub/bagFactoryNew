# Phase 5 — Implementation Plan

## Architecture

```
src/sales/salesUtils.ts      — totals, payment/overdue status, invoice #, validation
src/sales/salesStock.ts      — FG resolve, deduct/restore, return restock, movements
src/data/sales.ts            — DEFAULT_SALES_SETTINGS, seed payments/returns
src/context/ERPContext.tsx   — draft/confirm/cancel, payments, returns, settings
src/components/views/sales/* — 8 UI pages + status badges
```

## ERPContext API (new)

- `saveSalesInvoiceDraft` / `updateSalesInvoiceDraft`
- `confirmSalesInvoice` / `cancelSalesInvoice`
- `recordInvoicePayment`
- `saveSalesReturn` / `updateSalesReturnStatus` / `completeSalesReturn`
- `updateSalesSettings`
- `createSalesInvoice` — quick path: draft + confirm (dashboard modal)

## UI routes (`ActiveView`)

`sales`, `sales-all`, `sales-create`, `sales-returns`, `sales-payments`, `sales-outstanding`, `sales-reports`, `sales-settings`, `sales-invoice-detail`

## Testing matrix (§5 mandatory)

| # | Scenario | Verification |
|---|----------|--------------|
| 1 | Draft invoice | `stockDeducted === false`; no `SALES_DISPATCH` movement |
| 2 | Confirm | FG `availableKg` decreases; one movement set |
| 3 | Oversell | `validateSaleLines` rejects |
| 4 | Full payment | `paymentStatus === Paid` |
| 5 | Partial payment | `Partial` + outstanding |
| 6 | Overdue | `dueDate` past → `Overdue` |
| 7 | Print/PDF | Invoice detail actions |
| 8 | Return limits | `validateReturnQuantity` |
| 9 | Saleable return | `postSaleableReturnStock` |
| 10 | Damaged return | `condition !== Saleable` — no FG movement |
| 11 | Reports | `SalesReportsView` from transactions |
| 12 | No double deduct | `stockDeducted` + confirm guard |

Automated: `src/sales/__tests__/salesUtils.test.ts` covers totals, overdue, FG validation, deduct math.

## Rollout

1. Types + utils + stock helpers  
2. Context lifecycle + seed migration  
3. Views + sidebar/shell  
4. Docs + tests + build  
5. Push `main`