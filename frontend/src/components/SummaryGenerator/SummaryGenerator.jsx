import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./SummaryGenerator.css";

const SummaryGenerator = () => {
  const [topic, setTopic] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState(localStorage.getItem('selectedSummaryCourse') || '');
  const [history, setHistory] = useState([]);
  const chatEndRef = useRef(null);
  const token = localStorage.getItem("token");
  const [maxWords, setMaxWords] = useState(100);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(res.data);
      } catch (error) {
        console.error("❌ Error al obtener las asignaturas:", error);
      }
    };

    fetchCourses();
  }, [token]);

  useEffect(() => {
    if (courseId) {
      fetchSummaryHistory(courseId);
    }
  }, [courseId]);

  const fetchSummaryHistory = async (selectedCourseId) => {
    try {
      const localHistory = localStorage.getItem(`summaryHistory_${selectedCourseId}`);
      if (localHistory) {
        setHistory(JSON.parse(localHistory));
      } else {
        const res = await axios.get(
          `http://localhost:5000/courses/summary/history/${selectedCourseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("📌 Resúmenes recibidos del servidor:", res.data.history);
        setHistory(res.data.history || []);
        localStorage.setItem(`summaryHistory_${selectedCourseId}`, JSON.stringify(res.data.history));
      }
    } catch (error) {
      console.error("❌ Error al obtener historial del resumen:", error);
    }
  };

  const handleCourseChange = (e) => {
    const newCourseId = e.target.value;
    setCourseId(newCourseId);
    localStorage.setItem('selectedSummaryCourse', newCourseId);
    setHistory([]);
    fetchSummaryHistory(newCourseId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!courseId || !topic) {
      alert("Debe seleccionar una asignatura y escribir un tema.");
      return;
    }

    setLoading(true);

    try {
      const payload = { courseId, topic, maxWords };
      console.log("📌 Enviando solicitud con payload:", payload);

      const res = await axios.post(
        "http://localhost:5000/courses/summary",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newHistory = [
        ...history,
        { sender: "user", content: topic },
        { sender: "ai", content: res.data.summary },
      ];

      setHistory(newHistory);
      localStorage.setItem(`summaryHistory_${courseId}`, JSON.stringify(newHistory));
      setSummary(res.data.summary);
      setTopic("");
    } catch (error) {
      console.error("❌ Error al generar el resumen:", error);

      if (error.response) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("Error desconocido al generar el resumen.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  return (
    <div className="summary-container">
      <h2>Generador de Resúmenes</h2>
      <select
        className="course-select"
        value={courseId}
        onChange={handleCourseChange}
      >
        <option value="">Selecciona una asignatura</option>
        {courses.map((course) => (
          <option key={course._id} value={course._id}>
            {course.name}
          </option>
        ))}
      </select>

      <label className="word-slider-label">Número de palabras: {maxWords}</label>
      <input
        type="range"
        min="50"
        max="500"
        step="10"
        value={maxWords}
        onChange={(e) => setMaxWords(Number(e.target.value))}
        className="word-slider"
      />

      <div className="summary-content">
        <div className="summary-box">
          {history.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <p>{msg.content}</p>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="summary-input">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Escribe un tema..."
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Generando..." : "Generar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SummaryGenerator;
