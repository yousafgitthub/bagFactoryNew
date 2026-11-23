'use client';

import React from 'react';
import type { ProductionBatchStatus, ProductionPlanStatus, ProductionOrderStatus } from '../../../types/erp';
import { Badge } from '../../common/Badge';

const batchMap: Record<ProductionBatchStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'secondary' }> = {
  Draft: { label: 'Draft', variant: 'secondary' },
  'In Progress': { label: 'In Progress', variant: 'warning' },
  Completed: { label: 'Completed', variant: 'success' },
  Cancelled: { label: 'Cancelled', variant: 'danger' },
};

export function ProductionStatusBadge({ status }: { status: ProductionBatchStatus }) {
  const cfg = batchMap[status] || batchMap.Draft;
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function ProductionPlanStatusBadge({ status }: { status: ProductionPlanStatus }) {
  const variants: Record<string, 'success' | 'warning' | 'secondary' | 'danger'> = {
    Draft: 'secondary',
    Planned: 'secondary',
    Approved: 'success',
    'In Progress': 'warning',
    Completed: 'success',
    Cancelled: 'danger',
  };
  return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
}

export function ProductionOrderStatusBadge({ status }: { status: ProductionOrderStatus }) {
  const variants: Record<string, 'success' | 'warning' | 'secondary' | 'danger'> = {
    Draft: 'secondary',
    Approved: 'secondary',
    'In Progress': 'warning',
    Completed: 'success',
    Cancelled: 'danger',
  };
  return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
}