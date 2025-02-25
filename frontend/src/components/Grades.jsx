import React, { useState, useEffect } from "react";
import axios from "axios";

const Grades = () => {
  const [grades, setGrades] = useState([]); 
  const [selectedExam, setSelectedExam] = useState(null);
  const [correction, setCorrection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setError(null);
      const res = await axios.get("http://localhost:5000/users/grades", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data && Array.isArray(res.data)) {
        setGrades(res.data);
      } else {
        throw new Error("Formato de datos incorrecto en la API");
      }
    } catch (error) {
      console.error("Error al obtener calificaciones:", error);
      setError("No se pudieron obtener las calificaciones.");
    }
  };

  const fetchCorrection = async (examId) => {
    setLoading(true);
    setCorrection(null);
    try {
      const res = await axios.get(`http://localhost:5000/users/exam/correction/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCorrection(res.data);
      setSelectedExam(examId);
    } catch (error) {
      console.error("Error al obtener la corrección:", error);
      setCorrection({ error: "No se pudo obtener la corrección." });
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
          {grades && grades.length > 0 ? (
            grades.map((grade) => (
              <tr key={grade.examId}>
                <td>{grade.courseName || "Sin asignatura"}</td>
                <td>{grade.examType || "Sin tipo"}</td>
                <td>{grade.score !== undefined ? `${grade.score}/100` : "No calificado"}</td>
                <td>
                  <button
                    className="btn btn-info"
                    onClick={() => fetchCorrection(grade.examId)}
                  >
                    Ver Corrección
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No hay calificaciones disponibles.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {loading && <p>Cargando corrección...</p>}
      {correction && selectedExam && (
  <div className="mt-4 p-3 border">
    <h3>Corrección del Examen de {correction.courseName || "Sin nombre"}</h3>
    <p><strong>Puntuación:</strong> {correction.score !== "No disponible" ? `${correction.score}/100` : "No disponible"}</p>

    <h4>Preguntas y Respuestas</h4>
    {correction?.questions && correction.questions.length > 0 ? (
      correction.questions.map((question, index) => (
        <div key={index} className="mb-3 p-2 border rounded">
          <p><strong>{index + 1}. {question}</strong></p>
          <p>✅ <strong>Respuesta Correcta:</strong> {correction.correctAnswers?.[index] || "No disponible"}</p>
          <p>📝 <strong>Tu Respuesta:</strong> {correction.responses?.[index] || "No disponible"}</p>
          {correction.correctAnswers?.[index] === correction.responses?.[index] ? (
            <p className="text-success">✅ Respuesta Correcta</p>
          ) : (
            <p className="text-danger">❌ Respuesta Incorrecta</p>
          )}
        </div>
      ))
    ) : (
      <p className="text-warning">⚠️ No hay preguntas disponibles para este examen.</p>
    )}
  </div>
)}


  </div>
)}

export default Grades;
