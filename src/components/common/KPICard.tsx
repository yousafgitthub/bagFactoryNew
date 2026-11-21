import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  highlightColor?: 'blue' | 'green' | 'amber' | 'navy' | 'red';
  onClick?: () => void;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  highlightColor = 'blue',
  onClick,
}: KPICardProps) {
  const iconBgMap = {
    blue: 'bg-blue-50 text-[#2563EB]',
    green: 'bg-emerald-50 text-[#16A34A]',
    amber: 'bg-amber-50 text-[#F59E0B]',
    navy: 'bg-slate-100 text-[#142238]',
    red: 'bg-rose-50 text-[#DC2626]',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-card hover:shadow-card-hover transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-blue-300' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#64748B] tracking-wide uppercase">{title}</p>
          <h3 className="text-2xl font-bold text-[#1E293B] tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${iconBgMap[highlightColor]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3.5 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
          {trend ? (
            <div className="flex items-center gap-1 font-medium">
              <span
                className={`inline-flex items-center gap-0.5 ${
                  trend.isPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'
                }`}
              >
                {trend.isPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {trend.value}
              </span>
              <span className="text-[#64748B]">vs last period</span>
            </div>
          ) : (
            <span className="text-[#64748B]">{subtitle}</span>
          )}
          {subtitle && trend && <span className="text-[#64748B] truncate ml-2">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
