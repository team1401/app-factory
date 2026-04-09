import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { AppShell } from './components/AppShell'
import { ToastHost, pushToast } from './components/Toast'
import { createEmptyData, loadAppData, saveAppData } from './lib/storage'
import { type AppData, type NavKey } from './lib/types'
import { ClientsView } from './views/ClientsView'
import { ReportsView } from './views/ReportsView'
import { SessionView } from './views/SessionView'
import { SettingsView } from './views/SettingsView'

const APP_TITLE = 'StickerTally (SLP)'

export default function App() {
  const [data, setData] = useState<AppData>(() => loadAppData() ?? createEmptyData())
  const [nav, setNav] = useState<NavKey>('clients')
  const [activeClientId, setActiveClientId] = useState<string | null>(() => {
    const initial = loadAppData()
    return initial?.clients[0]?.id ?? null
  })

  useEffect(() => {
    try {
      saveAppData(data)
    } catch (err) {
      console.error(err)
      pushToast({ kind: 'error', title: 'Could not save', message: 'Storage is unavailable or full.' })
    }
  }, [data])

  useEffect(() => {
    if (activeClientId && !data.clients.some((c) => c.id === activeClientId)) {
      setActiveClientId(data.clients[0]?.id ?? null)
    }
  }, [activeClientId, data.clients])

  const activeClient = useMemo(
    () => (activeClientId ? data.clients.find((c) => c.id === activeClientId) ?? null : null),
    [activeClientId, data.clients]
  )

  return (
    <AppShell
      title={APP_TITLE}
      nav={nav}
      onNav={setNav}
      activeClient={activeClient}
      clients={data.clients}
      onPickClient={(id) => setActiveClientId(id)}
    >
      {nav === 'clients' && (
        <ClientsView
          data={data}
          activeClientId={activeClientId}
          onPickClient={(id) => {
            setActiveClientId(id)
            setNav('session')
          }}
          onChange={setData}
        />
      )}

      {nav === 'session' && (
        <SessionView
          data={data}
          activeClientId={activeClientId}
          onPickClient={setActiveClientId}
          onChange={setData}
          onNav={setNav}
        />
      )}

      {nav === 'reports' && (
        <ReportsView data={data} activeClientId={activeClientId} onPickClient={setActiveClientId} />
      )}

      {nav === 'settings' && (
        <SettingsView
          data={data}
          onImport={(next) => {
            setData(next)
            pushToast({ kind: 'success', title: 'Imported', message: 'Your data is now loaded.' })
          }}
          onReset={() => {
            const empty = createEmptyData()
            setData(empty)
            setActiveClientId(null)
            setNav('clients')
            pushToast({ kind: 'success', title: 'Reset', message: 'All local data cleared.' })
          }}
        />
      )}

      <ToastHost />
    </AppShell>
  )
}
