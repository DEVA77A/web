const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

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
    // fallback
    return Array.from({ length: count }).map(() => ({ text: ['neon','react','cyber'][Math.floor(Math.random()*3)] }))
  }
}

export async function postScore({ name = 'Anonymous', score = 0, accuracy = 0, level = 1 } = {}) {
  try {
    const res = await fetch(buildUrl('/api/scores'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score, accuracy, level })
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
    const res = await fetch(buildUrl(`/api/scores/top?limit=${encodeURIComponent(String(limit))}`))
    if (!res.ok) throw new Error('Network')
    return await res.json()
  } catch (err) {
    console.warn('getTopScores failed', err)
    return []
  }
}
