// Minimal auth middleware stub for demo. In production, replace with JWT verification.
export default function auth(req, res, next) {
  // For demo we just attach a guest user
  req.user = { id: 'guest', name: 'Guest' }
  next()
}
