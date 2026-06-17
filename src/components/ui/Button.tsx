import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
}

const variantMap: Record<ButtonVariant, string> = {
  primary:
    'bg-medical-primary text-white hover:bg-medical-primary-dark active:bg-medical-primary-dark disabled:bg-medical-primary/50',
  secondary:
    'bg-medical-primary-light text-medical-primary hover:bg-medical-primary/20 active:bg-medical-primary/30 disabled:bg-medical-primary-light/50 disabled:text-medical-primary/50',
  danger:
    'bg-medical-danger text-white hover:bg-red-700 active:bg-red-800 disabled:bg-medical-danger/50',
  ghost:
    'bg-transparent text-text-primary hover:bg-gray-100 active:bg-gray-200 disabled:text-text-tertiary disabled:hover:bg-transparent',
}

const sizeMap: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-medical-primary/30 focus:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-70',
        variantMap[variant],
        sizeMap[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className={cn('animate-spin', size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-5 h-5')} />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  )
}
