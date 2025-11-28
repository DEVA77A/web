const { connect } = require('./_lib/db')
const Score = require('./_models/score')

// In-memory fallback (will be used when no DB is available)
const memoryScores = []

module.exports = async (req, res) => {
  // Ensure DB connection attempted for each invocation (cached in _lib/db)
  const db = await connect().catch(() => null)

  if (req.method === 'GET') {
    // GET /api/scores/top?limit=10
    const limit = Math.max(5, Math.min(100, parseInt(req.query.limit || '10', 10)))
    try {
      if (db) {
        const docs = await Score.find().sort({ score: -1, createdAt: 1 }).limit(limit).lean()
        return res.status(200).json(docs)
      }
      const top = memoryScores.slice().sort((a, b) => b.score - a.score).slice(0, limit)
      return res.status(200).json(top)
    } catch (err) {
      console.error('Error fetching top scores', err)
      return res.status(500).json({ error: 'server error' })
    }
  }

  if (req.method === 'POST') {
    const body = req.body || {}
    const name = body.name || 'Anonymous'
    const score = typeof body.score === 'number' ? body.score : Number(body.score || 0)
    const accuracy = typeof body.accuracy === 'number' ? body.accuracy : Number(body.accuracy || 0)
    const level = typeof body.level === 'number' ? body.level : Number(body.level || 1)

    if (Number.isNaN(score)) return res.status(400).json({ error: 'score must be a number' })
    try {
      if (db) {
        const doc = await Score.create({ name, score, accuracy, level })
        return res.status(201).json(doc)
      }
      const entry = { _id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name, score, accuracy, level, createdAt: new Date() }
      memoryScores.push(entry)
      return res.status(201).json(entry)
    } catch (err) {
      console.error('Error saving score', err)
      return res.status(500).json({ error: 'server error' })
    }
  }

  // Method not allowed
  res.setHeader('Allow', 'GET,POST')
  res.status(405).end('Method Not Allowed')
}
