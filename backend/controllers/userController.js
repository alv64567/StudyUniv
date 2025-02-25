import Score from "../config/models/score.model.js";
import Course from "../config/models/course.model.js";
import User from '../config/models/user.model.js';
import jwt from 'jsonwebtoken';

export const obtenerCalificaciones = async (req, res) => {
  try {
    const userId = req.user.id; 
    const calificaciones = await Score.find({ userId }).populate("topic", "name");

    const resultado = calificaciones.map(score => ({
      courseName: score.topic.name,
      examType: score.examType,
      score: score.score,
      examId: score._id, 
    }));

    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error al obtener calificaciones:", error);
    res.status(500).json({ message: "Error al obtener calificaciones." });
  }
};

export const obtenerPerfil = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error al obtener el perfil:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    if (!user.matchPassword || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, userId: user._id, username: user.username, profilePicture: user.profilePicture });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const registerUser = async (req, res) => {
  try {
   
  } catch (error) {
    res.status(500).json({ message: "Error al registrar el usuario" });
  }
};

export const obtenerCorreccion = async (req, res) => {
  try {
    const { examId } = req.params;
    
    
    const examen = await Score.findById(examId).populate("topic", "name");

    if (!examen) {
      return res.status(404).json({ message: "Examen no encontrado" });
    }

    if (!examen.questions || examen.questions.length === 0) {
      console.warn(`⚠️ Examen ${examId} no tiene preguntas guardadas.`);
    }

    res.status(200).json({
      courseName: examen.topic?.name || "Sin nombre",
      examType: examen.examType || "No especificado",
      score: examen.score !== undefined ? examen.score : "No disponible",
      questions: Array.isArray(examen.questions) ? examen.questions : [], 
      correctAnswers: Array.isArray(examen.correctAnswers) ? examen.correctAnswers : [],
      responses: Array.isArray(examen.responses) ? examen.responses : [],
    });
  } catch (error) {
    console.error("Error al obtener corrección:", error);
    res.status(500).json({ message: "Error al obtener la corrección del examen." });
  }
};




