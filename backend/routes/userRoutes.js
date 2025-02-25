import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../config/models/user.model.js'; 
import protect from '../middleware/authMiddleware.js';
import { registerUser, loginUser } from '../controllers/userController.js';
import { obtenerPerfil } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { obtenerCalificaciones,obtenerCorreccion } from '../controllers/userController.js';

const router = express.Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/protected', protect, (req, res) => {
    res.json({ message: `Bienvenido, usuario con ID: ${req.user.id}` });
  });

router.get("/profile", authMiddleware, obtenerPerfil);
router.get("/grades", authMiddleware, obtenerCalificaciones);
router.get("/grades", authMiddleware, obtenerCalificaciones);
router.get("/exam/correction/:examId", authMiddleware, obtenerCorreccion); 


export default router;

