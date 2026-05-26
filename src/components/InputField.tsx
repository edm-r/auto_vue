import type { ChangeEvent } from 'react'
import { cn } from '../lib/cn'

export function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  required,
  readOnly,
  disabled,
}: {
  label: string
  name: string
  type?: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  error?: string
  autoComplete?: string
  required?: boolean
  readOnly?: boolean
  disabled?: boolean
}) {
  const id = `field_${name}`

  return (
    <div className="mb-4">
      <label
        className="block text-sm font-medium text-neutral-700 mb-1.5"
        htmlFor={id}
      >
        {label}
        {required ? <span className="text-red-500 ml-1">*</span> : null}
      </label>
      <input
        id={id}
        className={cn(
          'w-full px-4 py-2.5 border rounded-xl text-neutral-900 placeholder:text-neutral-400',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          'transition-colors bg-white disabled:bg-neutral-50 disabled:cursor-not-allowed',
          error
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-neutral-300'
        )}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        readOnly={readOnly}
        disabled={disabled}
      />
      {error ? <div className="mt-1.5 text-sm text-red-600">{error}</div> : null}
    </div>
  )
}
