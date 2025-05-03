import express from 'express';
import { saveSavedExam, getUserSavedExams } from '../controllers/savedExamController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/save', protect, saveSavedExam);
router.get('/my', protect, getUserSavedExams);

export default router;
