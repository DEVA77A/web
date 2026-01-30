let API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

// If API_BASE is set but doesn't start with http, assume it's a hostname and add https://
if (API_BASE && !API_BASE.startsWith('http')) {
  API_BASE = `https://${API_BASE}`
}

function buildUrl(path) {
  if (!API_BASE) return path
  // ensure path starts with /
  const p = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${p}`
}

export async function getWords({ count = 3, level = 1 } = {}) {
  const q = new URLSearchParams({ count: String(count), level: String(level) }).toString()
  try {
    const res = await fetch(buildUrl(`/api/words?${q}`))
    if (!res.ok) throw new Error('Network error')
    return await res.json()
  } catch (err) {
    // fallback (keep a large pool to avoid repeats)
    const FALLBACK_WORDS = [
      'neon', 'cyber', 'react', 'sprint', 'speed', 'keyboard', 'async', 'node', 'mongo', 'atlas', 'tailwind', 'framer',
      'array', 'string', 'object', 'method', 'module', 'import', 'export', 'bundle', 'deploy', 'docker', 'server',
      'client', 'router', 'render', 'canvas', 'sprite', 'combo', 'streak', 'score', 'timer', 'focus', 'reflex',
      'syntax', 'compile', 'debug', 'commit', 'branch', 'merge', 'rebase', 'update', 'patch', 'version',
      'cipher', 'token', 'secure', 'random', 'vector', 'binary', 'memory', 'thread', 'cache', 'buffer',
      'planet', 'galaxy', 'meteor', 'comet', 'orbit', 'signal', 'fusion', 'plasma', 'photon', 'aurora',
      'rapid', 'swift', 'brisk', 'quick', 'shift', 'blink', 'jump', 'dodge', 'boost', 'pulse'
    ]
    const out = []
    const used = new Set()
    for (let i = 0; i < count; i += 1) {
      let w = FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)]
      // try a bit to avoid duplicates within a single response
      for (let t = 0; t < 6 && used.has(w); t += 1) {
        w = FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)]
      }
      used.add(w)
      out.push({ text: w })
    }
    return out
  }
}

export async function loginUser(name, password) {
  try {
    const res = await fetch(buildUrl('/api/users/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password })
    })
    if (!res.ok) {
      const errData = await res.json()
      throw new Error(errData.error || 'Login failed')
    }
    return await res.json()
  } catch (err) {
    console.warn('loginUser failed', err)
    throw err // Throw so UI can catch and show error
  }
}

export async function postScore({ name = 'Anonymous', score = 0, accuracy = 0, level = 1, userId, round = 1 } = {}) {
  try {
    const res = await fetch(buildUrl('/api/scores'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score, accuracy, level, userId, round })
    })
    if (!res.ok) throw new Error('Failed to save')
    return await res.json()
  } catch (err) {
    console.warn('postScore failed', err)
    return null
  }
}

export async function getTopScores(limit = 10) {
  try {
    const timestamp = Date.now()
    const res = await fetch(buildUrl(`/api/scores/top?limit=${encodeURIComponent(String(limit))}&_t=${timestamp}`), {
      cache: 'no-cache',
      headers: { 'Cache-Control': 'no-cache' }
    })
    if (!res.ok) throw new Error('Network')
    return await res.json()
  } catch (err) {
    console.warn('getTopScores failed', err)
    return []
  }
}

export async function getUserProfile(userId) {
  try {
    const timestamp = Date.now()
    const res = await fetch(buildUrl(`/api/profile/${encodeURIComponent(userId)}?_t=${timestamp}`), {
      cache: 'no-cache',
      headers: { 'Cache-Control': 'no-cache' }
    })
    if (!res.ok) throw new Error('Failed to fetch profile')
    return await res.json()
  } catch (err) {
    console.warn('getUserProfile failed', err)
    return null
  }
}

export async function updateUserProfile(userId, { score, accuracy, username }) {
  try {
    const res = await fetch(buildUrl(`/api/profile/${encodeURIComponent(userId)}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, accuracy, username })
    })
    if (!res.ok) throw new Error('Failed to update profile')
    return await res.json()
  } catch (err) {
    console.warn('updateUserProfile failed', err)
    return null
  }
}
