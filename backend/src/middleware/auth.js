import jwt from 'jsonwebtoken'

export const requireAuth = (roles = []) => (req, res, next) => {
  try {
    const token = req.cookies?.[process.env.COOKIE_NAME]
    if (!token) return res.status(401).json({ message: 'Unauthenticated' })
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    if (roles.length && !roles.includes(payload.role)) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    req.user = payload
    next()
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}
