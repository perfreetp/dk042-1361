import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import React, { useEffect } from 'react'

interface ModalProps {
  open: boolean
  title?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  onClose: () => void
  closeOnMaskClick?: boolean
  closeOnEsc?: boolean
  width?: string | number
  className?: string
  maskClassName?: string
}

export default function Modal({
  open,
  title,
  children,
  footer,
  onClose,
  closeOnMaskClick = true,
  closeOnEsc = true,
  width = 520,
  className,
  maskClassName,
}: ModalProps) {
  useEffect(() => {
    if (!open || !closeOnEsc) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, closeOnEsc, onClose])

  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={cn(
          'absolute inset-0 bg-black/40 animate-fade-in',
          maskClassName
        )}
        onClick={() => {
          if (closeOnMaskClick) onClose()
        }}
      />
      <div
        className={cn(
          'relative z-10 bg-background-card rounded-xl shadow-xl flex flex-col max-h-[90vh] animate-scale-in',
          className
        )}
        style={{ width: typeof width === 'number' ? `${width}px` : width }}
      >
        {(title || onClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-light shrink-0">
            <h3 className="text-lg font-semibold text-text-primary">
              {title}
            </h3>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 -m-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-medical-primary/30"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        <div className="px-6 py-5 overflow-y-auto scrollbar-thin flex-1">
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border-light shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
