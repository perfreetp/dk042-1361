import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

export interface PieChartDataItem {
  name: string;
  value: number;
  color: string;
}

export interface PieChartProps {
  data: PieChartDataItem[];
  title?: string;
  subtitle?: string;
  centerLabel?: string;
  height?: number;
  className?: string;
}

const DEFAULT_COLORS = ['#1A73E8', '#00897B', '#E65100', '#C62828', '#7B61FF'];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: PieChartDataItem }> }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-background-card rounded-lg shadow-card-hover border border-border-default p-3">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-sm font-medium text-text-primary">{item.name}</span>
          <span className="text-sm font-bold text-text-primary ml-auto">{item.value}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function PieChart({
  data,
  title,
  subtitle,
  centerLabel = '总数',
  height = 280,
  className,
}: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const chartData = data.map((item, index) => ({
    ...item,
    color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#FFFFFF"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div
      className={cn(
        'bg-background-card rounded-xl p-5 shadow-card',
        className
      )}
    >
      {(title || subtitle) && (
        <div className="mb-2">
          {title && (
            <h3 className="text-base font-semibold text-text-primary">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-text-tertiary mt-1">{subtitle}</p>
          )}
        </div>
      )}
      <div style={{ height }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              label={renderCustomLabel}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-text-secondary">{value}</span>
              )}
            />
          </RechartsPieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '-10px' }}>
          <span className="text-sm text-text-tertiary">{centerLabel}</span>
          <span className="text-2xl font-bold text-text-primary mt-1">{total}</span>
        </div>
      </div>
    </div>
  );
}
