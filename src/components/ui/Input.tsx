import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-2.5 border rounded-xl text-neutral-900 placeholder:text-neutral-400',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          'transition-colors bg-white disabled:bg-neutral-50 disabled:cursor-not-allowed',
          error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-neutral-300',
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
