import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral'
}

export function Badge({ className, variant = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
        {
          'bg-emerald-50 text-emerald-700 border-emerald-200': variant === 'success',
          'bg-red-50 text-red-700 border-red-200': variant === 'error',
          'bg-amber-50 text-amber-700 border-amber-200': variant === 'warning',
          'bg-blue-50 text-blue-700 border-blue-200': variant === 'info',
          'bg-neutral-50 text-neutral-700 border-neutral-200': variant === 'neutral',
        },
        className
      )}
      {...props}
    />
  )
}
