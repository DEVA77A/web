// Small localStorage helper for user and leaderboard persistence
const KEY_USER = 'typesprint_user'
const KEY_LEADER = 'typesprint_leaderboard'

export function getUser() {
  try {
    return localStorage.getItem(KEY_USER)
  } catch (e) { return null }
}

export function setUser(name) {
  try { localStorage.setItem(KEY_USER, name) } catch (e) {}
}

export function removeUser() {
  try { localStorage.removeItem(KEY_USER) } catch (e) {}
}

export function getLeaderboard() {
  try {
    const raw = localStorage.getItem(KEY_LEADER)
    return raw ? JSON.parse(raw) : []
  } catch (e) { return [] }
}

export function saveScore(username, score) {
  try {
    const board = getLeaderboard()
    const existing = board.find((p) => p.username === username)
    if (existing) {
      if (score > existing.score) existing.score = score
    } else {
      board.push({ username, score, date: new Date().toISOString() })
    }
    board.sort((a, b) => b.score - a.score)
    localStorage.setItem(KEY_LEADER, JSON.stringify(board))
    return true
  } catch (e) { return false }
}

export default { getUser, setUser, getLeaderboard, saveScore }
