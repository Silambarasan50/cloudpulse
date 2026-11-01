import { useEffect, useState } from 'react'
import { Globe, Pause, Play, Trash2 } from 'lucide-react'

function StatusBadge({ endpoint }) {
  if (!endpoint.isActive) {
    return (
      <span className="rounded-full bg-slate-700/50 px-2.5 py-1 text-xs font-medium text-slate-400">
        Paused
      </span>
    )
  }
  if (endpoint.lastStatusCode == null) {
    return (
      <span className="rounded-full bg-slate-700/50 px-2.5 py-1 text-xs font-medium text-slate-400">
        Pending
      </span>
    )
  }
  if (endpoint.lastIsSuccess) {
    return (
      <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
        {endpoint.lastStatusCode} OK
      </span>
    )
  }
  return (
    <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-400">
      {endpoint.lastStatusCode === 0 ? 'Unreachable' : `${endpoint.lastStatusCode} Degraded`}
    </span>
  )
}

export default function EndpointCard({ endpoint, onToggle, onDelete }) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!confirming) return
    const timer = setTimeout(() => setConfirming(false), 3000)
    return () => clearTimeout(timer)
  }, [confirming])

  const handleToggle = async () => {
    setBusy(true)
    try {
      await onToggle(endpoint.id, !endpoint.isActive)
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true)
      return
    }
    setBusy(true)
    try {
      await onDelete(endpoint.id)
    } finally {
      setBusy(false)
      setConfirming(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
            <Globe className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{endpoint.name}</h3>
            <p className="truncate text-xs text-slate-500">{endpoint.url}</p>
          </div>
        </div>
        <StatusBadge endpoint={endpoint} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-slate-800/50 px-2 py-2">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Latency</p>
          <p className="text-sm font-semibold">
            {endpoint.lastResponseTimeMs != null
              ? `${Math.round(endpoint.lastResponseTimeMs)} ms`
              : '—'}
          </p>
        </div>
        <div className="rounded-lg bg-slate-800/50 px-2 py-2">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Interval</p>
          <p className="text-sm font-semibold">{endpoint.checkIntervalSeconds}s</p>
        </div>
        <div className="rounded-lg bg-slate-800/50 px-2 py-2">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Last Check</p>
          <p className="text-sm font-semibold">
            {endpoint.lastCheckedAtUtc
              ? new Date(endpoint.lastCheckedAtUtc).toLocaleTimeString()
              : '—'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={handleToggle}
          disabled={busy}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
        >
          {endpoint.isActive ? (
            <>
              <Pause className="h-3.5 w-3.5" /> Pause
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" /> Resume
            </>
          )}
        </button>
        <button
          onClick={handleDelete}
          disabled={busy}
          className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
            confirming
              ? 'bg-rose-500 text-slate-950 hover:bg-rose-400'
              : 'border border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {confirming ? 'Confirm?' : 'Delete'}
        </button>
      </div>
    </div>
  )
}
