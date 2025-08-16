import { Router } from 'express'
import { upload } from '../middleware/multer.js'
import cloudinary from '../config/cloudinary.js'
import Application from '../models/Application.js'
import { requireAuth } from '../middleware/auth.js'

const r = Router()

r.post('/:applicationId', requireAuth(['student','admin']), upload.single('file'), async (req, res) => {
  const { applicationId } = req.params
  const { kind } = req.body
  if (!req.file) return res.status(400).json({ message: 'No file' })
  try {
    // convert buffer to data URI and upload (works for cloudinary)
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
    const result = await cloudinary.uploader.upload(dataUri, { folder: 'admission-docs', resource_type: 'auto' })
    const app = await Application.findById(applicationId)
    if (!app) return res.status(404).json({ message: 'Application not found' })
    app.documents.push({ kind, url: result.secure_url })
    await app.save()
    res.json({ url: result.secure_url })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Upload failed' })
  }
})

export default r
