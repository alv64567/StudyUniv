import Score from "../config/models/score.model.js";
import Course from "../config/models/course.model.js";
import User from '../config/models/user.model.js';
import jwt from 'jsonwebtoken';
import Exam from "../config/models/exam.model.js"; 


export const obtenerCalificaciones = async (req, res) => {
  try {
    const userId = req.user.id;
    const calificaciones = await Score.find({ userId })
      .populate("topic", "name") 
      .lean();

    const resultado = calificaciones.map(score => ({
      courseId: score.topic?._id || null, 
      courseName: score.topic?.name || "Sin nombre",
      examType: score.examType,
      score: score.score,
      examId: score._id,
      createdAt: score.createdAt
    }));

    console.log("📌 Enviando todas las calificaciones:", resultado);
    res.status(200).json(resultado);
  } catch (error) {
    console.error("❌ Error al obtener calificaciones:", error);
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
    const { username, email, password, profilePicture } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
    }

    const newUser = new User({
      username,
      email,
      password,
      profilePicture, 
    });

    await newUser.save();

    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};



export const obtenerCorreccion = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!examId || examId.length !== 24) {
      return res.status(400).json({ message: "❌ Error: ID de examen inválido." });
    }

    const examen = await Score.findById(examId)
      .populate("topic", "name")
      .lean();

    if (!examen) {
      return res.status(404).json({ message: "❌ Examen no encontrado." });
    }

    res.status(200).json({
      courseName: examen.topic?.name || "Sin nombre",
      examType: examen.examType || "test",
      score: examen.score !== undefined ? examen.score : "No disponible",
      questions: examen.questions.map(q => ({
        question: q.question || q.text || "Pregunta no disponible",
        options: q.options || [],
        correctAnswer: q.correctAnswer || "No disponible",
      })),
      responses: examen.responses || [],
      gradingResults: examen.gradingResults || [],
    });
  } catch (error) {
    console.error("❌ Error al obtener corrección:", error);
    res.status(500).json({ message: "❌ Error al obtener la corrección del examen." });
  }
};

export const getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json({ preferences: user.preferences });
  } catch (err) {
    console.error('❌ Error al obtener preferencias:', err);
    res.status(500).json({ message: 'Error al obtener preferencias' });
  }
};


export const updateUserProfile = async (req, res) => {
  try {
    const { username, password, profilePicture } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (username) user.username = username;
    if (profilePicture) user.profilePicture = profilePicture;

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
      }
      user.password = password; 
    }

    await user.save();
    res.status(200).json({ message: 'Perfil actualizado correctamente' });
  } catch (err) {
    console.error('❌ Error al actualizar perfil:', err);
    res.status(500).json({ message: 'Error al actualizar el perfil' });
  }
};
