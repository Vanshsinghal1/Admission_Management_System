import { Router } from 'express'
import Application from '../models/Application.js'
import { requireAuth } from '../middleware/auth.js'

const r = Router()

r.post('/', requireAuth(['student']), async (req, res) => {
  const data = req.body || {}
  const a = await Application.create({ user: req.user.id, ...data, status: 'submitted' })
  res.json(a)
})

r.get('/me', requireAuth(['student']), async (req, res) => {
  const a = await Application.findOne({ user: req.user.id })
  res.json(a)
})

r.patch('/:id/submit', requireAuth(['student']), async (req, res) => {
  const a = await Application.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { status: 'submitted' }, { new: true })
  res.json(a)
})

export default r
