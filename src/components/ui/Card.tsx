import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-neutral-200 rounded-2xl p-6 shadow-soft',
        className
      )}
      {...props}
    />
  )
}
