import mongoose from 'mongoose';

const docSchema = new mongoose.Schema({
  kind: { type: String, trim: true },
  url: { type: String },
  status: { type: String, enum: ['pending','verified','rejected'], default: 'pending' },
  note: { type: String, trim: true },
}, { _id: false });

const appSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  personal: {
    fullName: { type: String, trim: true },
    dob: { type: Date },
    // ✅ normalize to lowercase so "Male"/"MALE" etc become "male"
    gender: { 
      type: String, 
      enum: ['male','female','other'],
      set: v => (typeof v === 'string' ? v.toLowerCase() : v),
      trim: true
    },
    phone: { type: String, match: /^[0-9]{10}$/ },
    photoUrl: { type: String },
  },

  academic: {
    tenthPercent: { type: Number, min: 0, max: 100 },
    twelfthPercent: { type: Number, min: 0, max: 100 },
    board: { type: String, trim: true },
  },

  program: {
    course: { type: String, trim: true },
    branch: { type: String, trim: true },
    quota: { type: String, trim: true },
  },

  documents: [docSchema],

  fee: {
    amount: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['unpaid','processing','paid','failed'], default: 'unpaid', index: true },
    orderId: { type: String, trim: true },
    paymentId: { type: String, trim: true },
    // ✅ NEW: Admin-controlled gate
    isPaymentEnabled: { type: Boolean, default: false }
  },

  status: { type: String, enum: ['draft','submitted','under-review','approved','rejected'], default: 'draft', index: true },
}, { timestamps: true });

appSchema.index({ 'personal.fullName': 1 });
appSchema.index({ 'academic.board': 1 });
appSchema.index({ createdAt: -1 });

export default mongoose.models.Application || mongoose.model('Application', appSchema);
