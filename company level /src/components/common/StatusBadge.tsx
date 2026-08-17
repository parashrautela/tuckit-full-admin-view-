/**
 * DEPRECATED SHIM — import from `@/components/ui/status-badge` instead.
 *
 * This file used to own a hand-rolled colour switch. That logic now lives in
 * the canonical `StatusBadge` (single source of truth: `STATUS_MAP`). This
 * adapter only preserves the legacy `size` prop so existing call sites keep
 * compiling; it will be removed once they migrate.
 */
import React from 'react';

import { StatusBadge as UiStatusBadge } from '@/components/ui/status-badge';

interface StatusBadgeProps {
  status: string;
  /** @deprecated Sizing is fixed by the design system. */
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm', pulse = false }) => (
  <UiStatusBadge
    status={status}
    pulse={pulse}
    className={size === 'md' ? 'px-2.5 py-1' : undefined}
  />
);
