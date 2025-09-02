import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connectDB } from './src/config/db.js'
import authRoutes from './src/routes/auth.js'
import applicationRoutes from './src/routes/application.js'
import documentsRoutes from './src/routes/documents.js'
import paymentsRoutes from './src/routes/payments.js'
import adminRoutes from './src/routes/admin.js'
import idRoutes from './src/routes/id.js'




const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())

app.get('/', (_, res) => res.json({ ok: true, name: 'Admission API' }))

app.use('/api/auth', authRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/documents', documentsRoutes)
app.use('/api/payments', paymentsRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/id', idRoutes)

const start = async () => {
  await connectDB()
  const port = process.env.PORT || 5000
  app.listen(port, () => console.log('API listening on :' + port))
}
start()
