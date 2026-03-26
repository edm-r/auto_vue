import { AuthLayout } from '../components/AuthLayout'

export function ConfigErrorPage() {
  return (
    <AuthLayout
      title="Configuration manquante"
      subtitle="L’API n’est pas configurée."
    >
      <div style={{ padding: 12 }}>
        <p style={{ marginTop: 0 }}>
          Définis l’URL de l’API puis redémarre le serveur frontend.
        </p>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>
            Dev (Vite) : copie <code>.env.example</code> vers <code>.env</code>{' '}
            et définis <code>VITE_API_BASE_URL</code>
          </li>
          <li>
            Prod : fournis un fichier <code>/runtime-config.js</code> qui définit{' '}
            <code>window.__AUTO_VUE_CONFIG__ = {'{ API_BASE_URL: \"...\" }'}</code>
          </li>
        </ul>
      </div>
    </AuthLayout>
  )
}

