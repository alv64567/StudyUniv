import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SavedExamCatalog = () => {
  const [savedExams, setSavedExams] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchSavedExams = async () => {
      try {
        const res = await axios.get("http://localhost:5000/saved-exams/my", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedExams(res.data);
      } catch (error) {
        console.error("❌ Error al obtener exámenes guardados:", error);
      }
    };

    fetchSavedExams();
  }, []);

  const handleLoadExam = (exam) => {
    const courseId = exam.courseId._id;
    const examId = `exam_${courseId}_${Date.now()}`;

    const examState = {
      courseId,
      examId,
      exam: (exam.exam || []).map(q => ({
        question: q.question,
        options: q.options || [],
        answer: q.correctAnswer || q.answer || "" 
      })),
      
      
      responses: exam.responses || [],
      examLocked: exam.examLocked || false,
      finalScore: exam.finalScore || null,
      examType: exam.examType || "test",
      gradingResults: exam.gradingResults || [],
      numQuestions: exam.exam?.length || 0
    };

    localStorage.setItem(`examState_${courseId}_${examId}`, JSON.stringify(examState));
    localStorage.setItem(`lastExamId_${courseId}`, examId);
    localStorage.setItem("selectedCourse", courseId);

    window.location.href = `/exam-generator?examId=${examId}&courseId=${courseId}`;
  };

  

  return (
    <div className="container mt-4">
      <h2>📘 Catálogo de Exámenes</h2>
      {savedExams.length === 0 ? (
        <p>No hay exámenes guardados.</p>
      ) : (
        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>Asignatura</th>
              <th>Tipo</th>
              <th>Preguntas</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {savedExams.map((exam, idx) => (
              <tr key={idx}>
                <td>{exam.courseId?.name || "Desconocido"}</td>
                <td>{exam.examType}</td>
                <td>{exam.exam?.length || 0}</td>
                <td>{exam.examLocked ? "Finalizado" : "En progreso"}</td>
                <td>
                  <button className="btn btn-primary" onClick={() => handleLoadExam(exam)}>
                    Repetir Examen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SavedExamCatalog;
