import mongoose from 'mongoose'

const ScoreSchema = new mongoose.Schema({
  name: { type: String, default: 'Anonymous' },
  userId: { type: String, index: true }, // Link scores to users
  score: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  round: { type: Number, default: 1 }
}, { timestamps: true })

export default mongoose.models.Score || mongoose.model('Score', ScoreSchema)
