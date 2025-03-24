import express from 'express';
import { answerQuestionWithContext } from '../controllers/openaiControllers.js';
import path from 'path';
import fs from 'fs';
import Chat from '../config/models/chat.model.js';

import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  deleteMaterial,
  checkCourseMaterial,
  
} from '../controllers/courseController.js';

import protect from '../middleware/authMiddleware.js';
import { upload } from '../config/multer.js';

import {
  getSummary, 
  chatWithAI, 
  generateExam,
  gradeExam
} from '../controllers/openaiControllers.js';

const router = express.Router();

router.post('/', protect, upload.array('files', 5), createCourse); // Permite hasta 5 archivos

router.get('/', protect, getCourses);

router.get('/:id', protect, getCourseById);

router.put('/:id', protect, upload.array('files', 5), updateCourse);

router.delete('/:id', protect, deleteCourse);

router.delete('/:id/material', protect, deleteMaterial);

router.post('/summary', protect, getSummary);

router.post('/chat', protect, chatWithAI);

router.post('/exam', protect, generateExam);

router.get('/:id/material/:filename', protect, (req, res) => {
  const filePath = path.join(path.resolve(), 'uploads', req.params.filename);
  res.download(filePath, (err) => {
    if (err) {
      console.error('Error al descargar el archivo:', err);
      res.status(500).json({ message: 'Error al descargar el archivo.' });
    }
  });
});

router.get('/:id/has-material', protect, checkCourseMaterial);

router.put('/:id', protect, upload.single('file'), updateCourse);
router.post('/chat/context', protect, answerQuestionWithContext);
router.post('/exam/grade', protect, gradeExam);

router.post('/analyze', protect, (req, res) => {
  res.status(200).json({ message: "Endpoint analyze configurado correctamente." });
});


router.get("/chat/history/:courseId", protect, async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id; 
  try {
    const chatHistory = await Chat.find({ courseId, userId }); 
    res.status(200).json(chatHistory);
  } catch (error) {
    console.error("Error al obtener el historial del chat:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;
