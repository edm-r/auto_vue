import type { ChangeEvent } from 'react'

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
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
        {required ? <span className="field-required">*</span> : null}
      </label>
      <input
        id={id}
        className={`field-input ${error ? 'field-input--error' : ''}`}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        readOnly={readOnly}
        disabled={disabled}
      />
      {error ? <div className="field-error">{error}</div> : null}
    </div>
  )
}
