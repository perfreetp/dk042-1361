import { cn } from '@/lib/utils'
import React from 'react'

type CardPadding = 'sm' | 'md' | 'lg' | 'none'
type CardShadow = 'none' | 'sm' | 'md' | 'lg'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  padding?: CardPadding
  shadow?: CardShadow
  children: React.ReactNode
}

const paddingMap: Record<CardPadding, string> = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
  none: 'p-0',
}

const shadowMap: Record<CardShadow, string> = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-card',
  lg: 'shadow-card-hover',
}

export default function Card({
  hoverable = false,
  padding = 'md',
  shadow = 'md',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-background-card rounded-lg border border-border-light transition-all duration-200',
        paddingMap[padding],
        shadowMap[shadow],
        hoverable && 'hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-between pb-4 border-b border-border-light mb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-lg font-semibold text-text-primary', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-end pt-4 border-t border-border-light mt-4 gap-2', className)}
      {...props}
    >
      {children}
    </div>
  )
}
