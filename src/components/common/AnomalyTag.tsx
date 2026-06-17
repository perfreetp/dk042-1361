import { cn } from '@/lib/utils';
import type { AnomalyType } from '@/types';

const anomalyTypeConfig: Record<AnomalyType, { label: string; className: string }> = {
  overdue: {
    label: '归档超期',
    className: 'bg-medical-danger-light text-medical-danger border-medical-danger/20',
  },
  missing_items: {
    label: '资料缺失',
    className: 'bg-medical-warning-light text-medical-warning border-medical-warning/20',
  },
  patient_mismatch: {
    label: '患者信息不符',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  duplicate: {
    label: '重复归档',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
};

export interface AnomalyTagProps {
  type: AnomalyType;
  customLabel?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export default function AnomalyTag({
  type,
  customLabel,
  size = 'md',
  className,
}: AnomalyTagProps) {
  const config = anomalyTypeConfig[type] || {
    label: type,
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        config.className,
        className
      )}
    >
      {customLabel || config.label}
    </span>
  );
}
