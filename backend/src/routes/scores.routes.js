import { Router } from 'express'
import { getTopScores, postScore } from '../controllers/scores.controller.js'

const router = Router()
router.get('/top', getTopScores)
router.post('/', postScore)

export default router
