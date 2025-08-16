import mongoose from 'mongoose'

const docSchema = new mongoose.Schema({
  kind: String,
  url: String,
  status: { type: String, enum: ['pending','verified','rejected'], default: 'pending' },
  note: String,
}, { _id: false })

const appSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  personal: {
    fullName: String,
    dob: String,
    gender: String,
    phone: String,
    photoUrl: String,
  },
  academic: {
    tenthPercent: Number,
    twelfthPercent: Number,
    board: String,
  },
  program: { course: String, branch: String, quota: String },
  documents: [docSchema],
  fee: {
    amount: Number,
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['unpaid','processing','paid','failed'], default: 'unpaid' },
    orderId: String,
    paymentId: String
  },
  status: { type: String, enum: ['draft','submitted','under-review','approved','rejected'], default: 'draft' },
}, { timestamps: true })

export default mongoose.model('Application', appSchema)

