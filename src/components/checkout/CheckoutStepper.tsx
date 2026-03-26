const steps = [
  { key: 1, label: 'Adresse' },
  { key: 2, label: 'Livraison' },
  { key: 3, label: 'Paiement' },
  { key: 4, label: 'Confirmation' },
] as const

export function CheckoutStepper({ active }: { active: 1 | 2 | 3 | 4 }) {
  return (
    <div className="stepper" aria-label="Étapes du checkout">
      {steps.map((s, idx) => {
        const state = s.key < active ? 'done' : s.key === active ? 'active' : 'todo'
        return (
          <div className={`step ${state}`} key={s.key}>
            <div className="step-dot">{s.key}</div>
            <div className="step-label">{s.label}</div>
            {idx !== steps.length - 1 ? <div className="step-line" /> : null}
          </div>
        )
      })}
    </div>
  )
}

