import Score from '../config/models/score.model.js';
import Summary from '../config/models/summary.model.js';
import Chat from '../config/models/chat.model.js';
import Course from '../config/models/course.model.js';

export const getUserStatistics = async (req, res) => {
  try {
    const userId = req.user.id;

    const scores = await Score.find({ userId });
    const summaries = await Summary.find({ userId });
    const chats = await Chat.find({ userId });

    const examCount = scores.length;
    const examTypesCount = {};
    const averageByCourse = {};
    const scoresOverTime = [];

    const courseIds = [...new Set(scores.map(score => score.topic.toString()))];
    const courses = await Course.find({ _id: { $in: courseIds } });

    const courseNameMap = {};
    courses.forEach(course => {
      courseNameMap[course._id.toString()] = course.name;
    });

    scores.forEach(score => {
      const courseId = score.topic.toString();
      const courseName = courseNameMap[courseId] || "Curso desconocido";

      if (!averageByCourse[courseName]) {
        averageByCourse[courseName] = [];
      }

      averageByCourse[courseName].push(Number(score.score));

      examTypesCount[score.examType] = (examTypesCount[score.examType] || 0) + 1;

      scoresOverTime.push({
        date: new Date(score.createdAt).toISOString().split('T')[0],
        score: Number(score.score)
      });
    });

    const formattedAverage = Object.entries(averageByCourse).map(([course, scores]) => ({
      course,
      average: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
    }));

    res.json({
      totalExams: examCount,
      totalSummaries: summaries.length,
      totalQuestions: chats.length,
      examTypesCount,
      averageByCourse: formattedAverage,
      scoresOverTime
    });
  } catch (error) {
    console.error("❌ Error en getUserStatistics:", error);
    res.status(500).json({ message: "Error al obtener estadísticas." });
  }
};
