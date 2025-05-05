import React, { useState, useEffect } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
import "../ExamGenerator/ExamGenerator.css";

const ExamGenerator = () => {
  const [courseId, setCourseId] = useState(localStorage.getItem("selectedCourse") || "");
  const [numQuestions, setNumQuestions] = useState(Number(localStorage.getItem("numQuestions")) || 5);
  const [examType, setExamType] = useState(localStorage.getItem("examType") || "test");
  const [courses, setCourses] = useState([]);
  const [exam, setExam] = useState([]);
  const [responses, setResponses] = useState({});
  const [gradingResults, setGradingResults] = useState(null);
  const [finalScore, setFinalScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [examLocked, setExamLocked] = useState(false);
  const token = localStorage.getItem("token");

  const isFromCatalog = new URLSearchParams(window.location.search).has("examId");

  useEffect(() => {
    console.log("✅ useEffect ejecutado - Intentando recuperar examen en curso o corregido");
  
    fetchCourses();
    localStorage.removeItem("lastExamId");
    localStorage.removeItem("selectedCourse");
  
    const params = new URLSearchParams(window.location.search);
let examId = params.get("examId");

let selectedCourseId = params.get("courseId") || localStorage.getItem("selectedCourse") || "";
if (!examId) {
  examId = localStorage.getItem(`lastExamId_${selectedCourseId}`);
}
if (!selectedCourseId || !examId) return;

const examKey = `examState_${selectedCourseId}_${examId}`;
console.log("🔑 Buscando examen con clave:", examKey);

    setCourseId(selectedCourseId);
  
    const savedExam = localStorage.getItem(examKey);
console.log("📌 Intentando cargar examen corregido desde localStorage...", savedExam);

if (savedExam) {
  const examData = JSON.parse(savedExam); 
  console.log("📌 Examen corregido encontrado en localStorage. Cargando...");
  console.log("📦 Examen cargado desde localStorage:", examData);

  if (examData.exam && Array.isArray(examData.exam)) {
    console.log("📌 Exam cargado desde localStorage:", examData.exam);
    setExam(examData.exam);

    let mappedResponses = {};
    if (Array.isArray(examData.responses)) {
      examData.responses.forEach((val, idx) => {
        mappedResponses[idx] = val;
      });
    } else if (typeof examData.responses === "object" && examData.responses !== null) {
      mappedResponses = examData.responses;
    }
    setResponses(mappedResponses);
    
  


    setExamLocked(examData.examLocked);
    setFinalScore(examData.finalScore);
    setExamType(examData.examType);
    setGradingResults(examData.gradingResults);
  } else {
    console.error("❌ Examen no válido en localStorage:", examData);
    setExam([]); 
  }
  return; 
}

  
    console.log("📡 No se encontró el examen en localStorage. Buscando en la BD...");
    fetchCorrectionFromDB(examId, selectedCourseId);
  }, []);
  

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data);
    } catch (error) {
      console.error("❌ Error al obtener cursos:", error);
    }
  };

  const handleGenerateExam = async () => {
    if (!courseId) {
      setError("Selecciona una asignatura primero.");
      return;
    }
  
    setLoading(true);
    setError("");
    setExam([]);
    setResponses({});
    setGradingResults(null);
    setFinalScore(null);
    setExamLocked(false);
  
    try {
      const res = await axios.post(
        "http://localhost:5000/courses/exam",
        { topic: courseId, numQuestions, examType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (!res.data.exam || !Array.isArray(res.data.exam)) {
        throw new Error("El servidor no devolvió preguntas válidas.");
      }
  
      const generatedExam = res.data.exam;
      setExam(generatedExam);
  
      const examId = `exam_${courseId}_${Date.now()}`;
      const examState = {
        courseId,
        examId,
        exam: generatedExam,
        responses: {},
        examLocked: false,
        finalScore: null,
        examType,
        gradingResults: null,
      };
  
      localStorage.setItem(`examState_${courseId}_${examId}`, JSON.stringify(examState));
      localStorage.setItem(`lastExamId_${courseId}`, examId);
    } catch (err) {
      setError(err.response?.data?.message || "Error al generar el examen.");
    } finally {
      setLoading(false);
    }
  };


  const handleGradeExam = async () => {
    if (examLocked) return; 
    console.log("📌 Enviando respuestas al backend:", responses);
  
    Swal.fire({
      title: "¿Estás seguro de finalizar el examen?",
      text: "No podrás modificar tus respuestas después de enviarlo.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, corregir",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const formattedResponses = Array.isArray(responses)
  ? responses
  : exam.map((_, index) => {
      const val = responses[index];
      return typeof val === "string" ? val : (val ? String(val) : "");
    });

          
    const examWithAnswer = exam.map(q => ({
      ...q,
      answer: q.answer || q.correctAnswer || ""
    }));
    
    const payload = {
      responses: formattedResponses,
      exam: examWithAnswer,
      courseId,
      examType,
      saveToGrades: !window.location.search.includes("examId=")
    };
    
          
          console.log("📌 Enviando payload corregido:", JSON.stringify(payload, null, 2));
  
          const res = await axios.post("http://localhost:5000/courses/exam/grade", payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          console.log("📌 Respuesta del backend:", res.data);
  
          if (res.data) {
            setGradingResults(res.data.results);
            setFinalScore(res.data.totalScore);
            setExamLocked(true);
  
            const examId = localStorage.getItem(`lastExamId_${courseId}`) || `exam_${courseId}_${Date.now()}`;
  
            const examState = {
              courseId,
              examId,
              exam,
              responses,
              examLocked: true, 
              finalScore: res.data.totalScore,
              examType,
              gradingResults: res.data.results,
            };
  
            console.log("📌 Guardando examen corregido en localStorage:", examState);
            localStorage.setItem(`examState_${courseId}_${examId}`, JSON.stringify(examState));
            localStorage.setItem("lastExamId", examId);
  
            Swal.fire("✅ Examen calificado", "Tu calificación ha sido guardada correctamente.", "success");
          }
        } catch (error) {
          console.error("❌ Error al corregir el examen:", error);
          setError(error.response?.data?.message || "Error inesperado al corregir el examen.");
        } finally {
          setLoading(false);
        }
      }
    });
  };



  const fetchCorrectionFromDB = async (examId, courseId) => {

    if (!/^[a-f\d]{24}$/i.test(examId)) {
      console.log("📌 ID no válido para MongoDB, se omite fetch desde la BD.");
      setLoading(false);
      return;
    }


    setLoading(true);
    try {
        const res = await axios.get(`http://localhost:5000/users/exam/correction/${examId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        console.log("📌 Respuesta del backend:", res.data); 

        if (res.data) {
            const correctedExam = {
                courseId,
                examId,
                exam: res.data.questions.map((question, index) => ({
                    question: question?.question || question?.text || "Pregunta no disponible",
                    options: question?.options || [],
                    correctAnswer: question?.correctAnswer || "No disponible",
                })),
                responses: res.data.responses || {},
                examLocked: true,
                finalScore: res.data.score || 0,
                examType: res.data.examType || "test",
                gradingResults: res.data.gradingResults || [], 
            };

            console.log("📌 Exam procesado en frontend:", correctedExam);

            localStorage.setItem(`examState_${courseId}_${examId}`, JSON.stringify(correctedExam));
            localStorage.setItem(`lastExamId_${courseId}`, examId);
            localStorage.setItem("selectedCourse", courseId);

            setExam(correctedExam.exam);
            const mappedResponses = Array.isArray(correctedExam.responses)
  ? correctedExam.responses.reduce((acc, val, i) => {
      acc[i] = val;
      return acc;
    }, {})
  : correctedExam.responses || {};

setResponses(mappedResponses);

            setExamLocked(correctedExam.examLocked);
            setFinalScore(correctedExam.finalScore);
            setExamType(correctedExam.examType);
            setGradingResults(correctedExam.gradingResults); 
        }
    } catch (error) {
        console.error("❌ Error al obtener la corrección desde BD:", error);
    }
    setLoading(false);
};


const handleResponseChange = (questionIndex, value) => {
  if (examLocked) return;

  const updatedResponses = { ...responses, [questionIndex]: value };
  setResponses(updatedResponses);
  saveExamState(updatedResponses); 
};

  
  const saveExamState = (updatedResponses) => {
    const examId = localStorage.getItem(`lastExamId_${courseId}`);
    if (!examId) return;
  
    const examState = {
      courseId,
      examId,
      exam,
      responses: updatedResponses,
      examLocked,
      finalScore,
      examType,
      numQuestions,
      gradingResults,
    };
  
    console.log("📌 Guardando estado del examen en localStorage:", examState);
    localStorage.setItem(`examState_${courseId}_${examId}`, JSON.stringify(examState));
  };
  const handleSaveExam = async () => {
    const examId = localStorage.getItem(`lastExamId_${courseId}`) || `exam_${courseId}_${Date.now()}`;
  
    const normalizedExam = exam.map(q => ({
      question: q.question,
      options: q.options || [],
      correctAnswer: q.answer || q.correctAnswer || "",
    }));
  
    const payload = {
      courseId,
      examType,
      exam: normalizedExam
    };
  
   
    const examState = {
      courseId,
      examId,
      exam: normalizedExam,
      responses: {}, 
      examLocked: false,
      finalScore: null,
      examType,
      gradingResults: null,
    };
  
    localStorage.setItem(`examState_${courseId}_${examId}`, JSON.stringify(examState));
    localStorage.setItem(`lastExamId_${courseId}`, examId);
  
    try {
      await axios.post("http://localhost:5000/saved-exams/save", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("✅ Guardado", "Examen guardado en la base de datos.", "success");
    } catch (err) {
      console.error("❌ Error al guardar examen en la BD:", err);
      Swal.fire("⚠️ Error", "No se pudo guardar el examen en la base de datos.", "error");
    }
  };
  



  const handleRetryExam = () => {
    Swal.fire({
      title: "¿Reintentar examen?",
      text: "Se reiniciará el examen con las mismas preguntas, pero se borrarán tus respuestas anteriores.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, reintentar"
    }).then((result) => {
      if (result.isConfirmed) {
        const newExamId = `exam_${courseId}_${Date.now()}`;
        const resetResponses = {};
  
        exam.forEach((_, idx) => {
          resetResponses[idx] = "";
        });
  
        const newExamState = {
          courseId,
          examId: newExamId,
          exam,
          responses: resetResponses,
          examLocked: false,
          finalScore: null,
          examType,
          gradingResults: null,
        };
  
        localStorage.setItem(`examState_${courseId}_${newExamId}`, JSON.stringify(newExamState));
        localStorage.setItem(`lastExamId_${courseId}`, newExamId);
        localStorage.setItem("selectedCourse", courseId);
  
        window.location.href = `/exam-generator?examId=${newExamId}&courseId=${courseId}`;
      }
    });
  };
  
  

  return (
    <div className="exam-container">
      <h2>📖 Generador de Exámenes</h2>

      <div className="exam-settings">
  { }
  <label className="exam-label">
  <span>Asignatura:</span>
  <select
    className="course-select"
    value={courseId}
    onChange={(e) => {
      setCourseId(e.target.value);
      localStorage.setItem("selectedCourse", e.target.value);
    }}
  >
    <option value="">Selecciona una asignatura</option>
    {courses.map((course) => (
      <option key={course._id} value={course._id}>
        {course.name}
      </option>
    ))}
  </select>
</label>

  { }
  <label className="exam-label tipo-examen">
  <span>Tipo de Examen:</span> 
    <div className="exam-type-options">
      <label className="radio-option">
        <input
          type="radio"
          name="examType"
          value="test"
          checked={examType === "test"}
          onChange={(e) => {
            setExamType(e.target.value);
            setExam([]);
            setResponses({});
            setGradingResults(null);
            setFinalScore(null);
            setExamLocked(false);
          }}
        />
        Opción Múltiple
      </label>
      <label className="radio-option">
        <input
          type="radio"
          name="examType"
          value="open"
          checked={examType === "open"}
          onChange={(e) => {
            setExamType(e.target.value);
            setExam([]);
            setResponses({});
            setGradingResults(null);
            setFinalScore(null);
            setExamLocked(false);
          }}
        />
        Preguntas Abiertas
      </label>
    </div>
  </label>

  { }
  <label className="exam-label num-preguntas">
  <span>Nº de Preguntas:</span> 
    <input
      type="number"
      value={numQuestions}
      onChange={(e) => setNumQuestions(Number(e.target.value))}
      min="1"
      max="20"
      className="num-questions-input"
    />
  </label>

  { }
  <button onClick={handleGenerateExam} className="generate-btn">
  Generar Examen
</button>

</div>


    {loading && <ClipLoader color="#007bff" size={50} className="loading-spinner" />}
    {error && <p className="error-message">{error}</p>}

    <div className="exam-content">
    {exam && exam.length > 0 ? (
    exam.map((q, idx) => (
        <div key={idx} className="exam-question">
            <p><strong>{`${idx + 1}. ${q.question}`}</strong></p>
            {examType === "test" && q.options && q.options.length > 0 ? (
                q.options.map((option, optIdx) => (
                    <div key={optIdx} className="exam-option">
                        <input
                            type="radio"
                            name={`q-${idx}`}
                            value={option}
                            checked={responses[idx] === option}
                            onChange={() => handleResponseChange(idx, option)}
                            disabled={examLocked}
                        />
                        <label>{option}</label>
                    </div>
                ))
            ) : (
                <textarea
                    value={responses[idx] || ""}
                    onChange={(e) => handleResponseChange(idx, e.target.value)}
                    placeholder="Escribe tu respuesta aquí..."
                    disabled={examLocked}
                />
            )}
            {gradingResults && gradingResults[idx] && (
                <div className="grading-feedback">
                    <p><strong>✅ Puntuación:</strong> {gradingResults[idx]?.score}/100</p>
                    <p><strong>💬 Comentario:</strong> {gradingResults[idx]?.feedback || "Sin comentarios"}</p>
                </div>
            )}
        </div>
    ))
) : (
    <p className="info-message">No hay preguntas generadas aún.</p>
)}


</div>


{finalScore !== null && (
  <div className="exam-results-container">
    <h3 className="final-score">
      Calificación Final: {finalScore}/100
    </h3>
  </div>
)}

{exam.length > 0 && !examLocked && (
  <div className="exam-results-container">
    <button 
      onClick={handleGradeExam} 
      className="grade-btn"
    >
      📝 Corregir Examen
    </button>

    {!isFromCatalog && (
      <button 
        className="retry-btn"
        onClick={handleSaveExam}
      >
        💾 Guardar Examen
      </button>
    )}
  </div>
)}

{exam.length > 0 && examLocked && isFromCatalog && (
  <div className="exam-results-container">
    <button 
      className="retry-btn"
      onClick={handleRetryExam}
    >
      🔁 Reintentar Examen
    </button>
  </div>
)}

  </div>
)}

export default ExamGenerator;