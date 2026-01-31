import { Router } from 'express'
import { getUserProfile, updateUserProfile, updateLoginStreak, checkUsernameAvailable, updateUserBio, getProfileByUsername, getPlayerStats } from '../controllers/userProfile.controller.js'

const router = Router()

router.get('/check-username/:username', checkUsernameAvailable)
router.get('/stats/:username', getPlayerStats)  // Get full stats from Score collection
router.get('/by-username/:username', getProfileByUsername)  // Get profile by username
router.get('/:userId', getUserProfile)
router.put('/:userId', updateUserProfile)
router.put('/:userId/bio', updateUserBio)
router.post('/:userId/login-streak', updateLoginStreak)

export default router
