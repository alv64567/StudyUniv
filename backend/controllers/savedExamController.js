import SavedExam from "../config/models/savedExam.model.js";

export const saveSavedExam = async (req, res) => {
  try {
    const { courseId, examType, exam } = req.body;


    const newSavedExam = new SavedExam({
      userId: req.user.id,
      courseId,
      examType,
      exam,
      examLocked: false, 
    });

    await newSavedExam.save();
    res.status(201).json({ message: "Examen guardado exitosamente", savedExamId: newSavedExam._id });
  } catch (error) {
    console.error("❌ Error al guardar examen:", error);
    res.status(500).json({ message: "Error al guardar el examen." });
  }
};

export const getUserSavedExams = async (req, res) => {
  try {
    const savedExams = await SavedExam.find({ userId: req.user.id }).populate("courseId", "name");
    res.json(savedExams);
  } catch (error) {
    console.error("❌ Error al obtener exámenes guardados:", error);
    res.status(500).json({ message: "Error al obtener exámenes guardados." });
  }
};
