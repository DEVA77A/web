import mongoose from 'mongoose'

const UserProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  username: { type: String, required: true },
  highestScore: { type: Number, default: 0 },
  totalGames: { type: Number, default: 0 },
  totalAccuracy: { type: Number, default: 0 },
  gamesPlayed: { type: Number, default: 0 },
  loginStreak: { type: Number, default: 0 },
  lastLogin: { type: Date },
  firstLogin: { type: Date, default: Date.now }
}, { timestamps: true })

export default mongoose.models.UserProfile || mongoose.model('UserProfile', UserProfileSchema)
