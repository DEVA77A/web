import { Router } from 'express';
import { getWords } from '../controllers/words.controller.js';

const router = Router();
router.get('/', getWords);

export default router;
