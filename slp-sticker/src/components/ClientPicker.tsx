import { type Client } from '../lib/types'

export function ClientPicker(props: {
  clients: Client[]
  activeClient: Client | null
  onPickClient: (id: string) => void
  disabled?: boolean
}) {
  const { clients, activeClient, onPickClient, disabled } = props

  return (
    <label className="clientpick">
      <span className="clientpick__label">Active</span>
      <select
        className="clientpick__select"
        value={activeClient?.id ?? ''}
        onChange={(e) => onPickClient(e.target.value)}
        disabled={disabled}
        aria-label="Pick active client"
      >
        {clients.length === 0 ? (
          <option value="">No clients yet</option>
        ) : (
          clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))
        )}
      </select>
    </label>
  )
}
