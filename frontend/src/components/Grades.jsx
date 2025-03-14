import React, { useState, useEffect } from "react";
import axios from "axios";

const Grades = () => {
  const [grades, setGrades] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:5000/users/grades", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log("📌 Datos originales de la API:", JSON.stringify(res.data, null, 2));
  
      if (res.data && Array.isArray(res.data)) {
        res.data.forEach((exam, index) => {
          console.log(`📌 Examen ${index + 1}:`, exam);
        });
  
        const groupedGrades = {};
  
        res.data.forEach(exam => {
          if (!exam.courseId) {
            console.warn(`⚠️ El examen con ID ${exam.examId} no tiene un courseId.`);
          }
  
          if (!groupedGrades[exam.courseId]) {
            groupedGrades[exam.courseId] = {
              courseId: exam.courseId, 
              courseName: exam.courseName || "Sin nombre",
              exams: [],
            };
          }
  
          groupedGrades[exam.courseId].exams.push(exam);
        });
  
        console.log("📌 Datos procesados (TODOS los intentos incluidos):", groupedGrades);
        setGrades(Object.values(groupedGrades));
      } else {
        throw new Error("La API devolvió datos inválidos");
      }
    } catch (error) {
      console.error("❌ Error al obtener calificaciones:", error);
      setError("Error al cargar las calificaciones");
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCorrection = async (examId, courseId) => {
    if (!examId || examId === "undefined") {
        console.error("❌ Error: El examId es inválido:", examId);
        alert("Error: No se puede obtener la corrección porque el ID del examen es inválido.");
        return;
    }

    setLoading(true);
    try {
        console.log(`📡 Buscando corrección en la BD para examId: ${examId} y courseId: ${courseId}`);

        const res = await axios.get(`http://localhost:5000/users/exam/correction/${examId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data) {
            console.log("📌 Examen corregido recuperado desde BD:", res.data);

            if (!courseId) {
                console.error("❌ No se encontró el courseId.");
                alert("No se pudo cargar la asignatura correctamente.");
                return;
            }

            const gradingResults = Array.isArray(res.data.gradingResults) ? res.data.gradingResults : [];

            const correctedExam = {
                courseId,
                examId,
                exam: res.data.questions.map((question, index) => ({
                    question: question?.question || "Pregunta no disponible",
                    correctAnswer: res.data.correctAnswers?.[index] || "No disponible",
                })),
                responses: res.data.responses || [],
                examLocked: true,
                finalScore: res.data.score || 0,
                examType: res.data.examType || "Desconocido",
                gradingResults: gradingResults,
            };

            localStorage.setItem(`examState_${courseId}_${examId}`, JSON.stringify(correctedExam));
            localStorage.setItem(`lastExamId_${courseId}`, examId);

            console.log("✅ Examen corregido guardado en localStorage");

            window.location.href = `/exam-generator?examId=${examId}&courseId=${courseId}`;
        } else {
            alert("No se pudo obtener la corrección del examen.");
        }
    } catch (error) {
        console.error("❌ Error al obtener la corrección:", error);
    }
    setLoading(false);
};

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📚 Libro de Calificaciones</h2>

      {error && <p className="text-danger">{error}</p>}

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Asignatura</th>
            <th>Tipo de Examen</th>
            <th>Calificación</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
  {grades.length > 0 ? (
    grades.map((group, index) => (
      <React.Fragment key={`group-${index}`}>
        {group.exams.map((exam, examIndex) => (
          <tr key={`exam-${exam.examId || `${group.courseId}-${examIndex}`}`}>
            <td>{examIndex === 0 ? group.courseName : ""}</td>
            <td>{exam.examType || "Sin tipo"}</td>
            <td>{exam.score !== undefined ? `${exam.score}/100` : "No calificado"}</td>
            <td>
            <button
  className="btn btn-info"
  onClick={() => {
    console.log(`📌 Intentando ver corrección para examId: ${exam.examId} y courseId: ${group.courseId}`);
    fetchCorrection(exam.examId, group.courseId);
  }}
>
  Ver Corrección
</button>

            </td>
          </tr>
        ))}
      </React.Fragment>
    ))
  ) : (
    <tr>
      <td colSpan="4" className="text-center">No hay calificaciones disponibles.</td>
    </tr>
  )}
</tbody>

      </table>

      {loading && <p>Cargando corrección...</p>}
    </div>
  );
};

export default Grades;