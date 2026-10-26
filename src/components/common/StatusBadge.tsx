import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getStyle = (s: string) => {
    const lower = s.toLowerCase();

    if (lower.includes('verified') || lower.includes('completed') || lower.includes('paid') || lower.includes('delivered') || lower.includes('in stock') || lower.includes('approved')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (lower.includes('pending') || lower.includes('scheduled') || lower.includes('order placed') || lower.includes('ordered') || lower.includes('investigation')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (lower.includes('low stock') || lower.includes('checked in') || lower.includes('processing') || lower.includes('in transit') || lower.includes('in consultation') || lower.includes('rescheduled')) {
      return 'bg-sky-50 text-sky-700 border-sky-200';
    }
    if (lower.includes('cancelled') || lower.includes('out of stock') || lower.includes('rejected') || lower.includes('refunded')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }

    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const dotColor = (s: string) => {
    const lower = s.toLowerCase();
    if (lower.includes('verified') || lower.includes('completed') || lower.includes('paid') || lower.includes('delivered') || lower.includes('in stock') || lower.includes('approved')) {
      return 'bg-emerald-500';
    }
    if (lower.includes('pending') || lower.includes('scheduled') || lower.includes('order placed') || lower.includes('ordered')) {
      return 'bg-amber-500';
    }
    if (lower.includes('low stock') || lower.includes('checked in') || lower.includes('processing') || lower.includes('in transit') || lower.includes('in consultation')) {
      return 'bg-sky-500';
    }
    if (lower.includes('cancelled') || lower.includes('out of stock') || lower.includes('rejected')) {
      return 'bg-rose-500';
    }
    return 'bg-slate-400';
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${getStyle(status)} ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor(status)}`} />
      {status}
    </span>
  );
};
