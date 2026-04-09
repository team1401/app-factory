import { type AppData } from './types'

const KEY = 'stickertally.appdata.v1'

export function createEmptyData(): AppData {
  return {
    version: 1,
    goals: [],
    clients: [],
    sessions: [],
    settings: {
      defaultSessionMinutes: 30,
      quickButtons: { correctLabel: '✓ Correct', incorrectLabel: '✕ Not yet' },
      reducedMotion: false,
    },
  }
}

export function loadAppData(): AppData | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)

    // Minimal runtime validation + migration guard
    if (!parsed || typeof parsed !== 'object') return null
    if (parsed.version !== 1) return null
    if (!Array.isArray(parsed.clients) || !Array.isArray(parsed.goals) || !Array.isArray(parsed.sessions)) return null

    return parsed as AppData
  } catch {
    return null
  }
}

export function saveAppData(data: AppData) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function exportJson(data: AppData) {
  return JSON.stringify(data, null, 2)
}

export function downloadText(filename: string, text: string, mime = 'text/plain') {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 500)
}
