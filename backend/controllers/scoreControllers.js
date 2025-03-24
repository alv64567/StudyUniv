import Score from '../config/models/score.model.js';

export const saveScore = async (req, res) => {
  const { topic, score, examType } = req.body;

  if (!topic || score == null || !examType) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  try {
    const newScore = new Score({
      user: req.user.id,
      topic,
      score,
      examType,
    });

    const savedScore = await newScore.save();
    res.status(201).json(savedScore);
  } catch (error) {
    console.error('Error al guardar la calificación:', error);
    res.status(500).json({ message: 'Error al guardar la calificación.' });
  }
};

export const obtenerCorreccion = async (req, res) => {
  try {
      const { examId } = req.params;
      const userId = req.user.id; 

      const score = await Score.findOne({ examId, userId }).populate('examId');

      if (!score) {
          return res.status(404).json({ message: "No se encontró la corrección para este examen." });
      }

      res.json({ 
          exam: score.examId, 
          responses: score.responses, 
          correctAnswers: score.correctAnswers, 
          finalScore: score.finalScore 
      });
  } catch (error) {
      console.error("Error al obtener corrección:", error);
      res.status(500).json({ message: "Error interno del servidor" });
  }
};