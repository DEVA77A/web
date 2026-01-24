// Small localStorage helper for user and leaderboard persistence
const KEY_USER = 'typesprint_user'
const KEY_LEADER = 'typesprint_leaderboard'

export function getUser() {
  try {
    const v = localStorage.getItem(KEY_USER)
    return v ? JSON.parse(v) : null
  } catch (e) { return null }
}

export function setUser(userObj) {
  try {
    localStorage.setItem(KEY_USER, typeof userObj === 'string' ? JSON.stringify({ name: userObj }) : JSON.stringify(userObj))
  } catch (e) { }
}

export function removeUser() {
  try { localStorage.removeItem(KEY_USER) } catch (e) { }
}

export function getLeaderboard() {
  try {
    const raw = localStorage.getItem(KEY_LEADER)
    const parsed = raw ? JSON.parse(raw) : []
    console.debug('[storage] getLeaderboard ->', parsed)
    return parsed
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
    console.debug('[storage] saveScore saved', { username, score, board })
    return true
  } catch (e) { return false }
}

export default { getUser, setUser, getLeaderboard, saveScore }
