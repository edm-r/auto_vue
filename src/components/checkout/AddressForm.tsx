import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import type { Address } from '../../checkout/checkoutApi'
import { InputField } from '../InputField'

export type AddressFormValues = Omit<Address, 'id'>

export function AddressForm({
  initial,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  initial?: Partial<Address>
  onSubmit: (values: AddressFormValues) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}) {
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [addressLine, setAddressLine] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState('')
  const [country, setCountry] = useState('CM')
  const [postalCode, setPostalCode] = useState('')
  const [isDefault, setIsDefault] = useState(false)

  useEffect(() => {
    setFullName(initial?.full_name ?? '')
    setPhoneNumber(initial?.phone_number ?? '')
    setAddressLine(initial?.address_line ?? '')
    setCity(initial?.city ?? '')
    setRegion(initial?.region ?? '')
    setCountry(initial?.country ?? 'CM')
    setPostalCode(initial?.postal_code ?? '')
    setIsDefault(Boolean(initial?.is_default))
  }, [initial])

  async function submit(e: FormEvent) {
    e.preventDefault()
    await onSubmit({
      full_name: fullName,
      phone_number: phoneNumber,
      address_line: addressLine,
      city,
      region,
      country,
      postal_code: postalCode,
      is_default: isDefault,
    })
  }

  return (
    <form className="addr-form" onSubmit={submit}>
      <InputField
        label="Nom complet"
        name="full_name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />
      <InputField
        label="Téléphone"
        name="phone_number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        required
      />
      <InputField
        label="Adresse"
        name="address_line"
        value={addressLine}
        onChange={(e) => setAddressLine(e.target.value)}
        required
      />
      <div className="addr-grid">
        <InputField label="Ville" name="city" value={city} onChange={(e) => setCity(e.target.value)} required />
        <InputField
          label="Région"
          name="region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          required
        />
      </div>
      <div className="addr-grid">
        <InputField
          label="Pays (code ISO 2 lettres)"
          name="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
        />
        <InputField
          label="Code postal"
          name="postal_code"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
        />
      </div>

      <label className="addr-default">
        <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
        Définir comme adresse par défaut
      </label>

      <div className="actions">
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <button className="btn" type="button" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </button>
      </div>
    </form>
  )
}
