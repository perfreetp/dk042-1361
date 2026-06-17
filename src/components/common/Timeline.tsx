import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimelineItem {
  id: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  time: string;
  description?: string;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export default function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn('space-y-0', className)}>
      {items.map((item, index) => {
        const Icon = item.icon;
        const isLast = index === items.length - 1;
        return (
          <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-border-light" />
            )}
            <div
              className={cn(
                'relative z-10 flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0',
                item.iconBgColor || 'bg-medical-primary-light'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5',
                  item.iconColor || 'text-medical-primary'
                )}
              />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-medium text-text-primary truncate">
                  {item.title}
                </h4>
                <span className="text-xs text-text-tertiary flex-shrink-0">
                  {item.time}
                </span>
              </div>
              {item.description && (
                <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
