import mongoose from 'mongoose'

const ScoreSchema = new mongoose.Schema({
  name: { type: String, default: 'Anonymous' },
  score: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  level: { type: Number, default: 1 }
}, { timestamps: true })

export default mongoose.models.Score || mongoose.model('Score', ScoreSchema)
