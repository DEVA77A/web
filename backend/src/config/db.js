import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.log('No MONGODB_URI provided — running in no-db fallback mode')
    return null
  }

  try {
    await mongoose.connect(uri, { autoIndex: true })
    console.log('MongoDB connected')
    return mongoose.connection
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
    return null
  }
}

export default connectDB
