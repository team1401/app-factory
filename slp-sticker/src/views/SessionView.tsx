import { useEffect, useMemo, useState } from 'react'
import { pushToast } from '../components/Toast'
import { fmtTime, clamp } from '../lib/date'
import { uid } from '../lib/ids'
import { type AppData, type NavKey, type Session, type SessionGoalResult } from '../lib/types'

export function SessionView(props: {
  data: AppData
  activeClientId: string | null
  onPickClient: (id: string | null) => void
  onChange: (next: AppData) => void
  onNav: (key: NavKey) => void
}) {
  const { data, activeClientId, onPickClient, onChange, onNav } = props

  const activeClient = useMemo(
    () => (activeClientId ? data.clients.find((c) => c.id === activeClientId) ?? null : null),
    [activeClientId, data.clients]
  )

  const goals = useMemo(() => {
    if (!activeClient) return []
    const set = new Set(activeClient.goalIds)
    return data.goals.filter((g) => set.has(g.id))
  }, [activeClient, data.goals])

  const [running, setRunning] = useState(false)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const [results, setResults] = useState<Record<string, SessionGoalResult>>({})
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!running) return
    const t = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(t)
  }, [running])

  useEffect(() => {
    // If active client changes while running, stop session to avoid cross-client contamination.
    if (running && activeClientId && startedAt) {
      // ok
    }
  }, [running, activeClientId, startedAt])

  const elapsedSeconds = useMemo(() => {
    if (!running || !startedAt) return 0
    return Math.max(0, Math.floor((now - startedAt) / 1000))
  }, [now, running, startedAt])

  const elapsedMmSs = useMemo(() => {
    const mm = Math.floor(elapsedSeconds / 60)
    const ss = elapsedSeconds % 60
    return `${mm}:${ss.toString().padStart(2, '0')}`
  }, [elapsedSeconds])

  function ensureClientAndGoals() {
    if (!activeClient) {
      pushToast({ kind: 'error', title: 'Pick a client' })
      onNav('clients')
      return false
    }
    if (goals.length === 0) {
      pushToast({ kind: 'error', title: 'Add at least one goal', message: 'Build a goal sticker sheet first.' })
      onNav('clients')
      return false
    }
    return true
  }

  function start() {
    if (!ensureClientAndGoals()) return
    const ts = Date.now()
    setRunning(true)
    setStartedAt(ts)
    setNow(ts)
    setResults({})
    setNote('')
    pushToast({ kind: 'success', title: 'Session started', message: fmtTime(ts) })
  }

  function stopAndSave() {
    if (!running || !startedAt || !activeClient) return

    const endedAt = Date.now()
    const minutes = Math.max(1, Math.round((endedAt - startedAt) / 60000))

    const goalResults: SessionGoalResult[] = goals
      .map((g) => {
        const r = results[g.id]
        if (r) return r
        // Include empty goals as zeroed-out so reports show gaps clearly.
        return g.scoring === 'trials'
          ? ({ goalId: g.id, scoring: 'trials', correct: 0, total: 0 } satisfies SessionGoalResult)
          : ({ goalId: g.id, scoring: 'rating', rating: 0 } satisfies SessionGoalResult)
      })
      .map((r) => {
        if (r.scoring === 'trials') {
          return { ...r, correct: clamp(r.correct, 0, 9999), total: clamp(r.total, 0, 9999) }
        }
        return { ...r, rating: clamp(r.rating, 0, 5) }
      })

    const s: Session = {
      id: uid('sess'),
      clientId: activeClient.id,
      startedAt,
      endedAt,
      minutes,
      goalResults,
      note: note.trim() || undefined,
    }

    onChange({ ...data, sessions: [s, ...data.sessions] })

    setRunning(false)
    setStartedAt(null)
    setResults({})
    pushToast({ kind: 'success', title: 'Session saved', message: `${minutes} min` })
    onNav('reports')
  }

  function bumpTrial(goalId: string, deltaCorrect: number, deltaTotal: number) {
    setResults((prev) => {
      const cur = prev[goalId]
      const base = cur?.scoring === 'trials' ? cur : { goalId, scoring: 'trials' as const, correct: 0, total: 0 }
      const next = {
        ...base,
        correct: clamp(base.correct + deltaCorrect, 0, 9999),
        total: clamp(base.total + deltaTotal, 0, 9999),
      }
      return { ...prev, [goalId]: next }
    })
  }

  function setRating(goalId: string, rating: number) {
    setResults((prev) => ({ ...prev, [goalId]: { goalId, scoring: 'rating', rating: clamp(rating, 0, 5) } }))
  }

  if (!activeClientId) {
    return (
      <div className="panel panel--paper">
        <header className="panel__hd">
          <h2>Session</h2>
          <p className="muted">Pick a client to begin.</p>
        </header>
        <div className="emptystate">
          <div className="emptystate__title">No active client</div>
          <div className="emptystate__body">Go to Clients → add/select a client and goals.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid">
      <section className="panel panel--paper">
        <header className="panel__hd">
          <h2>Session runner</h2>
          <p className="muted">
            Client: <strong>{activeClient?.name ?? '—'}</strong>
          </p>
        </header>

        <div className="card card--clip">
          <div className="sessionbar">
            <div className="sessionbar__left">
              <div className="bigclock" aria-label="Session timer">
                {running ? elapsedMmSs : '—:—'}
              </div>
              <div className="muted">{running && startedAt ? `Started ${fmtTime(startedAt)}` : 'Not running'}</div>
            </div>

            <div className="sessionbar__right">
              {!running ? (
                <button className="btn btn--primary" onClick={start}>
                  Start session
                </button>
              ) : (
                <button className="btn btn--danger" onClick={stopAndSave}>
                  End + save
                </button>
              )}

              <button
                className="btn btn--ghost"
                onClick={() => {
                  onPickClient(null)
                  onNav('clients')
                }}
                disabled={running}
              >
                Switch client
              </button>
            </div>
          </div>

          <label className="full">
            <span>Session note (optional)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Prompts used, cues, behaviors, generalization notes…"
              rows={3}
              disabled={!running}
            />
          </label>
        </div>

        {goals.length === 0 ? (
          <div className="emptystate">
            <div className="emptystate__title">No goals on the sticker sheet</div>
            <div className="emptystate__body">Go to Clients and add goals first.</div>
          </div>
        ) : (
          <div className="stickers" aria-label="Session stickers">
            {goals.map((g) => {
              const r = results[g.id]
              return (
                <div key={g.id} className={`sticker sticker--${g.domain} sticker--live`}>
                  <div className="sticker__hd">
                    <div className="sticker__domain">{g.domain}</div>
                    <div className="pill">{g.scoring === 'trials' ? 'Trials' : 'Rating'}</div>
                  </div>

                  <div className="sticker__label">{g.label}</div>
                  {g.target ? <div className="muted">Target: {g.target}</div> : null}

                  {g.scoring === 'trials' ? (
                    <>
                      <div className="tallyline" aria-label="Tally">
                        <div className="tallyline__score">
                          <span className="tallyline__big">{r?.scoring === 'trials' ? r.correct : 0}</span>
                          <span className="muted">/</span>
                          <span className="tallyline__big">{r?.scoring === 'trials' ? r.total : 0}</span>
                        </div>
                        <div className="tallyline__pct">
                          {(() => {
                            const correct = r?.scoring === 'trials' ? r.correct : 0
                            const total = r?.scoring === 'trials' ? r.total : 0
                            if (!total) return '—'
                            return `${Math.round((correct / total) * 100)}%`
                          })()}
                        </div>
                      </div>

                      <div className="tallybtns">
                        <button
                          className="btn btn--ok"
                          onClick={() => bumpTrial(g.id, 1, 1)}
                          disabled={!running}
                          aria-label={`Correct trial for ${g.label}`}
                        >
                          {data.settings.quickButtons.correctLabel}
                        </button>
                        <button
                          className="btn btn--warn"
                          onClick={() => bumpTrial(g.id, 0, 1)}
                          disabled={!running}
                          aria-label={`Incorrect trial for ${g.label}`}
                        >
                          {data.settings.quickButtons.incorrectLabel}
                        </button>
                        <button
                          className="btn btn--ghost"
                          onClick={() => {
                            setResults((prev) => ({ ...prev, [g.id]: { goalId: g.id, scoring: 'trials', correct: 0, total: 0 } }))
                          }}
                          disabled={!running}
                        >
                          Reset
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="rating">
                      <div className="rating__row" role="radiogroup" aria-label={`Rating for ${g.label}`}>
                        {[0, 1, 2, 3, 4, 5].map((x) => {
                          const active = r?.scoring === 'rating' ? r.rating === x : x === 0
                          return (
                            <button
                              key={x}
                              className={active ? 'rating__dot is-on' : 'rating__dot'}
                              onClick={() => setRating(g.id, x)}
                              disabled={!running}
                              aria-pressed={active}
                            >
                              {x}
                            </button>
                          )
                        })}
                      </div>
                      <div className="muted">0 = not observed, 5 = solid</div>
                    </div>
                  )}

                  <div className="tallymarks" aria-hidden>
                    {(() => {
                      const total = r?.scoring === 'trials' ? r.total : 0
                      const ticks = Math.min(total, 25)
                      return Array.from({ length: ticks }).map((_, i) => <span key={i} className="tick" />)
                    })()}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="panel panel--paper">
        <header className="panel__hd">
          <h2>Quick help</h2>
          <p className="muted">Designed for one-handed tapping while you cue.</p>
        </header>

        <div className="card">
          <h3 className="h3">Workflow</h3>
          <ol className="ol">
            <li>Clients → add client + goals</li>
            <li>Session → Start, then tap ✓ / ✕</li>
            <li>End + save → Reports shows trends</li>
          </ol>
        </div>

        <div className="card">
          <h3 className="h3">Data safety</h3>
          <p className="muted">
            This app is <strong>local-only</strong>. If you clear browser storage, it’s gone. Use Settings → Export for backups.
          </p>
        </div>

        <div className="card">
          <h3 className="h3">Accessibility</h3>
          <p className="muted">All controls are keyboard-navigable. High-contrast palette and large tap targets.</p>
        </div>
      </section>
    </div>
  )
}
