import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Gauge, Globe, TrendingUp } from 'lucide-react'
import {
  createEndpoint,
  deleteEndpoint,
  getEndpoint,
  getEndpoints,
  toggleEndpoint,
} from './services/api'
import { useMetricsHub } from './services/useMetricsHub'
import Header from './components/Header'
import MetricCard from './components/MetricCard'
import LatencyChart from './components/LatencyChart'
import EndpointCard from './components/EndpointCard'
import AddEndpointModal from './components/AddEndpointModal'

const MERGE_WINDOW_MS = 2000
const MAX_CHART_ROWS = 80
const HISTORY_SEED_COUNT = 20

function appendChartPoint(rows, endpointId, timestampMs, responseMs) {
  const label = new Date(timestampMs).toLocaleTimeString()
  const last = rows[rows.length - 1]
  const next =
    last && timestampMs - last.t < MERGE_WINDOW_MS
      ? [...rows.slice(0, -1), { ...last, [endpointId]: responseMs }]
      : [...rows, { t: timestampMs, label, [endpointId]: responseMs }]
  return next.slice(-MAX_CHART_ROWS)
}

function summarizeLogs(logs) {
  const total = logs.length
  const success = logs.filter((l) => l.isSuccess).length
  return { success, total }
}

export default function App() {
  const [endpoints, setEndpoints] = useState([])
  const [chartData, setChartData] = useState([])
  const [checkStats, setCheckStats] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const list = await getEndpoints()
        if (cancelled) return
        setEndpoints(list)

        const details = await Promise.allSettled(list.map((e) => getEndpoint(e.id)))
        if (cancelled) return

        let rows = []
        const stats = {}
        details.forEach((result, i) => {
          if (result.status !== 'fulfilled') return
          const endpointId = list[i].id
          const logs = result.value.recentLogs.slice(0, HISTORY_SEED_COUNT).reverse()
          stats[endpointId] = summarizeLogs(result.value.recentLogs)
          for (const log of logs) {
            rows = appendChartPoint(
              rows,
              endpointId,
              Date.parse(log.checkedAtUtc),
              log.responseTimeMs,
            )
          }
        })
        rows.sort((a, b) => a.t - b.t)
        setChartData(rows)
        setCheckStats(stats)
      } catch {
        if (!cancelled) setLoadError('Could not reach the CloudPulse API.')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleMetric = useCallback((metric) => {
    const ts = Date.parse(metric.timestamp)

    setEndpoints((prev) => {
      const exists = prev.some((e) => e.id === metric.endpointId)
      if (!exists) {
        getEndpoints().then(setEndpoints).catch(() => {})
        return prev
      }
      return prev.map((e) =>
        e.id === metric.endpointId
          ? {
              ...e,
              lastStatusCode: metric.statusCode,
              lastIsSuccess: metric.isSuccess,
              lastResponseTimeMs: metric.responseTimeMs,
              lastCheckedAtUtc: metric.timestamp,
            }
          : e,
      )
    })

    setChartData((rows) =>
      appendChartPoint(rows, metric.endpointId, ts, metric.responseTimeMs),
    )

    setCheckStats((prev) => {
      const current = prev[metric.endpointId] ?? { success: 0, total: 0 }
      return {
        ...prev,
        [metric.endpointId]: {
          success: current.success + (metric.isSuccess ? 1 : 0),
          total: current.total + 1,
        },
      }
    })
  }, [])

  const connectionStatus = useMetricsHub(handleMetric)

  const handleToggle = async (id, isActive) => {
    await toggleEndpoint(id, isActive)
    setEndpoints((prev) => prev.map((e) => (e.id === id ? { ...e, isActive } : e)))
  }

  const handleDelete = async (id) => {
    await deleteEndpoint(id)
    setEndpoints((prev) => prev.filter((e) => e.id !== id))
    setCheckStats((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const handleCreate = async (data) => {
    const created = await createEndpoint(data)
    setEndpoints((prev) => [...prev, created])
    setCheckStats((prev) => ({ ...prev, [created.id]: { success: 0, total: 0 } }))
  }

  const totalEndpoints = endpoints.length
  const healthyCount = endpoints.filter((e) => e.isActive && e.lastIsSuccess).length
  const { success, total } = Object.values(checkStats).reduce(
    (acc, s) => ({ success: acc.success + s.success, total: acc.total + s.total }),
    { success: 0, total: 0 },
  )
  const uptime = total > 0 ? `${((success / total) * 100).toFixed(1)}%` : '—'
  const latencies = endpoints
    .map((e) => e.lastResponseTimeMs)
    .filter((v) => v != null)
  const avgLatency =
    latencies.length > 0
      ? `${Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)} ms`
      : '—'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header connectionStatus={connectionStatus} onAdd={() => setShowModal(true)} />

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        {loadError && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {loadError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Monitored Endpoints"
            value={totalEndpoints}
            note="Services under watch"
            icon={Globe}
            accent="text-sky-400"
          />
          <MetricCard
            label="Healthy Services"
            value={healthyCount}
            note="Responding as expected"
            icon={CheckCircle2}
            accent="text-emerald-400"
          />
          <MetricCard
            label="System Uptime"
            value={uptime}
            note="Successful checks observed"
            icon={TrendingUp}
            accent="text-violet-400"
          />
          <MetricCard
            label="Avg Latency"
            value={avgLatency}
            note="Across latest probes"
            icon={Gauge}
            accent="text-amber-400"
          />
        </div>

        <LatencyChart data={chartData} endpoints={endpoints} />

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Endpoints
          </h2>
          {endpoints.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-800 text-sm text-slate-500">
              No endpoints yet — add your first target to start monitoring.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {endpoints.map((ep) => (
                <EndpointCard
                  key={ep.id}
                  endpoint={ep}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {showModal && (
        <AddEndpointModal onClose={() => setShowModal(false)} onSubmit={handleCreate} />
      )}
    </div>
  )
}
