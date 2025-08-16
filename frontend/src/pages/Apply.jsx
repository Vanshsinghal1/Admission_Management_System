import { useState } from 'react'
import Stepper from '../components/Stepper'
import { api, USE_MOCK } from '../lib/api'
import { mockCreateApplication, mockUpload } from '../lib/mock'

const initial = {
  personal: { fullName: '', dob: '', gender: '', phone: '' },
  academic: { tenthPercent: '', twelfthPercent: '', board: '' },
  program: { course: '', branch: '', quota: '' },
  documents: { photo: null, marksheet: null, aadhar: null }
}

export default function Apply() {
  const [data, setData] = useState(initial)
  const [step, setStep] = useState(0)
  const steps = ['Personal', 'Academic', 'Program', 'Documents', 'Review']

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1))
  const prev = () => setStep(s => Math.max(s - 1, 0))

  const handleChange = (section, field, value) => {
    setData(d => ({ ...d, [section]: { ...d[section], [field]: value } }))
  }

  const handleFile = (field, file) => {
    setData(d => ({ ...d, documents: { ...d.documents, [field]: file } }))
  }

  const submit = async () => {
    try {
      if (USE_MOCK) {
        const payload = {
          personal: data.personal,
          academic: data.academic,
          program: data.program
        }
        const res = await mockCreateApplication(payload)
        alert('Application submitted (mock). Now pay fee and check status.')
      } else {
        const { data: created } = await api.post('/applications', {
          personal: data.personal,
          academic: data.academic,
          program: data.program,
        })
        // Upload docs (optional if backend ready)
        const docs = ['photo','marksheet','aadhar']
        for (const k of docs) {
          if (data.documents[k]) {
            const fd = new FormData()
            fd.append('file', data.documents[k])
            fd.append('kind', k)
            await api.post(`/documents/${created._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
          }
        }
        await api.patch(`/applications/${created._id}/submit`)
        alert('Application submitted successfully!')
      }
    } catch (e) {
      console.error(e)
      alert(e?.response?.data?.message || 'Submission failed')
    }
  }

  return (
    <div className="max-w-3xl mx-auto card p-6">
      <h1 className="text-xl font-semibold">Admission Form</h1>
      <Stepper steps={steps} current={step} />

      {step === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="label">Full Name</label><input className="input" value={data.personal.fullName} onChange={e => handleChange('personal','fullName', e.target.value)} /></div>
          <div><label className="label">Date of Birth</label><input className="input" type="date" value={data.personal.dob} onChange={e => handleChange('personal','dob', e.target.value)} /></div>
          <div><label className="label">Gender</label><select className="input" value={data.personal.gender} onChange={e => handleChange('personal','gender', e.target.value)}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></div>
          <div><label className="label">Phone</label><input className="input" value={data.personal.phone} onChange={e => handleChange('personal','phone', e.target.value)} /></div>
        </div>
      )}

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="label">10th %</label><input className="input" value={data.academic.tenthPercent} onChange={e => handleChange('academic','tenthPercent', e.target.value)} /></div>
          <div><label className="label">12th %</label><input className="input" value={data.academic.twelfthPercent} onChange={e => handleChange('academic','twelfthPercent', e.target.value)} /></div>
          <div><label className="label">Board</label><input className="input" value={data.academic.board} onChange={e => handleChange('academic','board', e.target.value)} /></div>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="label">Course</label><select className="input" value={data.program.course} onChange={e => handleChange('program','course', e.target.value)}><option value="">Select</option><option>B.Tech CSE</option><option>B.Tech ECE</option><option>BBA</option></select></div>
          <div><label className="label">Branch</label><input className="input" value={data.program.branch} onChange={e => handleChange('program','branch', e.target.value)} /></div>
          <div><label className="label">Quota</label><select className="input" value={data.program.quota} onChange={e => handleChange('program','quota', e.target.value)}><option value="">Select</option><option>General</option><option>Management</option><option>Sports</option></select></div>
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="label">Photo</label><input className="input" type="file" onChange={e => handleFile('photo', e.target.files?.[0])} /></div>
          <div><label className="label">Marksheet</label><input className="input" type="file" onChange={e => handleFile('marksheet', e.target.files?.[0])} /></div>
          <div><label className="label">Aadhar</label><input className="input" type="file" onChange={e => handleFile('aadhar', e.target.files?.[0])} /></div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3">
          <div className="card p-4">
            <h3 className="font-semibold mb-2">Personal</h3>
            <pre className="text-sm">{JSON.stringify(data.personal, null, 2)}</pre>
          </div>
          <div className="card p-4">
            <h3 className="font-semibold mb-2">Academic</h3>
            <pre className="text-sm">{JSON.stringify(data.academic, null, 2)}</pre>
          </div>
          <div className="card p-4">
            <h3 className="font-semibold mb-2">Program</h3>
            <pre className="text-sm">{JSON.stringify(data.program, null, 2)}</pre>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button className="btn-outline" onClick={prev} disabled={step===0}>Back</button>
        {step < steps.length - 1 ? (
          <button className="btn-primary" onClick={next}>Next</button>
        ) : (
          <button className="btn-primary" onClick={submit}>Submit Application</button>
        )}
      </div>
    </div>
  )
}
