# Phase 6 — Purchase & Supplier Management (Scope)

## In scope

- Purchase Management sidebar module (overview, list, create, GRN, returns, payments, payables, reports, settings)
- Supplier management (list, add/edit, detail, statement)
- Purchase orders with multi-line items, draft vs ordered vs received states
- Goods receiving with partial receipts and Phase 2 weighted-average inventory posting
- Supplier payments tied to purchase invoices
- Purchase returns with stock-out and payable credit
- Pakistani demo data (PKR/kg), sample suppliers and transactions
- Legacy quick purchase modal preserved for top-bar workflow

## Out of scope

- Full double-entry accounting / GL
- Phase 7 customer–supplier Khata as full accounting
- External database or FBR tax integration
- Purchasing recycled material without explicit workflow gate (blocked in validation)

## Integration points

- Phase 2: `applyReceiveToInventory`, `weightedAverageUnitCost`, stock movements `PURCHASE_RECEIVE` / `PURCHASE_RETURN`
- Phase 5: unchanged; supplier payments do not affect customer receivables