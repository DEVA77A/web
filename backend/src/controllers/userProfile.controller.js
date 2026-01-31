import UserProfile from '../models/UserProfile.js'

// Get user profile by userId or username
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params
    if (!userId) return res.status(400).json({ error: 'userId is required' })
    
    // Try to find by userId first, then by username (case-insensitive)
    let profile = await UserProfile.findOne({ userId })
    
    if (!profile) {
      // Try to find by username (case-insensitive match)
      profile = await UserProfile.findOne({ 
        username: { $regex: new RegExp(`^${userId}$`, 'i') }
      })
    }
    
    // If still no profile found, return null (don't create for other users viewing)
    if (!profile) {
      return res.json({
        userId: userId,
        username: userId,
        bio: '',
        highestScore: 0,
        totalGames: 0,
        totalAccuracy: 0,
        gamesPlayed: 0,
        loginStreak: 0,
        notFound: true
      })
    }
    
    res.json(profile)
  } catch (err) {
    console.error('getUserProfile error:', err)
    res.status(500).json({ error: 'Could not fetch profile' })
  }
}

// Get profile by username specifically (for leaderboard clicks)
export const getProfileByUsername = async (req, res) => {
  try {
    const { username } = req.params
    if (!username) return res.status(400).json({ error: 'username is required' })
    
    // Find by username (case-insensitive)
    const profile = await UserProfile.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') }
    })
    
    if (!profile) {
      return res.json({
        userId: username,
        username: username,
        bio: '',
        highestScore: 0,
        totalGames: 0,
        totalAccuracy: 0,
        gamesPlayed: 0,
        loginStreak: 0,
        notFound: true
      })
    }
    
    res.json(profile)
  } catch (err) {
    console.error('getProfileByUsername error:', err)
    res.status(500).json({ error: 'Could not fetch profile' })
  }
}

// Check if username is available
export const checkUsernameAvailable = async (req, res) => {
  try {
    const { username } = req.params
    if (!username) return res.status(400).json({ error: 'username is required', available: false })
    
    const existingProfile = await UserProfile.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') }
    })
    
    res.json({ available: !existingProfile, username })
  } catch (err) {
    console.error('checkUsernameAvailable error:', err)
    res.status(500).json({ error: 'Could not check username', available: false })
  }
}

// Update user bio
export const updateUserBio = async (req, res) => {
  try {
    const { userId } = req.params
    const { bio } = req.body || {}
    
    if (!userId) return res.status(400).json({ error: 'userId is required' })
    
    let profile = await UserProfile.findOne({ userId })
    
    if (!profile) {
      profile = await UserProfile.create({
        userId,
        username: userId,
        bio: bio || '',
        highestScore: 0,
        totalGames: 0,
        totalAccuracy: 0,
        gamesPlayed: 0,
        loginStreak: 0,
        firstLogin: new Date()
      })
    } else {
      profile.bio = bio || ''
      await profile.save()
    }
    
    res.json(profile)
  } catch (err) {
    console.error('updateUserBio error:', err)
    res.status(500).json({ error: 'Could not update bio' })
  }
}

// Update user profile stats (after a game)
export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params
    const { score, accuracy, username, newUsername } = req.body || {}
    
    if (!userId) return res.status(400).json({ error: 'userId is required' })
    
    // If changing username, check if new username is available
    if (newUsername) {
      const existingProfile = await UserProfile.findOne({ 
        username: { $regex: new RegExp(`^${newUsername}$`, 'i') },
        userId: { $ne: userId }
      })
      
      if (existingProfile) {
        return res.status(400).json({ error: 'Username already taken' })
      }
    }
    
    let profile = await UserProfile.findOne({ userId })
    
    if (!profile) {
      // Create new profile
      profile = await UserProfile.create({
        userId,
        username: newUsername || username || userId,
        bio: '',
        highestScore: score || 0,
        totalGames: 1,
        totalAccuracy: accuracy || 0,
        gamesPlayed: 1,
        loginStreak: 1,
        lastLogin: new Date(),
        firstLogin: new Date()
      })
    } else {
      // Update username if provided
      if (newUsername) {
        profile.username = newUsername
      }
      
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

// Get full player stats by username (aggregates from Score collection)
import Score from '../models/Score.js'

export const getPlayerStats = async (req, res) => {
  try {
    const { username } = req.params
    if (!username) return res.status(400).json({ error: 'username is required' })
    
    // Get all scores for this player by name (case-insensitive)
    const scores = await Score.find({ 
      name: { $regex: new RegExp(`^${username}$`, 'i') }
    }).sort({ score: -1 }).lean()
    
    // Calculate stats from scores
    const gamesPlayed = scores.length
    const highestScore = gamesPlayed > 0 ? Math.max(...scores.map(s => s.score || 0)) : 0
    const totalAccuracy = scores.reduce((sum, s) => sum + (s.accuracy || 0), 0)
    const avgAccuracy = gamesPlayed > 0 ? Math.round(totalAccuracy / gamesPlayed) : 0
    
    // Try to get profile data for bio and login streak
    let profile = await UserProfile.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') }
    })
    
    if (!profile) {
      // Try by userId
      profile = await UserProfile.findOne({ userId: username })
    }
    
    res.json({
      userId: profile?.userId || username,
      username: profile?.username || username,
      bio: profile?.bio || '',
      highestScore: Math.max(highestScore, profile?.highestScore || 0),
      totalGames: gamesPlayed,
      gamesPlayed: gamesPlayed,
      totalAccuracy: totalAccuracy,
      avgAccuracy: avgAccuracy,
      loginStreak: profile?.loginStreak || 0,
      lastLogin: profile?.lastLogin || null,
      firstLogin: profile?.firstLogin || null
    })
  } catch (err) {
    console.error('getPlayerStats error:', err)
    res.status(500).json({ error: 'Could not fetch player stats' })
  }
}

export default { getUserProfile, getProfileByUsername, updateUserProfile, updateLoginStreak, checkUsernameAvailable, updateUserBio, getPlayerStats }
