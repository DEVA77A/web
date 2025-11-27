import Score from '../models/Score.js'

export const getTopScores = async (req, res) => {
  try {
    if (!Score.find) return res.json([])
    const top = await Score.find().sort({ score: -1 }).limit(20).lean()
    res.json(top)
  } catch (err) {
    console.error(err)
    res.status(500).json([])
  }
}

export const postScore = async (req, res) => {
  try {
    const { name = 'Anonymous', score = 0, accuracy = 0, level = 1 } = req.body || {}
    if (!Score.create) return res.json({ ok: true })
    const doc = await Score.create({ name, score, accuracy, level })
    res.json(doc)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Could not save score' })
  }
}

export default { getTopScores, postScore }
