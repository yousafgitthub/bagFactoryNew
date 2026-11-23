'use client';

import React from 'react';

interface RecyclingPageShellProps {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function RecyclingPageShell({ title, subtitle, actions, children }: RecyclingPageShellProps) {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B] tracking-tight">{title}</h2>
          <p className="text-xs text-[#64748B] max-w-2xl">{subtitle}</p>
        </div>
        {actions ? <div className="flex items-center gap-2 flex-wrap">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}