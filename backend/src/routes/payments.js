import { Router } from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import Application from '../models/Application.js'
import { requireAuth } from '../middleware/auth.js'

const r = Router()

const enabled = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
const rp = enabled ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET }) : null

r.post('/order', requireAuth(['student']), async (req, res) => {
  if (!enabled) return res.status(503).json({ message: 'Razorpay not configured' })
  const { applicationId, amount } = req.body
  const app = await Application.findById(applicationId)
  if (!app) return res.status(404).json({ message: 'Application not found' })
  const order = await rp.orders.create({ amount, currency: 'INR', receipt: String(app._id) })
  app.fee = { amount: amount/100, currency: 'INR', status: 'processing', orderId: order.id }
  await app.save()
  res.json(order)
})

r.post('/verify', requireAuth(['student']), async (req, res) => {
  if (!enabled) return res.status(503).json({ message: 'Razorpay not configured' })
  const { applicationId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
  const body = `${razorpay_order_id}|${razorpay_payment_id}`
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex')
  if (expected !== razorpay_signature) return res.status(400).json({ message: 'Signature mismatch' })
  const app = await Application.findById(applicationId)
  if (!app) return res.status(404).json({ message: 'Application not found' })
  app.fee.status = 'paid'
  app.fee.paymentId = razorpay_payment_id
  app.status = 'under-review'
  await app.save()
  res.json({ message: 'Payment verified' })
})

export default r
