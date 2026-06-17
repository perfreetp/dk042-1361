import { cn } from '@/lib/utils';
import type { ArchiveStatus, AnomalyStatus } from '@/types';

export type StatusBadgeType = ArchiveStatus | AnomalyStatus;

const statusConfig: Record<StatusBadgeType, { label: string; className: string }> = {
  pending: {
    label: '待归档',
    className: 'bg-medical-warning-light text-medical-warning',
  },
  archived: {
    label: '已归档',
    className: 'bg-medical-success-light text-medical-success',
  },
  overdue: {
    label: '已超期',
    className: 'bg-medical-danger-light text-medical-danger',
  },
  anomaly: {
    label: '异常',
    className: 'bg-medical-danger-light text-medical-danger',
  },
  assigned: {
    label: '已指派',
    className: 'bg-medical-primary-light text-medical-primary',
  },
  rectifying: {
    label: '整改中',
    className: 'bg-medical-warning-light text-medical-warning',
  },
  reviewing: {
    label: '审核中',
    className: 'bg-medical-primary-light text-medical-primary',
  },
  closed: {
    label: '已关闭',
    className: 'bg-text-tertiary/10 text-text-secondary',
  },
  rejected: {
    label: '已驳回',
    className: 'bg-medical-danger-light text-medical-danger',
  },
};

export interface StatusBadgeProps {
  status: StatusBadgeType;
  customLabel?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export default function StatusBadge({
  status,
  customLabel,
  size = 'md',
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        config.className,
        className
      )}
    >
      {customLabel || config.label}
    </span>
  );
}
