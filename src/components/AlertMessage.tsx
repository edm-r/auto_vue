import { CircleAlert as AlertCircle, CircleCheck as CheckCircle, Info } from 'lucide-react'
import { cn } from '../lib/cn'

export function AlertMessage({
  type,
  message,
}: {
  type: 'error' | 'success' | 'info'
  message: string
}) {
  const icons = {
    error: AlertCircle,
    success: CheckCircle,
    info: Info,
  }

  const Icon = icons[type]

  return (
    <div
      className={cn(
        'rounded-xl p-4 mb-4 flex items-start gap-3 border',
        {
          'bg-red-50 border-red-200 text-red-800': type === 'error',
          'bg-emerald-50 border-emerald-200 text-emerald-800': type === 'success',
          'bg-blue-50 border-blue-200 text-blue-800': type === 'info',
        }
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}

