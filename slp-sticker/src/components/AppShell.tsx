import { type ReactNode, useEffect } from 'react'
import { type Client, type NavKey } from '../lib/types'
import { ClientPicker } from './ClientPicker'

export function AppShell(props: {
  title: string
  nav: NavKey
  onNav: (key: NavKey) => void
  clients: Client[]
  activeClient: Client | null
  onPickClient: (id: string) => void
  children: ReactNode
}) {
  const { title, nav, onNav, clients, activeClient, onPickClient, children } = props

  useEffect(() => {
    document.title = `${title}${activeClient ? ` — ${activeClient.name}` : ''}`
  }, [title, activeClient])

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand__mark" aria-hidden>
            <span className="sticker-dot dot-a" />
            <span className="sticker-dot dot-b" />
            <span className="sticker-dot dot-c" />
          </div>
          <div className="brand__text">
            <div className="brand__title">{title}</div>
            <div className="brand__subtitle">Fast tallying + clean progress for speech therapy sessions</div>
          </div>
        </div>

        <nav className="nav" aria-label="Primary">
          <button className={nav === 'clients' ? 'nav__btn is-active' : 'nav__btn'} onClick={() => onNav('clients')}>
            Clients
          </button>
          <button className={nav === 'session' ? 'nav__btn is-active' : 'nav__btn'} onClick={() => onNav('session')}>
            Session
          </button>
          <button className={nav === 'reports' ? 'nav__btn is-active' : 'nav__btn'} onClick={() => onNav('reports')}>
            Reports
          </button>
          <button className={nav === 'settings' ? 'nav__btn is-active' : 'nav__btn'} onClick={() => onNav('settings')}>
            Settings
          </button>
        </nav>

        <div className="topbar__right">
          <ClientPicker
            clients={clients}
            activeClient={activeClient}
            onPickClient={onPickClient}
            disabled={clients.length === 0}
          />
        </div>
      </header>

      <main className="content" role="main">
        {children}
      </main>

      <footer className="footer">
        <div>
          <strong>Tip:</strong> Keep one iPad open for tapping tallies; export JSON for backups.
        </div>
        <div className="footer__small">Local-only. Nothing is uploaded anywhere.</div>
      </footer>
    </div>
  )
}
