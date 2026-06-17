import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';

export interface BarChartDataItem {
  name: string;
  value: number;
}

export interface BarChartProps {
  data: BarChartDataItem[];
  title?: string;
  subtitle?: string;
  gradientStart?: string;
  gradientEnd?: string;
  valueFormatter?: (value: number) => string;
  height?: number;
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background-card rounded-lg shadow-card-hover border border-border-default p-3">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-sm font-bold text-medical-primary mt-1">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function BarChart({
  data,
  title,
  subtitle,
  gradientStart = '#1A73E8',
  gradientEnd = '#7B61FF',
  valueFormatter,
  height = 320,
  className,
}: BarChartProps) {
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  const maxValue = Math.max(...sortedData.map((d) => d.value));

  return (
    <div
      className={cn(
        'bg-background-card rounded-xl p-5 shadow-card',
        className
      )}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-base font-semibold text-text-primary">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-text-tertiary mt-1">{subtitle}</p>
          )}
        </div>
      )}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={gradientStart} />
                <stop offset="100%" stopColor={gradientEnd} />
              </linearGradient>
            </defs>
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              domain={[0, maxValue * 1.1]}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: '#4B5563' }}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5F7FA' }} />
            <Bar
              dataKey="value"
              barSize={24}
              radius={[0, 4, 4, 0]}
              label={{
                position: 'right',
                fill: '#4B5563',
                fontSize: 12,
                formatter: valueFormatter,
              }}
            >
              {sortedData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill="url(#barGradient)"
                  fillOpacity={1 - index * 0.06}
                />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
