'use client';

import React from 'react';
import { Badge } from '../../common/Badge';
import type { RecyclingBatchStatus } from '../../../types/erp';

export function RecyclingStatusBadge({ status }: { status: RecyclingBatchStatus }) {
  switch (status) {
    case 'Completed':
      return <Badge variant="success">{status}</Badge>;
    case 'In Progress':
      return <Badge variant="warning">{status}</Badge>;
    case 'Draft':
      return <Badge variant="secondary">Draft</Badge>;
    case 'Cancelled':
      return <Badge variant="danger">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}