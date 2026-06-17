import { ArrowUp, ArrowDown, type LucideIcon } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

export interface KPICardProps {
  title: string;
  value: number | string;
  suffix?: string;
  trend?: number;
  trendLabel?: string;
  sparklineData?: Array<{ value: number }>;
  icon?: LucideIcon;
  iconColor?: string;
  valueColor?: string;
  className?: string;
}

export default function KPICard({
  title,
  value,
  suffix,
  trend,
  trendLabel = '环比',
  sparklineData,
  icon: Icon,
  iconColor = 'text-medical-primary',
  valueColor = 'text-text-primary',
  className,
}: KPICardProps) {
  const isPositive = (trend ?? 0) >= 0;

  return (
    <div
      className={cn(
        'group relative bg-background-card rounded-xl p-5 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-text-secondary font-medium">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={cn('text-3xl font-bold tracking-tight', valueColor)}>
              {value}
            </span>
            {suffix && (
              <span className="text-sm text-text-tertiary">{suffix}</span>
            )}
          </div>
          {trend !== undefined && (
            <div className="mt-2 flex items-center gap-1.5">
              {isPositive ? (
                <ArrowUp className="w-4 h-4 text-medical-success" />
              ) : (
                <ArrowDown className="w-4 h-4 text-medical-danger" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  isPositive ? 'text-medical-success' : 'text-medical-danger'
                )}
              >
                {Math.abs(trend)}%
              </span>
              <span className="text-sm text-text-tertiary">{trendLabel}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'flex items-center justify-center w-11 h-11 rounded-lg bg-opacity-10',
              iconColor
            )}
            style={{ backgroundColor: 'currentColor', opacity: 0.1 }}
          >
            <Icon className={cn('w-6 h-6', iconColor)} />
          </div>
        )}
      </div>
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-4 h-12 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={isPositive ? '#00897B' : '#C62828'}
                strokeWidth={2}
                dot={false}
                fill="none"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
