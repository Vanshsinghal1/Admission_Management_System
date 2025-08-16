import { Router } from 'express'
import Application from '../models/Application.js'
import { requireAuth } from '../middleware/auth.js'

const r = Router()

r.get('/applications', requireAuth(['admin']), async (req, res) => {
  const { status, course, q, page = 1, limit = 20 } = req.query
  const filter = {}
  if (status) filter.status = status
  if (course) filter['program.course'] = course
  if (q) filter['personal.fullName'] = { $regex: q, $options: 'i' }
  const apps = await Application.find(filter)
    .sort('-createdAt')
    .skip((Number(page)-1)*Number(limit))
    .limit(Number(limit))
  res.json(apps)
})

r.patch('/applications/:id/status', requireAuth(['admin']), async (req, res) => {
  const { status } = req.body
  const a = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true })
  res.json(a)
})

r.patch('/applications/:id/document', requireAuth(['admin']), async (req, res) => {
  const { index, status, note } = req.body
  const a = await Application.findById(req.params.id)
  if (!a) return res.status(404).json({ message: 'Application not found' })
  if (!a.documents[index]) return res.status(400).json({ message: 'Document index invalid' })
  a.documents[index].status = status
  a.documents[index].note = note
  await a.save()
  res.json(a)
})

export default r
