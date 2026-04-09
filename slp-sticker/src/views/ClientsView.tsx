import { useMemo, useState } from 'react'
import { uid } from '../lib/ids'
import { pushToast } from '../components/Toast'
import { type AppData, type Client, type Goal, type GoalDomain, type GoalScoring } from '../lib/types'

const DOMAIN_LABELS: Record<GoalDomain, string> = {
  articulation: 'Articulation',
  language: 'Language',
  fluency: 'Fluency',
  voice: 'Voice',
  pragmatics: 'Pragmatics',
  other: 'Other',
}

export function ClientsView(props: {
  data: AppData
  activeClientId: string | null
  onPickClient: (id: string) => void
  onChange: (next: AppData) => void
}) {
  const { data, activeClientId, onPickClient, onChange } = props

  const activeClient = useMemo(
    () => (activeClientId ? data.clients.find((c) => c.id === activeClientId) ?? null : null),
    [activeClientId, data.clients]
  )

  const [newClientName, setNewClientName] = useState('')
  const [newClientAge, setNewClientAge] = useState('')

  const [goalLabel, setGoalLabel] = useState('')
  const [goalDomain, setGoalDomain] = useState<GoalDomain>('articulation')
  const [goalScoring, setGoalScoring] = useState<GoalScoring>('trials')
  const [goalTarget, setGoalTarget] = useState('')

  const activeGoals = useMemo(() => {
    if (!activeClient) return []
    const set = new Set(activeClient.goalIds)
    return data.goals.filter((g) => set.has(g.id))
  }, [activeClient, data.goals])

  function addClient() {
    const name = newClientName.trim()
    if (!name) {
      pushToast({ kind: 'error', title: 'Client name required' })
      return
    }

    const client: Client = {
      id: uid('client'),
      name,
      age: newClientAge.trim() || undefined,
      goalIds: [],
      createdAt: Date.now(),
    }

    const next: AppData = { ...data, clients: [client, ...data.clients] }
    onChange(next)
    setNewClientName('')
    setNewClientAge('')
    onPickClient(client.id)
    pushToast({ kind: 'success', title: 'Client added', message: name })
  }

  function removeClient(id: string) {
    const c = data.clients.find((x) => x.id === id)
    if (!c) return
    const ok = confirm(`Delete client “${c.name}” and all their sessions? This can’t be undone.`)
    if (!ok) return

    const next: AppData = {
      ...data,
      clients: data.clients.filter((x) => x.id !== id),
      sessions: data.sessions.filter((s) => s.clientId !== id),
    }
    onChange(next)
    pushToast({ kind: 'success', title: 'Client deleted' })
  }

  function addGoalToActiveClient() {
    if (!activeClient) {
      pushToast({ kind: 'error', title: 'Pick a client first' })
      return
    }

    const label = goalLabel.trim()
    if (!label) {
      pushToast({ kind: 'error', title: 'Goal label required', message: 'Example: /r/ in initial position' })
      return
    }

    const g: Goal = {
      id: uid('goal'),
      label,
      domain: goalDomain,
      scoring: goalScoring,
      target: goalTarget.trim() || undefined,
      createdAt: Date.now(),
    }

    const nextClient: Client = { ...activeClient, goalIds: [g.id, ...activeClient.goalIds] }
    const next: AppData = {
      ...data,
      goals: [g, ...data.goals],
      clients: data.clients.map((c) => (c.id === activeClient.id ? nextClient : c)),
    }
    onChange(next)

    setGoalLabel('')
    setGoalTarget('')
    setGoalDomain('articulation')
    setGoalScoring('trials')
    pushToast({ kind: 'success', title: 'Goal added', message: label })
  }

  function detachGoal(goalId: string) {
    if (!activeClient) return
    const nextClient: Client = { ...activeClient, goalIds: activeClient.goalIds.filter((id) => id !== goalId) }
    const next: AppData = {
      ...data,
      clients: data.clients.map((c) => (c.id === activeClient.id ? nextClient : c)),
    }
    onChange(next)
  }

  function renameClient(clientId: string, name: string) {
    const n = name.trim()
    if (!n) return
    const next: AppData = {
      ...data,
      clients: data.clients.map((c) => (c.id === clientId ? { ...c, name: n } : c)),
    }
    onChange(next)
  }

  return (
    <div className="grid">
      <section className="panel panel--paper">
        <header className="panel__hd">
          <h2>Clients</h2>
          <p className="muted">Tap a client, then build their goal sticker sheet.</p>
        </header>

        <div className="card card--clip">
          <div className="formrow">
            <label>
              <span>Name</span>
              <input value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="Ava S." />
            </label>
            <label>
              <span>Age (optional)</span>
              <input value={newClientAge} onChange={(e) => setNewClientAge(e.target.value)} placeholder="7" />
            </label>
          </div>
          <div className="actions">
            <button className="btn btn--primary" onClick={addClient}>
              Add client
            </button>
          </div>
        </div>

        {data.clients.length === 0 ? (
          <div className="emptystate">
            <div className="emptystate__title">No clients yet</div>
            <div className="emptystate__body">Add one above. Everything stays on this device.</div>
          </div>
        ) : (
          <ul className="list" aria-label="Client list">
            {data.clients.map((c) => (
              <li key={c.id} className={c.id === activeClientId ? 'list__item is-active' : 'list__item'}>
                <button className="list__pick" onClick={() => onPickClient(c.id)}>
                  <div className="list__title">
                    {c.name} {c.age ? <span className="pill">Age {c.age}</span> : null}
                  </div>
                  <div className="list__meta">{c.goalIds.length} goals • {data.sessions.filter((s) => s.clientId === c.id).length} sessions</div>
                </button>
                <div className="list__tools">
                  <button
                    className="btn btn--ghost"
                    onClick={() => {
                      const next = prompt('Rename client', c.name)
                      if (next !== null) renameClient(c.id, next)
                    }}
                  >
                    Rename
                  </button>
                  <button className="btn btn--danger" onClick={() => removeClient(c.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel panel--paper">
        <header className="panel__hd">
          <h2>Goal sticker sheet</h2>
          <p className="muted">Build quick-tap targets for the active client.</p>
        </header>

        {!activeClient ? (
          <div className="emptystate">
            <div className="emptystate__title">Pick a client</div>
            <div className="emptystate__body">Then add 3–8 goals you want on your session screen.</div>
          </div>
        ) : (
          <>
            <div className="card card--clip">
              <div className="formrow">
                <label className="grow">
                  <span>Goal label</span>
                  <input
                    value={goalLabel}
                    onChange={(e) => setGoalLabel(e.target.value)}
                    placeholder="/s/ blends in conversation (80%+)"
                  />
                </label>
              </div>
              <div className="formrow">
                <label>
                  <span>Domain</span>
                  <select value={goalDomain} onChange={(e) => setGoalDomain(e.target.value as GoalDomain)}>
                    {Object.entries(DOMAIN_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Scoring</span>
                  <select value={goalScoring} onChange={(e) => setGoalScoring(e.target.value as GoalScoring)}>
                    <option value="trials">Trials (✓/✕ tally)</option>
                    <option value="rating">Rating (0–5)</option>
                  </select>
                </label>
                <label className="grow">
                  <span>Target (optional)</span>
                  <input value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} placeholder="e.g., 16 trials" />
                </label>
              </div>
              <div className="actions">
                <button className="btn btn--primary" onClick={addGoalToActiveClient}>
                  Add goal
                </button>
              </div>
            </div>

            {activeGoals.length === 0 ? (
              <div className="emptystate">
                <div className="emptystate__title">No goals yet</div>
                <div className="emptystate__body">Add a couple, then switch to <strong>Session</strong>.</div>
              </div>
            ) : (
              <div className="stickers" aria-label="Goal stickers">
                {activeGoals.map((g) => (
                  <div key={g.id} className={`sticker sticker--${g.domain}`}>
                    <div className="sticker__hd">
                      <div className="sticker__domain">{DOMAIN_LABELS[g.domain]}</div>
                      <button className="sticker__x" onClick={() => detachGoal(g.id)} aria-label={`Remove goal ${g.label}`}>
                        ×
                      </button>
                    </div>
                    <div className="sticker__label">{g.label}</div>
                    <div className="sticker__meta">
                      <span className="pill">{g.scoring === 'trials' ? 'Trials' : 'Rating'}</span>
                      {g.target ? <span className="pill">Target: {g.target}</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
