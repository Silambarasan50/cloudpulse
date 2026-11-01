import { useState } from 'react'
import { X } from 'lucide-react'

const isValidUrl = (value) => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export default function AddEndpointModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    url: '',
    expectedStatusCode: 200,
    checkIntervalSeconds: 30,
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!isValidUrl(form.url)) next.url = 'Enter a valid http(s) URL'
    const status = Number(form.expectedStatusCode)
    if (!Number.isInteger(status) || status < 100 || status > 599)
      next.expectedStatusCode = 'Must be 100–599'
    const interval = Number(form.checkIntervalSeconds)
    if (!Number.isInteger(interval) || interval < 5 || interval > 86400)
      next.checkIntervalSeconds = 'Must be 5–86400 seconds'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit({
        name: form.name.trim(),
        url: form.url.trim(),
        expectedStatusCode: Number(form.expectedStatusCode),
        checkIntervalSeconds: Number(form.checkIntervalSeconds),
      })
      onClose()
    } catch (err) {
      setSubmitError(
        err.response?.data?.title ?? err.message ?? 'Failed to create endpoint',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (hasError) =>
    `w-full rounded-lg border bg-slate-800/60 px-3 py-2 text-sm outline-none transition focus:border-emerald-500/60 ${
      hasError ? 'border-rose-500/60' : 'border-slate-700'
    }`

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold">Add New Endpoint</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Endpoint Name
            </label>
            <input
              className={inputClass(errors.name)}
              placeholder="Payments API"
              value={form.name}
              onChange={set('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">URL</label>
            <input
              className={inputClass(errors.url)}
              placeholder="https://api.example.com/health"
              value={form.url}
              onChange={set('url')}
            />
            {errors.url && <p className="mt-1 text-xs text-rose-400">{errors.url}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                Expected Status
              </label>
              <input
                type="number"
                className={inputClass(errors.expectedStatusCode)}
                value={form.expectedStatusCode}
                onChange={set('expectedStatusCode')}
              />
              {errors.expectedStatusCode && (
                <p className="mt-1 text-xs text-rose-400">{errors.expectedStatusCode}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                Interval (sec)
              </label>
              <input
                type="number"
                className={inputClass(errors.checkIntervalSeconds)}
                value={form.checkIntervalSeconds}
                onChange={set('checkIntervalSeconds')}
              />
              {errors.checkIntervalSeconds && (
                <p className="mt-1 text-xs text-rose-400">{errors.checkIntervalSeconds}</p>
              )}
            </div>
          </div>

          {submitError && (
            <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
              {submitError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {submitting ? 'Adding…' : 'Add Endpoint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
