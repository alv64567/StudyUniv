import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import User from './config/models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import protect from './middleware/authMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import path from 'path';
import Score from './config/models/score.model.js';
import Summary from './config/models/summary.model.js'; 
import savedExamRoutes from './routes/savedExamRoutes.js';

dotenv.config(); 

const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
 
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

connectDB(); 

app.use('/users', userRoutes);
app.use('/courses', protect, courseRoutes);

app.get('/', (req, res) => {
  res.send('El servidor está funcionando correctamente');
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Ha ocurrido un error' });
});


app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

app.post('/scores', protect, async (req, res) => {
  try {
    const { topic, score, examType } = req.body;
    const userId = req.user.id;
    const newScore = new Score({ userId, topic, score, examType });
    await newScore.save();
    res.status(201).json({ message: 'Calificación guardada.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar la calificación.' });
  }
});


app.get('/courses/chat/history/:courseId', protect, async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id;

  try {
    const chatHistory = await Chat.find({ courseId, userId }); 
    res.json({ history: chatHistory });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el historial del chat.' });
  }
});

app.get('/courses/summary/history/:courseId', protect, async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id;

  try {
    const history = await Summary.find({ courseId, userId });
    res.json({ history });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el historial de resúmenes.' });
  }
});

app.use('/saved-exams', savedExamRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});