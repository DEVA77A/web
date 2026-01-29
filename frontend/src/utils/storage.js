// Small localStorage helper for user and leaderboard persistence
const KEY_USER = 'typesprint_user'
const KEY_LEADER = 'typesprint_leaderboard'
const KEY_PROFILE = 'typesprint_profile_'

export function getUser() {
  try {
    const v = localStorage.getItem(KEY_USER)
    return v ? JSON.parse(v) : null
  } catch (e) { return null }
}

export function setUser(userObj) {
  try {
    const user = typeof userObj === 'string' ? { name: userObj } : userObj
    localStorage.setItem(KEY_USER, JSON.stringify(user))
    // Update login streak
    if (user.id || user.name) {
      updateLoginStreak(user.id || user.name)
    }
  } catch (e) { }
}

// Profile stats management
export function getProfile(userId) {
  try {
    const key = KEY_PROFILE + userId
    const data = localStorage.getItem(key)
    if (data) return JSON.parse(data)
    // Default profile
    return {
      userId,
      highestScore: 0,
      totalGames: 0,
      totalAccuracy: 0,
      gamesPlayed: 0,
      loginStreak: 0,
      lastLogin: null,
      firstLogin: new Date().toISOString()
    }
  } catch (e) {
    return {
      userId,
      highestScore: 0,
      totalGames: 0,
      totalAccuracy: 0,
      gamesPlayed: 0,
      loginStreak: 0,
      lastLogin: null,
      firstLogin: new Date().toISOString()
    }
  }
}

export function updateProfile(userId, stats) {
  try {
    const profile = getProfile(userId)
    
    if (stats.score && stats.score > profile.highestScore) {
      profile.highestScore = stats.score
    }
    
    if (stats.accuracy !== undefined) {
      profile.totalAccuracy += stats.accuracy
      profile.gamesPlayed += 1
      profile.totalGames += 1
    }
    
    const key = KEY_PROFILE + userId
    localStorage.setItem(key, JSON.stringify(profile))
    return profile
  } catch (e) {
    return null
  }
}

export function updateLoginStreak(userId) {
  try {
    const profile = getProfile(userId)
    const today = new Date().toDateString()
    const lastLogin = profile.lastLogin ? new Date(profile.lastLogin).toDateString() : null
    
    if (lastLogin !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toDateString()
      
      if (lastLogin === yesterdayStr) {
        // Consecutive day
        profile.loginStreak += 1
      } else if (lastLogin !== null) {
        // Streak broken
        profile.loginStreak = 1
      } else {
        // First login
        profile.loginStreak = 1
      }
      
      profile.lastLogin = new Date().toISOString()
      
      const key = KEY_PROFILE + userId
      localStorage.setItem(key, JSON.stringify(profile))
    }
    
    return profile
  } catch (e) {
    return null
  }
}

export function getBadge(loginStreak) {
  if (loginStreak >= 1000) return { name: 'Grand Master', emoji: '👑', color: '#ffd700' }
  if (loginStreak >= 500) return { name: 'Legendary', emoji: '⭐', color: '#ff6b6b' }
  if (loginStreak >= 100) return { name: 'Elite', emoji: '💎', color: '#60a5fa' }
  if (loginStreak >= 30) return { name: 'Veteran', emoji: '🔥', color: '#f59e0b' }
  if (loginStreak >= 7) return { name: 'Rising Star', emoji: '✨', color: '#a78bfa' }
  return null
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

export function saveScore(username, score, accuracy = 0) {
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
    
    // Update profile stats
    updateProfile(username, { score, accuracy })
    
    return true
  } catch (e) { return false }
}

export default { getUser, setUser, getLeaderboard, saveScore, getProfile, updateProfile, updateLoginStreak, getBadge }
