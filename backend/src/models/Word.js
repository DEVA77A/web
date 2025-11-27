import mongoose from 'mongoose'

const WordSchema = new mongoose.Schema({
  text: { type: String, required: true },
  level: { type: Number, default: 1 }
})

export default mongoose.models.Word || mongoose.model('Word', WordSchema)
