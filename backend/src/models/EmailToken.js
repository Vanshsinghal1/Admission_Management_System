import mongoose from 'mongoose'

const emailTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  token: String,
  expiresAt: Date,
})
emailTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
export default mongoose.model('EmailToken', emailTokenSchema)
