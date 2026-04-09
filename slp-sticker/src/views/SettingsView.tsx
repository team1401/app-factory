import { useState } from 'react'
import { pushToast } from '../components/Toast'
import { exportJson, downloadText } from '../lib/storage'
import { clamp } from '../lib/date'
import { type AppData } from '../lib/types'

export function SettingsView(props: {
  data: AppData
  onImport: (next: AppData) => void
  onReset: () => void
}) {
  const { data, onImport, onReset } = props
  const [jsonText, setJsonText] = useState('')

  function exportData() {
    downloadText('stickertally_backup.json', exportJson(data), 'application/json')
    pushToast({ kind: 'success', title: 'Exported', message: 'stickertally_backup.json' })
  }

  function doImport() {
    try {
      const parsed = JSON.parse(jsonText)
      if (!parsed || typeof parsed !== 'object' || parsed.version !== 1) {
        pushToast({ kind: 'error', title: 'Invalid file', message: 'Expected version 1 app data.' })
        return
      }
      onImport(parsed as AppData)
      setJsonText('')
    } catch {
      pushToast({ kind: 'error', title: 'Invalid JSON', message: 'Paste a full export JSON.' })
    }
  }

  return (
    <div className="grid">
      <section className="panel panel--paper">
        <header className="panel__hd">
          <h2>Settings</h2>
          <p className="muted">Backups, button labels, and privacy.</p>
        </header>

        <div className="card card--clip">
          <h3 className="h3">Quick buttons</h3>
          <div className="formrow">
            <label className="grow">
              <span>Correct label</span>
              <input
                value={data.settings.quickButtons.correctLabel}
                onChange={(e) =>
                  props.onImport({
                    ...data,
                    settings: { ...data.settings, quickButtons: { ...data.settings.quickButtons, correctLabel: e.target.value } },
                  })
                }
              />
            </label>
            <label className="grow">
              <span>Incorrect label</span>
              <input
                value={data.settings.quickButtons.incorrectLabel}
                onChange={(e) =>
                  props.onImport({
                    ...data,
                    settings: { ...data.settings, quickButtons: { ...data.settings.quickButtons, incorrectLabel: e.target.value } },
                  })
                }
              />
            </label>
          </div>
          <p className="muted">If you prefer “+1” and “0”, set those here.</p>
        </div>

        <div className="card card--clip">
          <h3 className="h3">Motion</h3>
          <label className="check">
            <input
              type="checkbox"
              checked={data.settings.reducedMotion}
              onChange={(e) =>
                props.onImport({ ...data, settings: { ...data.settings, reducedMotion: e.target.checked } })
              }
            />
            <span>Reduce motion</span>
          </label>
        </div>

        <div className="card card--clip">
          <h3 className="h3">Default session length</h3>
          <label>
            <span>Minutes (for documentation/export)</span>
            <input
              type="number"
              min={5}
              max={180}
              value={data.settings.defaultSessionMinutes}
              onChange={(e) =>
                props.onImport({
                  ...data,
                  settings: { ...data.settings, defaultSessionMinutes: clamp(Number(e.target.value || 30), 5, 180) },
                })
              }
            />
          </label>
          <p className="muted">The Session timer is live; this sets a clinic-default you can reference.</p>
        </div>
      </section>

      <section className="panel panel--paper">
        <header className="panel__hd">
          <h2>Backups & import</h2>
          <p className="muted">Everything is stored in your browser localStorage.</p>
        </header>

        <div className="card">
          <div className="actions">
            <button className="btn btn--primary" onClick={exportData}>
              Export backup JSON
            </button>
            <button className="btn btn--danger" onClick={onReset}>
              Reset all data
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="h3">Import JSON</h3>
          <label className="full">
            <span>Paste exported JSON</span>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={10}
              placeholder={`{\n  "version": 1,\n  ...\n}`}
            />
          </label>
          <div className="actions">
            <button className="btn btn--primary" onClick={doImport} disabled={!jsonText.trim()}>
              Import
            </button>
            <button className="btn btn--ghost" onClick={() => setJsonText('')}>
              Clear
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="h3">Privacy note</h3>
          <p className="muted">
            This is a lightweight, local tool — not an EHR. If you enter PHI, it stays on this device, but you’re still
            responsible for your organization’s compliance requirements.
          </p>
        </div>
      </section>
    </div>
  )
}
