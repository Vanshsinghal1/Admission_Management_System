import { Router } from 'express'
import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'
import Application from '../models/Application.js'

const r = Router()

r.get('/:applicationId.pdf', async (req, res) => {
  const a = await Application.findById(req.params.applicationId).populate('user')
  if (!a) return res.status(404).send('Not found')

  const doc = new PDFDocument({ size: [350, 220], margin: 12 })
  res.setHeader('Content-Type', 'application/pdf')
  doc.pipe(res)

  doc.roundedRect(5, 5, 340, 210, 12).stroke()
  doc.fontSize(14).text('COLLEGE NAME', 14, 12)
  doc.fontSize(10).text('Virtual Student ID', 14, 30)

  if (a.personal?.photoUrl) {
    try { doc.image(a.personal.photoUrl, 16, 56, { width: 60, height: 72, fit: [60,72] }) } catch {}
  }

  doc.fontSize(12).text(a.personal?.fullName || a.user.name, 90, 60)
  doc.fontSize(10).text(`Program: ${a.program?.course || '-'}`, 90, 78)
  doc.text(`App ID: ${a._id}`, 90, 94)

  const qrData = `${process.env.CLIENT_URL}/id/verify/${a._id}`
  const qr = await QRCode.toDataURL(qrData)
  doc.image(qr, 260, 56, { width: 70, height: 70 })

  doc.fontSize(8).text('This is a digitally generated ID for verification only.', 14, 180)
  doc.end()
})

export default r
