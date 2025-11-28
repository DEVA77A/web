const mongoose = require('mongoose')

const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
  console.warn('MONGO_URI not set; database connections will be disabled')
}

let cached = global.__mongo || null

async function connect() {
  if (!MONGO_URI) return null
  if (cached && cached.conn) {
    return cached.conn
  }
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      // Recommended options
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    cached = global.__mongo = { conn: mongoose }
    console.log('MongoDB connected')
    return cached.conn
  } catch (err) {
    console.warn('MongoDB connection error', err)
    return null
  }
}

module.exports = { connect }
