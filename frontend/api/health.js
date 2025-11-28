const { connect } = require('./_lib/db')

module.exports = async (req, res) => {
  // Try to connect but don't fail if MONGO_URI is not set
  const conn = await connect().catch(() => null)
  const mode = conn ? 'db' : 'no-db'
  res.status(200).json({ ok: true, mode })
}
