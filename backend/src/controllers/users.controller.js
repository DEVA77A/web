// Minimal user controller stubs (no auth for demo)
import User from '../models/User.js'

export const createUser = async (req, res) => {
  try {
    const { name, email } = req.body || {}
    if (!name || !email) return res.status(400).json({ error: 'name and email required' })
    const u = await User.create({ name, email })
    res.json({ id: u._id, name: u.name, email: u.email })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'could not create user' })
  }
}

export default { createUser }
