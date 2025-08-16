import { useState } from 'react'

export default function VirtualID() {
  const [appId, setAppId] = useState('app_mock_1')

  return (
    <div className="max-w-md mx-auto card p-6">
      <h1 className="text-xl font-semibold">Virtual Student ID</h1>
      <p className="text-sm text-gray-600 mt-2">Enter Application ID to view the PDF ID (served by backend).</p>
      <div className="mt-3 flex gap-2">
        <input className="input" value={appId} onChange={e => setAppId(e.target.value)} placeholder="Application ID" />
        <a className="btn-outline" href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/id/${appId}.pdf`} target="_blank" rel="noreferrer">Open PDF</a>
      </div>
      <p className="text-xs text-gray-500 mt-3">In mock mode, this link will 404 until backend is connected.</p>
    </div>
  )
}
