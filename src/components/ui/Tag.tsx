import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import React from 'react'

type TagVariant = 'success' | 'warning' | 'danger' | 'info' | 'default'

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant
  closable?: boolean
  onClose?: () => void
  children: React.ReactNode
}

const variantMap: Record<TagVariant, string> = {
  success:
    'bg-medical-success-light text-medical-success border border-medical-success/20',
  warning:
    'bg-medical-warning-light text-medical-warning border border-medical-warning/20',
  danger:
    'bg-medical-danger-light text-medical-danger border border-medical-danger/20',
  info:
    'bg-medical-primary-light text-medical-primary border border-medical-primary/20',
  default:
    'bg-gray-100 text-text-secondary border border-gray-200',
}

export default function Tag({
  variant = 'default',
  closable = false,
  onClose,
  className,
  children,
  ...props
}: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors',
        variantMap[variant],
        className
      )}
      {...props}
    >
      {children}
      {closable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onClose?.()
          }}
          className={cn(
            'ml-0.5 inline-flex items-center justify-center rounded-sm',
            'hover:bg-black/10 active:bg-black/20 transition-colors',
            'focus:outline-none focus:ring-1 focus:ring-current/30'
          )}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  )
}
