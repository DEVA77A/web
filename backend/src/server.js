import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import 'dotenv/config'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000

// Health check route
app.get('/', (req, res) => {
	res.send('Type Sprint API is running!')
})

// Simple fallback word list for demo mode
const FALLBACK_WORDS = [
	'neon', 'cyber', 'react', 'sprint', 'speed', 'keyboard', 'async', 'node', 'mongo', 'atlas', 'tailwind', 'framer',
	'array', 'string', 'object', 'method', 'module', 'import', 'export', 'bundle', 'deploy', 'docker', 'server',
	'client', 'router', 'render', 'canvas', 'sprite', 'combo', 'streak', 'score', 'timer', 'focus', 'reflex',
	'syntax', 'compile', 'debug', 'commit', 'branch', 'merge', 'rebase', 'update', 'patch', 'version',
	'cipher', 'token', 'secure', 'random', 'vector', 'binary', 'memory', 'thread', 'cache', 'buffer',
	'planet', 'galaxy', 'meteor', 'comet', 'orbit', 'signal', 'fusion', 'plasma', 'photon', 'aurora',
	'rapid', 'swift', 'brisk', 'quick', 'shift', 'blink', 'jump', 'dodge', 'boost', 'pulse'
]

// In-memory score store (used when SKIP_DB is set or DB not configured)
const memoryScores = []

// If MONGO_URI or MONGODB_URI is set and SKIP_DB is not set, try to connect and use a mongoose model
let ScoreModel = null
let UserProfile = null
let User = null
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI
const useDb = !process.env.SKIP_DB && !!mongoUri
if (useDb) {
	console.log(`Attempting to connect to MongoDB: ${mongoUri.split('@')[1] || 'URL hidden'}`)
	mongoose.connect(mongoUri, { autoIndex: true })
		.then(() => console.log('Connected to MongoDB'))
		.catch((err) => console.warn('MongoDB connect failed, falling back to memory store', err))

	const UserSchema = new mongoose.Schema({
		name: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		createdAt: { type: Date, default: Date.now }
	})
	User = mongoose.models.User || mongoose.model('User', UserSchema)

	const ScoreSchema = new mongoose.Schema({
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		userId: { type: String, index: true }, // Also store string userId for quick lookup
		name: { type: String, default: 'Anonymous' }, // Keep name for legacy or guests
		score: { type: Number, required: true },
		accuracy: { type: Number, default: 0 },
		level: { type: Number, default: 1 },
		round: { type: Number, default: 1 },
		createdAt: { type: Date, default: Date.now }
	})
	ScoreModel = mongoose.models.Score || mongoose.model('Score', ScoreSchema)

	const UserProfileSchema = new mongoose.Schema({
		userId: { type: String, required: true, unique: true, index: true },
		username: { type: String, required: true },
		bio: { type: String, default: '', maxlength: 200 },
		highestScore: { type: Number, default: 0 },
		totalGames: { type: Number, default: 0 },
		totalAccuracy: { type: Number, default: 0 },
		gamesPlayed: { type: Number, default: 0 },
		loginStreak: { type: Number, default: 0 },
		lastLogin: { type: Date },
		firstLogin: { type: Date, default: Date.now }
	}, { timestamps: true })
	UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', UserProfileSchema)

	// User Login (find or create with password)
	app.post('/api/users/login', async (req, res) => {
		const { name, password } = req.body || {}
		if (!name || !password) return res.status(400).json({ error: 'name and password required' })
		try {
			let user = await User.findOne({ name })
			if (user) {
				// Verify password
				if (user.password !== password) {
					return res.status(401).json({ error: 'Incorrect password. Please try again.' })
				}
			} else {
				// Check if creating new user - username must be unique
				const existingUser = await User.findOne({ name })
				if (existingUser) {
					return res.status(409).json({ error: 'Username already taken. Please choose a different name.' })
				}
				// Create new user
				user = await User.create({ name, password })
			}
			
			// Update login streak
			await updateUserLoginStreak(user._id.toString(), name)
			
			res.json({ id: user._id, name: user.name })
		} catch (err) {
			console.error('Login error', err)
			// Handle duplicate key error for username
			if (err.code === 11000) {
				return res.status(409).json({ error: 'Username already taken. Please choose a different name.' })
			}
			res.status(500).json({ error: 'server error' })
		}
	})

	// Helper function to update login streak
	async function updateUserLoginStreak(userId, username) {
		try {
			let profile = await UserProfile.findOne({ userId })
			
			if (!profile) {
				profile = await UserProfile.create({
					userId,
					username,
					loginStreak: 1,
					lastLogin: new Date(),
					firstLogin: new Date()
				})
				return profile
			}
			
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
				return profile
			}
			
			const yesterday = new Date(today)
			yesterday.setDate(yesterday.getDate() - 1)
			const yesterdayTime = yesterday.getTime()
			
			if (lastLoginTime === yesterdayTime) {
				profile.loginStreak += 1
			} else {
				profile.loginStreak = 1
			}
			
			profile.lastLogin = new Date()
			await profile.save()
			return profile
		} catch (err) {
			console.error('updateUserLoginStreak error:', err)
		}
	}

	// Get player stats by username (aggregates from Score collection for viewing any player)
	app.get('/api/profile/stats/:username', async (req, res) => {
		try {
			const { username } = req.params
			if (!username) return res.status(400).json({ error: 'username is required' })
			
			// Get all scores for this player by name (case-insensitive)
			const scores = await ScoreModel.find({ 
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
	})

	// Check if username is available
	app.get('/api/profile/check-username/:username', async (req, res) => {
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
	})

	// Update user bio
	app.put('/api/profile/:userId/bio', async (req, res) => {
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
	})

	// Get user profile
	app.get('/api/profile/:userId', async (req, res) => {
		try {
			const { userId } = req.params
			if (!userId) return res.status(400).json({ error: 'userId is required' })
			
			let profile = await UserProfile.findOne({ userId })
			
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
	})

	// Update user profile stats
	app.put('/api/profile/:userId', async (req, res) => {
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
	})
}

// Utility endpoint to sync scores to profiles (for fixing existing data)
// Accept both GET and POST for easy browser access
const syncProfilesHandler = async (req, res) => {
	if (!ScoreModel || !UserProfile) {
		return res.json({ message: 'Database not available' })
	}
	
	try {
		const scores = await ScoreModel.find().lean()
		let synced = 0
		
		for (const score of scores) {
			const userId = score.userId || score.user?.toString()
			if (!userId) continue
			
			let profile = await UserProfile.findOne({ userId })
			
			if (!profile) {
				await UserProfile.create({
					userId,
					username: score.name,
					highestScore: score.score,
					totalGames: 1,
					totalAccuracy: score.accuracy || 0,
					gamesPlayed: 1,
					loginStreak: 1,
					lastLogin: new Date(),
					firstLogin: new Date()
				})
				synced++
			} else if (score.score > profile.highestScore) {
				profile.highestScore = score.score
				await profile.save()
				synced++
			}
		}
		
		res.json({ message: `Synced ${synced} profiles`, total: scores.length })
	} catch (err) {
		console.error('Sync error:', err)
		res.status(500).json({ error: 'Sync failed' })
	}
}

app.get('/api/admin/sync-profiles', syncProfilesHandler)
app.post('/api/admin/sync-profiles', syncProfilesHandler)

app.get('/api/words', (req, res) => {
	const count = Math.max(1, Math.min(10, parseInt(req.query.count || '3', 10)))
	const words = []
	const used = new Set()
	for (let i = 0; i < count; i++) {
		let w = FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)]
		for (let t = 0; t < 6 && used.has(w); t += 1) {
			w = FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)]
		}
		used.add(w)
		words.push({ text: w })
	}
	res.json(words)
})

app.get('/api/health', (req, res) => {
	res.json({ ok: true, mode: process.env.SKIP_DB ? 'no-db' : (useDb ? 'db' : 'no-db') })
})

// Get top scores
app.get('/api/scores/top', async (req, res) => {
	const limit = Math.max(5, Math.min(100, parseInt(req.query.limit || '10', 10)))
	try {
		if (ScoreModel) {
			// Always use UserProfile for accurate highest scores
			if (UserProfile) {
				try {
					const profiles = await UserProfile.find({ highestScore: { $gt: 0 } })
						.sort({ highestScore: -1 })
						.limit(limit)
						.lean()
					
					// Map to score format
					const results = profiles.map(p => ({
						_id: p._id,
						name: p.username,
						username: p.username,
						score: p.highestScore,
						accuracy: p.gamesPlayed > 0 ? Math.round(p.totalAccuracy / p.gamesPlayed) : 0,
						level: 1,
						createdAt: p.createdAt
					}))
					
					if (results.length > 0) {
						console.log(`Returning ${results.length} profiles from leaderboard`)
						return res.json(results)
					}
				} catch (profileErr) {
					console.error('Error fetching from UserProfile:', profileErr)
				}
			}
			
			// Fallback to scores collection
			const results = await ScoreModel.aggregate([
				// 1. Sort by score descending and then by creation date
				{ $sort: { score: -1, createdAt: 1 } },
				// 2. Group by user and name to collapse duplicates
				{
					$group: {
						_id: { user: "$user", name: "$name" },
						bestEntry: { $first: "$$ROOT" }
					}
				},
				// 3. Flatten out the result
				{ $replaceRoot: { newRoot: "$bestEntry" } },
				// 4. Sort globally by the top scores found
				{ $sort: { score: -1, createdAt: 1 } },
				// 5. Limit the results
				{ $limit: limit }
			])

			// Populate user name if missing (for legacy or fallback)
			// Since we might have ObjectId references, we can manually populate if needed or rely on the stored name
			const mappedResults = results.map(d => ({
				_id: d._id,
				name: d.name || 'Anonymous',
				score: d.score,
				accuracy: d.accuracy,
				level: d.level,
				createdAt: d.createdAt
			}))

			return res.json(mappedResults)
		}
		// fallback: return top from memory (simplistic grouping)
		const uniqueMemoryMap = {}
		memoryScores.forEach(s => {
			if (!uniqueMemoryMap[s.name] || s.score > uniqueMemoryMap[s.name].score) {
				uniqueMemoryMap[s.name] = s
			}
		})
		const top = Object.values(uniqueMemoryMap).sort((a, b) => b.score - a.score).slice(0, limit)
		return res.json(top)
	} catch (err) {
		console.error('Error fetching unique top scores', err)
		res.status(500).json({ error: 'server error' })
	}
})

// Post or Update score (Ensure one unique high score per player)
app.post('/api/scores', async (req, res) => {
	const { name = 'Anonymous', score = 0, accuracy = 0, level = 1, userId, round = 1 } = req.body || {}
	if (typeof score !== 'number') return res.status(400).json({ error: 'score must be a number' })
	try {
		if (ScoreModel) {
			// Save the score
			const data = { name, score, accuracy, level, round }
			if (userId) {
				data.userId = userId
				if (mongoose.Types.ObjectId.isValid(userId)) {
					data.user = userId
				}
			}
			const doc = await ScoreModel.create(data)
			
			// Update user profile if userId is provided
			if (userId && UserProfile) {
				try {
					let profile = await UserProfile.findOne({ userId })
					
					if (!profile) {
						console.log(`Creating new profile for ${name} (${userId})`)
						profile = await UserProfile.create({
							userId,
							username: name,
							highestScore: score,
							totalGames: 1,
							totalAccuracy: accuracy,
							gamesPlayed: 1,
							loginStreak: 1,
							lastLogin: new Date(),
							firstLogin: new Date()
						})
					} else {
						console.log(`Updating profile for ${name} - old high: ${profile.highestScore}, new: ${score}`)
						if (score > profile.highestScore) {
							profile.highestScore = score
						}
						profile.totalAccuracy += accuracy
						profile.gamesPlayed += 1
						profile.totalGames += 1
						await profile.save()
					}
					console.log(`Profile updated: ${name} - highestScore: ${profile.highestScore}`)
				} catch (profileError) {
					console.error('Error updating profile:', profileError)
				}
			}
			
			return res.status(201).json(doc)
		}
		// Memory fallback
		const entryIdx = memoryScores.findIndex(s => s.name === name)
		if (entryIdx >= 0) {
			if (score > memoryScores[entryIdx].score) {
				memoryScores[entryIdx] = { ...memoryScores[entryIdx], score, accuracy, level, round, createdAt: new Date() }
			}
			return res.json(memoryScores[entryIdx])
		}
		const entry = { _id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name, score, accuracy, level, round, createdAt: new Date() }
		memoryScores.push(entry)
		return res.status(201).json(entry)
	} catch (err) {
		console.error('Error saving score', err)
		res.status(500).json({ error: 'server error' })
	}
})

app.listen(PORT, () => {
	console.log(`Backend dev server listening on http://localhost:${PORT}`)
})
