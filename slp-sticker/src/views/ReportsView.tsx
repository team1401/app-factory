import { useMemo, useState } from 'react'
import { downloadText } from '../lib/storage'
import { fmtDate } from '../lib/date'
import { type AppData, type SessionGoalResult } from '../lib/types'

function pct(correct: number, total: number) {
  if (!total) return null
  return Math.round((correct / total) * 100)
}

function sparkline(points: Array<number | null>, w = 220, h = 48) {
  const vals = points.filter((p): p is number => typeof p === 'number')
  if (vals.length < 2) return null
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const span = Math.max(1, max - min)

  const coords = points
    .map((p, i) => {
      if (typeof p !== 'number') return null
      const x = (i / Math.max(1, points.length - 1)) * w
      const y = h - ((p - min) / span) * h
      return { x, y }
    })
    .filter((x): x is { x: number; y: number } => !!x)

  if (coords.length < 2) return null

  const d = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ')
  return { d, min, max }
}

export function ReportsView(props: { data: AppData; activeClientId: string | null; onPickClient: (id: string | null) => void }) {
  const { data, activeClientId } = props

  const client = useMemo(
    () => (activeClientId ? data.clients.find((c) => c.id === activeClientId) ?? null : null),
    [activeClientId, data.clients]
  )

  const goals = useMemo(() => {
    if (!client) return []
    const set = new Set(client.goalIds)
    return data.goals.filter((g) => set.has(g.id))
  }, [client, data.goals])

  const sessions = useMemo(() => {
    if (!client) return []
    return data.sessions
      .filter((s) => s.clientId === client.id)
      .slice()
      .sort((a, b) => a.startedAt - b.startedAt)
  }, [client, data.sessions])

  const [goalFilter, setGoalFilter] = useState<string>('')

  function exportClientCsv() {
    if (!client) return

    const rows: string[] = []
    rows.push(['date', 'minutes', 'goal', 'scoring', 'correct', 'total', 'pct', 'rating', 'note'].join(','))

    for (const s of sessions) {
      for (const r of s.goalResults) {
        const g = goals.find((x) => x.id === r.goalId)
        const goalName = (g?.label ?? r.goalId).replaceAll('"', '""')
        if (r.scoring === 'trials') {
          const p = pct(r.correct, r.total)
          rows.push(
            [
              fmtDate(s.startedAt),
              String(s.minutes),
              `"${goalName}"`,
              'trials',
              String(r.correct),
              String(r.total),
              p === null ? '' : String(p),
              '',
              `"${(s.note ?? '').replaceAll('"', '""')}"`,
            ].join(',')
          )
        } else {
          rows.push(
            [
              fmtDate(s.startedAt),
              String(s.minutes),
              `"${goalName}"`,
              'rating',
              '',
              '',
              '',
              String(r.rating),
              `"${(s.note ?? '').replaceAll('"', '""')}"`,
            ].join(',')
          )
        }
      }
    }

    downloadText(`stickertally_${client.name.replaceAll(' ', '_')}_sessions.csv`, rows.join('\n'), 'text/csv')
  }

  return (
    <div className="grid">
      <section className="panel panel--paper">
        <header className="panel__hd">
          <h2>Reports</h2>
          <p className="muted">Trends by goal, plus a clean session history.</p>
        </header>

        {!client ? (
          <div className="emptystate">
            <div className="emptystate__title">Pick a client</div>
            <div className="emptystate__body">Go to Clients → select someone.</div>
          </div>
        ) : (
          <>
            <div className="card card--clip">
              <div className="formrow">
                <label className="grow">
                  <span>Filter sessions by goal (optional)</span>
                  <select value={goalFilter} onChange={(e) => setGoalFilter(e.target.value)}>
                    <option value="">All goals</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="actions">
                  <button className="btn btn--primary" onClick={exportClientCsv} disabled={sessions.length === 0}>
                    Export CSV
                  </button>
                </div>
              </div>
            </div>

            {goals.length === 0 ? (
              <div className="emptystate">
                <div className="emptystate__title">No goals</div>
                <div className="emptystate__body">Add goals in Clients to see progress charts.</div>
              </div>
            ) : (
              <div className="goalgrid">
                {goals.map((g) => {
                  const series: Array<number | null> = sessions.map((s) => {
                    const r = s.goalResults.find((x) => x.goalId === g.id)
                    if (!r) return null
                    if (r.scoring === 'trials') return pct(r.correct, r.total)
                    return Math.round((r.rating / 5) * 100)
                  })

                  const sp = sparkline(series)

                  const last = [...sessions]
                    .reverse()
                    .map((s) => s.goalResults.find((x) => x.goalId === g.id))
                    .find(Boolean) as SessionGoalResult | undefined

                  const lastLabel =
                    last?.scoring === 'trials'
                      ? last.total
                        ? `${last.correct}/${last.total} (${pct(last.correct, last.total)}%)`
                        : '0/0'
                      : last
                        ? `${last.rating}/5`
                        : '—'

                  return (
                    <div key={g.id} className={`card goalcard sticker--${g.domain}`}>
                      <div className="goalcard__top">
                        <div>
                          <div className="goalcard__label">{g.label}</div>
                          <div className="muted">Last: {lastLabel}</div>
                        </div>
                        <div className="pill">{g.scoring === 'trials' ? 'Trials' : 'Rating'}</div>
                      </div>

                      <div className="spark">
                        {sp ? (
                          <svg width="100%" viewBox={`0 0 220 48`} role="img" aria-label={`Trend for ${g.label}`}>
                            <path d={sp.d} fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
                            <path
                              d={`M 0 48 L 220 48`}
                              fill="none"
                              stroke="var(--line)"
                              strokeWidth="1"
                              strokeDasharray="4 5"
                            />
                          </svg>
                        ) : (
                          <div className="muted">Need 2+ sessions for a trend line.</div>
                        )}
                      </div>

                      <div className="goalcard__meta">
                        <span className="pill">{g.domain}</span>
                        {g.target ? <span className="pill">Target: {g.target}</span> : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="card">
              <h3 className="h3">Session history</h3>
              {sessions.length === 0 ? (
                <div className="muted">No sessions saved yet.</div>
              ) : (
                <ul className="history" aria-label="Session history">
                  {sessions
                    .slice()
                    .reverse()
                    .filter((s) => {
                      if (!goalFilter) return true
                      return s.goalResults.some((r) => r.goalId === goalFilter)
                    })
                    .map((s) => (
                      <li key={s.id} className="history__item">
                        <div className="history__date">{fmtDate(s.startedAt)}</div>
                        <div className="history__meta">{s.minutes} min • {s.goalResults.length} goals</div>
                        {s.note ? <div className="history__note">{s.note}</div> : null}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </>
        )}
      </section>

      <section className="panel panel--paper">
        <header className="panel__hd">
          <h2>What this solves</h2>
          <p className="muted">A real clinic pain: losing tally sheets and having no quick trend view.</p>
        </header>

        <div className="card">
          <h3 className="h3">The pain</h3>
          <ul className="ul">
            <li>Paper tallies get lost or are hard to summarize.</li>
            <li>Existing EHR tools are slow for in-the-moment tapping.</li>
            <li>Therapists need a fast “how are we trending?” view between sessions.</li>
          </ul>
        </div>

        <div className="card">
          <h3 className="h3">The fit</h3>
          <ul className="ul">
            <li>Local-only and private by default.</li>
            <li>Big buttons. Designed for touch screens.</li>
            <li>Exports for backups + documentation workflows.</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
