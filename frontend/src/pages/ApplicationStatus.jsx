import { useEffect, useState } from 'react'
import { api, USE_MOCK } from '../lib/api'
import { mockMeApplication } from '../lib/mock'

export default function ApplicationStatus() {
  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        if (USE_MOCK) {
          const a = await mockMeApplication()
          setApp(a)
        } else {
          const { data } = await api.get('/applications/me')
          setApp(data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>

  if (!app) return (
    <div className="card p-6">
      <div className="text-sm text-gray-600">No application found. Go to <a className="text-brand-700 underline" href="/apply">Apply</a>.</div>
    </div>
  )

  const badge = (status) => {
    if (status === 'paid' || status === 'approved') return 'badge-green'
    if (status === 'under-review' || status === 'submitted') return 'badge-yellow'
    return 'badge-red'
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="card p-6">
        <h1 className="text-xl font-semibold">Application Status</h1>
        <div className="mt-3 text-sm text-gray-600">Application ID: {app.id || app._id || '—'}</div>
        <div className="mt-2"><span className={`${badge(app.status)} mr-2`}>{app.status || 'draft'}</span></div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="font-semibold mb-2">Personal</h3>
          <pre className="text-xs">{JSON.stringify(app.personal, null, 2)}</pre>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold mb-2">Academic</h3>
          <pre className="text-xs">{JSON.stringify(app.academic, null, 2)}</pre>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold mb-2">Program</h3>
          <pre className="text-xs">{JSON.stringify(app.program, null, 2)}</pre>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold mb-2">Fee</h3>
          <pre className="text-xs">{JSON.stringify(app.fee || { status: 'unpaid'}, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
