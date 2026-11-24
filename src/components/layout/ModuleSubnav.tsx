'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useERP, ActiveView } from '../../context/ERPContext';
import { moduleForView } from './navigation';

export function ModuleSubnav() {
  const { currentView, setCurrentView } = useERP();
  const module = moduleForView(currentView);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMoreOpen(false);
  }, [currentView]);

  useEffect(() => {
    if (!moreOpen) return;
    const close = (event: MouseEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [moreOpen]);

  if (!module || (module.primary.length + module.more.length) < 2) return null;

  const highlighted = module.activeAlias?.[currentView] ?? currentView;
  const moreActive = module.more.some((tab) => tab.id === highlighted);

  const go = (id: ActiveView) => {
    setMoreOpen(false);
    setCurrentView(id);
  };

  return (
    <div className="print:hidden -mt-2 mb-5 flex items-end gap-1 border-b border-slate-200">
      <div className="flex items-center gap-1 overflow-x-auto min-w-0">
      {module.primary.map((tab) => {
        const active = highlighted === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => go(tab.id)}
            className={`shrink-0 px-3 py-2.5 text-sm border-b-2 -mb-px transition-colors ${
              active
                ? 'border-[#2563EB] text-[#1E293B] font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
      </div>

      {module.more.length > 0 && (
        <div className="relative shrink-0" ref={moreRef}>
          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            className={`inline-flex items-center gap-1 px-3 py-2.5 text-sm border-b-2 -mb-px ${
              moreActive
                ? 'border-[#2563EB] text-[#1E293B] font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            More
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {moreOpen && (
            <div className="absolute left-0 top-full z-30 mt-1 min-w-[11rem] rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              {module.more.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => go(tab.id)}
                  className={`block w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                    highlighted === tab.id ? 'text-[#2563EB] font-semibold' : 'text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
