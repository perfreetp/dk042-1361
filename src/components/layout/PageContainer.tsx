import type { ReactNode } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageContainerProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function PageContainer({
  children,
  title,
  subtitle,
  breadcrumbs,
  actions,
  className,
  contentClassName,
}: PageContainerProps) {
  return (
    <div className={cn('flex-1 flex flex-col min-h-0', className)}>
      <div className="bg-white border-b border-border-default px-6 py-4">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-sm text-text-tertiary mb-3">
            <Home className="w-3.5 h-3.5" />
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center gap-1">
                <ChevronRight className="w-3.5 h-3.5 text-text-tertiary" />
                {item.href ? (
                  <a
                    href={item.href}
                    className={cn(
                      'hover:text-medical-primary transition-colors',
                      index === breadcrumbs.length - 1 && 'text-text-primary font-medium'
                    )}
                  >
                    {item.label}
                  </a>
                ) : (
                  <span
                    className={cn(
                      index === breadcrumbs.length - 1 && 'text-text-primary font-medium'
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </div>
            ))}
          </nav>
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
            {subtitle && (
              <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>

      <div className={cn('flex-1 overflow-y-auto p-6 bg-background-page', contentClassName)}>
        {children}
      </div>
    </div>
  );
}
