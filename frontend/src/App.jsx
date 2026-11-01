import { Activity, CheckCircle2, Gauge, Globe, XCircle } from 'lucide-react'

const metrics = [
  {
    label: 'Monitored Endpoints',
    value: '—',
    icon: Globe,
    accent: 'text-sky-400',
    note: 'Services under watch',
  },
  {
    label: 'Healthy',
    value: '—',
    icon: CheckCircle2,
    accent: 'text-emerald-400',
    note: 'Passing health checks',
  },
  {
    label: 'Unhealthy',
    value: '—',
    icon: XCircle,
    accent: 'text-rose-400',
    note: 'Failing or unreachable',
  },
  {
    label: 'Avg Response Time',
    value: '— ms',
    icon: Gauge,
    accent: 'text-amber-400',
    note: 'Across all endpoints',
  },
]

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Activity className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              CloudPulse <span className="text-slate-400">—</span>{' '}
              <span className="text-slate-300">Service Health Sentinel</span>
            </h1>
            <p className="text-xs text-slate-500">
              Real-time microservice health &amp; observability
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(({ label, value, icon: Icon, accent, note }) => (
            <div
              key={label}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-400">{label}</p>
                <Icon className={`h-5 w-5 ${accent}`} />
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
              <p className="mt-1 text-xs text-slate-500">{note}</p>
            </div>
          ))}
        </div>

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Endpoint Status
          </h2>
          <div className="mt-4 flex h-40 items-center justify-center rounded-lg border border-dashed border-slate-800 text-sm text-slate-500">
            Endpoints you register will appear here once monitoring begins.
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
