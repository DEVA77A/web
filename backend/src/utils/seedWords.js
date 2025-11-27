import dotenv from 'dotenv'
import connectDB from '../config/db.js'
import Word from '../models/Word.js'

dotenv.config()

const seed = async () => {
  const conn = await connectDB()
  if (!conn) {
    console.log('No DB connection — skipping seed (run with MONGODB_URI set)')
    return
  }

  const words = ['neon','cyber','react','sprint','speed','keyboard','async','node','mongo','atlas','tailwind','framer']
  await Word.deleteMany({})
  await Word.insertMany(words.map(w => ({ text: w })))
  console.log('Seeded words:', words.length)
  process.exit(0)
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
