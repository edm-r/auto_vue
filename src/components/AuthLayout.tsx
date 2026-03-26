import type { ReactNode } from 'react'

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-large border border-neutral-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">
              {title}
            </h1>
            {subtitle ? (
              <p className="text-sm text-neutral-600">{subtitle}</p>
            ) : null}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
