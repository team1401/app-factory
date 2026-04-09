import { useEffect, useState } from 'react'

type ToastKind = 'success' | 'error' | 'info'

export type Toast = {
  id: string
  kind: ToastKind
  title: string
  message?: string
}

let listeners: Array<(t: Toast) => void> = []

export function pushToast(toast: Omit<Toast, 'id'>) {
  const t: Toast = { id: `toast_${Math.random().toString(16).slice(2)}`, ...toast }
  for (const l of listeners) l(t)
}

export function ToastHost() {
  const [items, setItems] = useState<Toast[]>([])

  useEffect(() => {
    const onToast = (t: Toast) => {
      setItems((prev) => [...prev, t].slice(-3))
      window.setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== t.id))
      }, 3200)
    }
    listeners.push(onToast)
    return () => {
      listeners = listeners.filter((x) => x !== onToast)
    }
  }, [])

  if (items.length === 0) return null

  return (
    <div className="toasts" aria-live="polite" aria-relevant="additions">
      {items.map((t) => (
        <div key={t.id} className={`toast toast--${t.kind}`} role="status">
          <div className="toast__title">{t.title}</div>
          {t.message ? <div className="toast__msg">{t.message}</div> : null}
        </div>
      ))}
    </div>
  )
}
