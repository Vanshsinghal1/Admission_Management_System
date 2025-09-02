import { Router } from 'express';
import Application from '../models/Application.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();

// All admin routes protected
r.use(requireAuth(['admin']));

// List applications (filters + pagination)
r.get('/applications', async (req, res) => {
  const { status, course, q, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (course) filter['program.course'] = course;
  if (q) filter['personal.fullName'] = { $regex: q, $options: 'i' };

  const apps = await Application.find(filter)
    .sort('-createdAt')
    .skip((Number(page)-1)*Number(limit))
    .limit(Number(limit));

  res.json(apps);
});

// Get single application (full details)
r.get('/applications/:id', async (req, res) => {
  const app = await Application.findById(req.params.id);
  if (!app) return res.status(404).json({ message: 'Application not found' });
  res.json(app);
});

// Update application status
r.patch('/applications/:id/status', async (req, res) => {
  const { status } = req.body;
  const a = await Application.findByIdAndUpdate(
    req.params.id, 
    { status }, 
    { new: true }
  );
  if (!a) return res.status(404).json({ message: 'Application not found' });
  res.json(a);
});

// Update a document (by index in path)
r.patch('/applications/:id/docs/:index', async (req, res) => {
  const { index } = req.params;
  const { status, note } = req.body;
  const a = await Application.findById(req.params.id);
  if (!a) return res.status(404).json({ message: 'Application not found' });

  const i = Number(index);
  if (!a.documents?.[i]) return res.status(400).json({ message: 'Document index invalid' });

  if (status) a.documents[i].status = status;         // 'pending' | 'verified' | 'rejected'
  if (note !== undefined) a.documents[i].note = note;

  await a.save();
  res.json(a);
});

// ✅ Enable/Disable payment gate
r.patch('/applications/:id/enable-payment', async (req, res) => {
  const { allowed } = req.body; // boolean
  const a = await Application.findById(req.params.id);
  if (!a) return res.status(404).json({ message: 'Application not found' });

  a.fee = a.fee || {};
  a.fee.isPaymentEnabled = !!allowed;

  // optional: nudge status
  if (allowed && a.status === 'under-review') {
    a.status = 'submitted'; // ya "ready-to-pay" agar enum me add karna ho to
  }
  await a.save();

  res.json({ message: `Payment ${allowed ? 'enabled' : 'disabled'}`, app: a });
});

export default r;
