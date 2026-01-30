import UserProfile from '../models/UserProfile.js'

// Get user profile by userId
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params
    if (!userId) return res.status(400).json({ error: 'userId is required' })
    
    let profile = await UserProfile.findOne({ userId })
    
    // If profile doesn't exist, create a default one
    if (!profile) {
      profile = await UserProfile.create({
        userId,
        username: userId,
        highestScore: 0,
        totalGames: 0,
        totalAccuracy: 0,
        gamesPlayed: 0,
        loginStreak: 0,
        firstLogin: new Date()
      })
    }
    
    res.json(profile)
  } catch (err) {
    console.error('getUserProfile error:', err)
    res.status(500).json({ error: 'Could not fetch profile' })
  }
}

// Update user profile stats (after a game)
export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params
    const { score, accuracy, username } = req.body || {}
    
    if (!userId) return res.status(400).json({ error: 'userId is required' })
    
    let profile = await UserProfile.findOne({ userId })
    
    if (!profile) {
      // Create new profile
      profile = await UserProfile.create({
        userId,
        username: username || userId,
        highestScore: score || 0,
        totalGames: 1,
        totalAccuracy: accuracy || 0,
        gamesPlayed: 1,
        loginStreak: 1,
        lastLogin: new Date(),
        firstLogin: new Date()
      })
    } else {
      // Update existing profile
      if (score && score > profile.highestScore) {
        profile.highestScore = score
      }
      
      if (accuracy !== undefined) {
        profile.totalAccuracy += accuracy
        profile.gamesPlayed += 1
        profile.totalGames += 1
      }
      
      await profile.save()
    }
    
    res.json(profile)
  } catch (err) {
    console.error('updateUserProfile error:', err)
    res.status(500).json({ error: 'Could not update profile' })
  }
}

// Update login streak
export const updateLoginStreak = async (req, res) => {
  try {
    const { userId } = req.params
    const { username } = req.body || {}
    
    if (!userId) return res.status(400).json({ error: 'userId is required' })
    
    let profile = await UserProfile.findOne({ userId })
    
    if (!profile) {
      // Create new profile with streak 1
      profile = await UserProfile.create({
        userId,
        username: username || userId,
        loginStreak: 1,
        lastLogin: new Date(),
        firstLogin: new Date()
      })
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const lastLogin = profile.lastLogin ? new Date(profile.lastLogin) : null
      if (lastLogin) {
        lastLogin.setHours(0, 0, 0, 0)
      }
      
      const todayTime = today.getTime()
      const lastLoginTime = lastLogin ? lastLogin.getTime() : 0
      
      // Check if already logged in today
      if (lastLoginTime === todayTime) {
        // Already logged in today, don't update streak
        return res.json(profile)
      }
      
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayTime = yesterday.getTime()
      
      if (lastLoginTime === yesterdayTime) {
        // Consecutive day
        profile.loginStreak += 1
      } else {
        // Streak broken, reset to 1
        profile.loginStreak = 1
      }
      
      profile.lastLogin = new Date()
      await profile.save()
    }
    
    res.json(profile)
  } catch (err) {
    console.error('updateLoginStreak error:', err)
    res.status(500).json({ error: 'Could not update login streak' })
  }
}

export default { getUserProfile, updateUserProfile, updateLoginStreak }
