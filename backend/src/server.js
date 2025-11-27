import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000

// Simple fallback word list for demo mode
const FALLBACK_WORDS = [
	'neon', 'cyber', 'react', 'sprint', 'speed', 'keyboard', 'async', 'node', 'mongo', 'atlas', 'tailwind', 'framer'
]

// In-memory score store (used when SKIP_DB is set or DB not configured)
const memoryScores = []

// If MONGO_URI is set and SKIP_DB is not set, try to connect and use a mongoose model
let ScoreModel = null
const useDb = !process.env.SKIP_DB && !!process.env.MONGO_URI
if (useDb) {
	mongoose.connect(process.env.MONGO_URI, { autoIndex: true })
		.then(() => console.log('Connected to MongoDB'))
		.catch((err) => console.warn('MongoDB connect failed, falling back to memory store', err))

	const ScoreSchema = new mongoose.Schema({
		name: { type: String, default: 'Anonymous' },
		score: { type: Number, required: true },
		accuracy: { type: Number, default: 0 },
		level: { type: Number, default: 1 },
		createdAt: { type: Date, default: Date.now }
	})
	ScoreModel = mongoose.models.Score || mongoose.model('Score', ScoreSchema)
}

app.get('/api/words', (req, res) => {
	const count = Math.max(1, Math.min(10, parseInt(req.query.count || '3', 10)))
	const words = []
	for (let i = 0; i < count; i++) {
		const w = FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)]
		words.push({ text: w })
	}
	res.json(words)
})

app.get('/api/health', (req, res) => {
	res.json({ ok: true, mode: process.env.SKIP_DB ? 'no-db' : (useDb ? 'db' : 'no-db') })
})

// Get top scores
app.get('/api/scores/top', async (req, res) => {
	const limit = Math.max(5, Math.min(100, parseInt(req.query.limit || '10', 10)))
	try {
		if (ScoreModel) {
			const docs = await ScoreModel.find().sort({ score: -1, createdAt: 1 }).limit(limit).lean()
			return res.json(docs)
		}
		// fallback: return top from memory
		const top = memoryScores.slice().sort((a, b) => b.score - a.score).slice(0, limit)
		return res.json(top)
	} catch (err) {
		console.error('Error fetching top scores', err)
		res.status(500).json({ error: 'server error' })
	}
})

// Post a new score
app.post('/api/scores', async (req, res) => {
	const { name = 'Anonymous', score = 0, accuracy = 0, level = 1 } = req.body || {}
	if (typeof score !== 'number') return res.status(400).json({ error: 'score must be a number' })
	try {
		if (ScoreModel) {
			const doc = await ScoreModel.create({ name, score, accuracy, level })
			return res.status(201).json(doc)
		}
		const entry = { _id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name, score, accuracy, level, createdAt: new Date() }
		memoryScores.push(entry)
		return res.status(201).json(entry)
	} catch (err) {
		console.error('Error saving score', err)
		res.status(500).json({ error: 'server error' })
	}
})

app.listen(PORT, () => {
	console.log(`Backend dev server listening on http://localhost:${PORT}`)
})
