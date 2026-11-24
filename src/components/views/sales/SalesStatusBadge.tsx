'use client';

import { Badge } from '../../common/Badge';
import type { InvoiceStatus, SalesPaymentStatus } from '../../../types/erp';

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const variant =
    status === 'Completed' || status === 'Confirmed'
      ? 'success'
      : status === 'Draft'
        ? 'secondary'
        : status === 'Cancelled'
          ? 'danger'
          : 'warning';
  return <Badge variant={variant}>{status}</Badge>;
}

export function SalesPaymentBadge({ status }: { status: SalesPaymentStatus }) {
  const variant =
    status === 'Paid' ? 'success' : status === 'Partial' ? 'warning' : status === 'Overdue' ? 'danger' : 'secondary';
  return <Badge variant={variant}>{status}</Badge>;
}