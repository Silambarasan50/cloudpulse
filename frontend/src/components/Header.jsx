import { Activity, Plus } from 'lucide-react'

const STATUS_STYLES = {
  connected: { dot: 'bg-emerald-400', label: 'Live WebSocket Connected' },
  reconnecting: { dot: 'bg-amber-400', label: 'Reconnecting…' },
  connecting: { dot: 'bg-amber-400', label: 'Connecting…' },
  disconnected: { dot: 'bg-rose-500', label: 'Disconnected' },
}

export default function Header({ connectionStatus, onAdd }) {
  const { dot, label } = STATUS_STYLES[connectionStatus] ?? STATUS_STYLES.disconnected

  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Activity className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">CloudPulse</h1>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${dot} animate-pulse`} />
              <span className="text-xs text-slate-400">{label}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onAdd}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
        >
          <Plus className="h-4 w-4" />
          Add Target
        </button>
      </div>
    </header>
  )
}
