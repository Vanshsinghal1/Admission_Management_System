import { useEffect, useState } from 'react'
import { api, USE_MOCK } from '../lib/api'
import { mockAdminList } from '../lib/mock'

export default function Admin() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ q: '', status: '' })

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        if (USE_MOCK) {
          const data = await mockAdminList()
          setRows(data)
        } else {
          const { data } = await api.get('/admin/applications', { params: filters })
          setRows(data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [filters.q, filters.status])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      <div className="card p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="label">Search</label>
          <input className="input" value={filters.q} onChange={e => setFilters(f => ({ ...f, q: e.target.value }))} placeholder="Name, email..." />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">All</option>
            <option value="submitted">submitted</option>
            <option value="under-review">under-review</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
          </select>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Application ID</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Course</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-3 text-gray-500" colSpan="5">Loading...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="p-3 text-gray-500" colSpan="5">No records</td></tr>
            ) : rows.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.id}</td>
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.course}</td>
                <td className="p-3"><span className="badge-yellow">{r.status}</span></td>
                <td className="p-3">
                  <button className="btn-outline mr-2">Verify Docs</button>
                  <button className="btn-primary">Approve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
