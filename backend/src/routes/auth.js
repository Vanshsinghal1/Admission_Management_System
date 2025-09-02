import { Router } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const r = Router()

// ========================
// Register
// ========================
r.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing fields' })
    }

    const exists = await User.findOne({ email })
    if (exists) {
      return res.status(409).json({ message: 'Email already in use' })
    }

    const user = await User.create({ name, email, password })

    res.json({
      message: 'Registered successfully',
      user: { id: user._id, name: user.name, email: user.email }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// ========================
// Login
// ========================
r.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.cookie(process.env.COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax'
    })

    res.json({
      message: 'Logged in',
      user: { id: user._id, name: user.name, role: user.role }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// ========================
// Me (check current user)
// ========================
r.get('/me', (req, res) => {
  try {
    const token = req.cookies?.[process.env.COOKIE_NAME]
    if (!token) return res.status(401).json({ message: 'Unauthenticated' })

    const payload = jwt.verify(token, process.env.JWT_SECRET)
    res.json({ user: payload })
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
})

// ========================
// Logout
// ========================
r.post('/logout', (req, res) => {
  res.clearCookie(process.env.COOKIE_NAME)
  res.json({ message: 'Logged out' })
})

export default r
