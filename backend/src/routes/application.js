// backend/src/routes/application.js
import { Router } from 'express';
import Application from '../models/Application.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();

// Create application (student)
r.post('/', requireAuth(['student']), async (req, res) => {
  const data = req.body || {};
  // ensure fee object + gate default
  const fee = {
    amount: data?.fee?.amount ?? 0,
    currency: data?.fee?.currency ?? 'USD',
    status: data?.fee?.status ?? 'unpaid',
    orderId: data?.fee?.orderId,
    paymentId: data?.fee?.paymentId,
    isPaymentEnabled: false, // 🔒 default locked
  };

  const doc = {
    user: req.user.id || req.user._id,
    ...data,
    fee,
    status: 'submitted',
  };

  const a = await Application.create(doc);
  res.json(a);
});

// Get current user's application
r.get('/me', requireAuth(['student']), async (req, res) => {
  const a = await Application.findOne({ user: req.user.id || req.user._id });
  if (!a) return res.status(404).json({ message: 'Application not found' });
  res.json(a);
});

// Submit (student)
r.patch('/:id/submit', requireAuth(['student']), async (req, res) => {
  const a = await Application.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id || req.user._id },
    { status: 'submitted' },
    { new: true }
  );
  if (!a) return res.status(404).json({ message: 'Application not found' });
  res.json(a);
});

export default r;
