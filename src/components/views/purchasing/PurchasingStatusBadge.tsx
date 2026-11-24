'use client';

import React from 'react';
import { Badge } from '../../common/Badge';
import type { PurchaseDocumentStatus, PurchasePaymentStatus } from '../../../types/erp';

export function PurchaseDocStatusBadge({ status }: { status: PurchaseDocumentStatus }) {
  const variant =
    status === 'Received'
      ? 'success'
      : status === 'Partially Received'
        ? 'warning'
        : status === 'Cancelled'
          ? 'danger'
          : status === 'Draft'
            ? 'secondary'
            : 'new';
  return <Badge variant={variant}>{status}</Badge>;
}

export function PurchasePaymentBadge({ status }: { status: PurchasePaymentStatus }) {
  const variant =
    status === 'Paid' ? 'success' : status === 'Partial' ? 'warning' : status === 'Overdue' ? 'danger' : 'danger';
  return <Badge variant={variant}>{status}</Badge>;
}