import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

export interface TrendChartData {
  date: string;
  surgeryCount: number;
  archiveRate: number;
}

export interface TrendChartProps {
  data: TrendChartData[];
  height?: number;
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background-card rounded-lg shadow-card-hover border border-border-default p-3">
        <p className="text-sm font-medium text-text-primary mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 py-0.5">
            <span
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-text-secondary">
              {entry.name === 'surgeryCount' ? '手术台次' : '归档率'}
            </span>
            <span className="text-sm font-medium text-text-primary">
              {entry.name === 'archiveRate' ? `${entry.value}%` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function TrendChart({
  data,
  height = 320,
  className,
}: TrendChartProps) {
  return (
    <div
      className={cn(
        'bg-background-card rounded-xl p-5 shadow-card',
        className
      )}
    >
      <div className="mb-4">
        <h3 className="text-base font-semibold text-text-primary">手术与归档趋势</h3>
        <p className="text-sm text-text-tertiary mt-1">展示手术台次与归档率变化趋势</p>
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              label={{ value: '台次', position: 'insideTopLeft', style: { fontSize: 12, fill: '#9CA3AF' } }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              label={{ value: '归档率(%)', position: 'insideTopRight', style: { fontSize: 12, fill: '#9CA3AF' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              wrapperStyle={{ paddingTop: 16 }}
              formatter={(value) => (
                <span className="text-sm text-text-secondary">
                  {value === 'surgeryCount' ? '手术台次' : '归档率'}
                </span>
              )}
            />
            <Bar
              yAxisId="left"
              dataKey="surgeryCount"
              name="surgeryCount"
              fill="#1A73E8"
              radius={[4, 4, 0, 0]}
              barSize={32}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="archiveRate"
              name="archiveRate"
              stroke="#00897B"
              strokeWidth={2.5}
              dot={{ fill: '#00897B', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
