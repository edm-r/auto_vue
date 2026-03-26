import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

import { cn } from '../../lib/utils'

export const Sheet = Dialog.Root
export const SheetTrigger = Dialog.Trigger
export const SheetClose = Dialog.Close

export function SheetContent({
  side = 'right',
  className,
  children,
  ...props
}: Dialog.DialogContentProps & { side?: 'left' | 'right' | 'top' | 'bottom' }) {
  const sideClass =
    side === 'left'
      ? 'left-0 top-0 h-full w-[320px] translate-x-[-100%]'
      : side === 'right'
        ? 'right-0 top-0 h-full w-[320px] translate-x-[100%]'
        : side === 'top'
          ? 'left-0 top-0 w-full h-[320px] translate-y-[-100%]'
          : 'left-0 bottom-0 w-full h-[320px] translate-y-[100%]'

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/55 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <Dialog.Content
        className={cn(
          'fixed z-50 bg-surface border border-border shadow-soft p-5 outline-none rounded-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:duration-200 data-[state=closed]:duration-200',
          'data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
          sideClass,
          className,
        )}
        {...props}
      >
        <Dialog.Close className="absolute right-3 top-3 rounded-xl p-2 text-muted hover:bg-surface-2">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Dialog.Close>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  )
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 pr-10', className)} {...props} />
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-base font-bold tracking-tight', className)} {...props} />
}

