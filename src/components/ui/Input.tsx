import { cn } from '@/lib/utils'
import React from 'react'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  prefixIcon?: React.ReactNode
  suffixIcon?: React.ReactNode
  error?: boolean
  errorMessage?: string
  wrapperClassName?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'h-8 text-sm',
  md: 'h-10 text-sm',
  lg: 'h-12 text-base',
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      prefixIcon,
      suffixIcon,
      error = false,
      errorMessage,
      wrapperClassName,
      className,
      disabled,
      size = 'md',
      ...props
    },
    ref
  ) {
    return (
      <div className={cn('w-full', wrapperClassName)}>
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg border bg-white transition-all w-full px-3',
            'focus-within:ring-2 focus-within:ring-medical-primary/30',
            sizeMap[size],
            error
              ? 'border-medical-danger focus-within:border-medical-danger focus-within:ring-medical-danger/30'
              : 'border-border-default hover:border-gray-400 focus-within:border-medical-primary',
            disabled && 'bg-gray-50 cursor-not-allowed opacity-60'
          )}
        >
          {prefixIcon && (
            <span className="shrink-0 text-text-tertiary">
              {prefixIcon}
            </span>
          )}
          <input
            ref={ref}
            disabled={disabled}
            className={cn(
              'flex-1 bg-transparent outline-none text-text-primary placeholder:text-text-tertiary disabled:cursor-not-allowed',
              className
            )}
            {...props}
          />
          {suffixIcon && (
            <span className="shrink-0 text-text-tertiary">
              {suffixIcon}
            </span>
          )}
        </div>
        {error && errorMessage && (
          <p className="mt-1 text-xs text-medical-danger">
            {errorMessage}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
