import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const PALETTE = ['#34d399', '#38bdf8', '#fbbf24', '#f472b6', '#a78bfa', '#fb923c']

export const colorFor = (index) => PALETTE[index % PALETTE.length]

export default function LatencyChart({ data, endpoints }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Real-Time Latency
        </h2>
        <span className="text-xs text-slate-500">response time (ms)</span>
      </div>

      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-800 text-sm text-slate-500">
          Waiting for health checks — live data will stream in here.
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -15 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                stroke="#475569"
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                stroke="#475569"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                unit="ms"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '0.5rem',
                  fontSize: '0.8rem',
                }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(value) => [`${Math.round(value)} ms`]}
              />
              <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
              {endpoints.map((ep, i) => (
                <Line
                  key={ep.id}
                  type="monotone"
                  dataKey={String(ep.id)}
                  name={ep.name}
                  stroke={colorFor(i)}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
