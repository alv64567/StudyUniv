import express from "express";
import Score from "../models/score.model.js";
import Course from "../models/course.model.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.get("/grades", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const scores = await Score.find({ userId }).populate("topic");

    const formattedGrades = scores.reduce((acc, score) => {
      const courseIndex = acc.findIndex((c) => c.courseId === score.topic._id.toString());
      if (courseIndex === -1) {
        acc.push({
          courseId: score.topic._id.toString(),
          courseName: score.topic.name,
          exams: [{ examId: score._id, examName: `Examen ${acc.length + 1}`, score: score.score }],
        });
      } else {
        acc[courseIndex].exams.push({ examId: score._id, examName: `Examen ${acc[courseIndex].exams.length + 1}`, score: score.score });
      }
      return acc;
    }, []);

    res.json(formattedGrades);
  } catch (error) {
    console.error("Error al obtener calificaciones:", error);
    res.status(500).json({ message: "Error al obtener calificaciones" });
  }
});

export default router;
