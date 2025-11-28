// Lightweight words endpoint (same behavior as original backend fallback)
const FALLBACK_WORDS = [
  'neon','cyber','react','sprint','speed','keyboard','async','node','mongo','atlas','tailwind','framer'
]

module.exports = async (req, res) => {
  const count = Math.max(1, Math.min(10, parseInt(req.query.count || '3', 10)))
  const words = []
  for (let i = 0; i < count; i++) {
    const w = FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)]
    words.push({ text: w })
  }
  res.status(200).json(words)
}
