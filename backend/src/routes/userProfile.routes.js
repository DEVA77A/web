import { Router } from 'express'
import { getUserProfile, updateUserProfile, updateLoginStreak } from '../controllers/userProfile.controller.js'

const router = Router()

router.get('/:userId', getUserProfile)
router.put('/:userId', updateUserProfile)
router.post('/:userId/login-streak', updateLoginStreak)

export default router
