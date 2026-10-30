import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { TiltCard3D } from './TiltCard3D';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  iconBgColor?: string;
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  iconBgColor = 'bg-teal-50 text-teal-600',
  badge,
}) => {
  return (
    <TiltCard3D maxTilt={6} scale={1.02} className="rounded-2xl">
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3d-card hover:shadow-3d-float transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="transform-style-3d">
            <div className="flex items-center gap-2 translate-z-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {title}
              </span>
              {badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-50 text-teal-700 border border-teal-200 shadow-sm">
                  {badge}
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 tracking-tight translate-z-20">{value}</div>
          </div>
          <div className={`p-3 rounded-xl shadow-sm ${iconBgColor} translate-z-30 transition-transform duration-300 hover:scale-110`}>
            {icon}
          </div>
        </div>

        {(subtitle || trend) && (
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-50 translate-z-10">
            {subtitle && <span>{subtitle}</span>}
            {trend && (
              <span
                className={`inline-flex items-center font-medium ${
                  trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {trend.isPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                )}
                {trend.value}
              </span>
            )}
          </div>
        )}
      </div>
    </TiltCard3D>
  );
};
