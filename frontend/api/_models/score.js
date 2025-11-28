const mongoose = require('mongoose')

const ScoreSchema = new mongoose.Schema({
  name: { type: String, default: 'Anonymous' },
  score: { type: Number, required: true },
  accuracy: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.models.Score || mongoose.model('Score', ScoreSchema)
