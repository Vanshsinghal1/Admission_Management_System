import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import User from '../models/User.js'
import EmailToken from '../models/EmailToken.js'
import { sendMail } from '../utils/email.js'

const r = Router()

r.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' })
  const exists = await User.findOne({ email })
  if (exists) return res.status(409).json({ message: 'Email in use' })
  const user = await User.create({ name, email, password })
  const token = nanoid(32)
  const expiresAt = new Date(Date.now() + 1000*60*30) // 30 min
  await EmailToken.create({ user: user._id, token, expiresAt })
  const link = `${process.env.CLIENT_URL}/auth/verify?token=${token}`
  await sendMail(email, 'Verify your email', `Click to verify: ${link}`)
  res.json({ message: 'Registered. Check email to verify.' })
})

r.get('/verify', async (req, res) => {
  const { token } = req.query
  const et = await EmailToken.findOne({ token })
  if (!et) return res.status(400).json({ message: 'Invalid or expired token' })
  await User.findByIdAndUpdate(et.user, { emailVerified: true })
  await et.deleteOne()
  res.json({ message: 'Email verified' })
})

r.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user || !(await user.checkPassword(password))) return res.status(401).json({ message: 'Invalid credentials' })
  if (!user.emailVerified) return res.status(403).json({ message: 'Verify your email first' })
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.cookie(process.env.COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax' })
  res.json({ message: 'Logged in', user: { id: user._id, name: user.name, role: user.role } })
})

r.post('/logout', (req, res) => {
  res.clearCookie(process.env.COOKIE_NAME)
  res.json({ message: 'Logged out' })
})

export default r
