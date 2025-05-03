import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./SummaryGenerator.css";
import { jwtDecode } from "jwt-decode";


const SummaryGenerator = () => {
  const [topic, setTopic] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [history, setHistory] = useState([]);
  const chatEndRef = useRef(null);
  const token = localStorage.getItem("token");
  const userId = token ? jwtDecode(token).id : null;
  const [maxWords, setMaxWords] = useState(100);

  // Al montar el componente, eliminamos la asignatura seleccionada previamente 
  useEffect(() => {
    localStorage.removeItem("selectedSummaryCourse");
  }, []);

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
    } else {
      setHistory([]); 
    }
  }, [courseId]);

  const fetchSummaryHistory = async (selectedCourseId) => {
    try {
      const key = `summaryHistory_${userId}_${selectedCourseId}`;
      const localHistory = localStorage.getItem(key);
  
      if (localHistory) {
        setHistory(JSON.parse(localHistory));
      } else {
        const res = await axios.get(
          `http://localhost:5000/courses/summary/history/${selectedCourseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        console.log("📌 Resúmenes recibidos del servidor:", res.data.history);
  
        const formattedHistory = res.data.history.flatMap(item => ([
          { sender: "user", content: item.topic },
          { sender: "ai", content: item.summary }
        ]));
  
        setHistory(formattedHistory);
        localStorage.setItem(key, JSON.stringify(formattedHistory));
      }
    } catch (error) {
      console.error("❌ Error al obtener historial del resumen:", error);
    }
  };
  

  const handleCourseChange = (e) => {
    const newCourseId = e.target.value;
    setCourseId(newCourseId);
    localStorage.setItem("selectedSummaryCourse", newCourseId);
    setHistory([]);
    if (newCourseId) {
      fetchSummaryHistory(newCourseId);
    }
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
      localStorage.setItem(`summaryHistory_${userId}_${courseId}`, JSON.stringify(newHistory));
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
      <select className="course-select" value={courseId} onChange={handleCourseChange}>
        <option value="">Selecciona una asignatura</option>
        {courses.map((course) => (
          <option key={course._id} value={course._id}>
            {course.name}
          </option>
        ))}
      </select>

      <div className="summary-content">
      <div className="summary-box container">
  {history.map((msg, index) => (
    <div className="row mb-2" key={index}>
      <div className={`col-12 d-flex ${msg.sender === "user" ? "justify-content-end" : "justify-content-start"}`}>
        <div className={`message ${msg.sender}`}>
          {msg.content}
        </div>
      </div>
    </div>
  ))}
  <div ref={chatEndRef} />
</div>

<form onSubmit={handleSubmit} className="summary-input container px-0">
  <div className="row g-2 align-items-center">
    <div className="col-12 col-md">
      <div className="d-flex gap-2 align-items-center">
        <input
          type="text"
          className="form-control"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Escribe un tema..."
          disabled={loading}
        />
        <div className="word-control flex-shrink-0">
          <label className="word-slider-label">Palabras: {maxWords}</label>
          <input
            type="range"
            min="50"
            max="500"
            step="10"
            value={maxWords}
            onChange={(e) => setMaxWords(Number(e.target.value))}
            className="form-range"
          />
        </div>
        <button type="submit" className="btn btn-primary btn-sm flex-shrink-0" disabled={loading}>
          {loading ? "..." : "Generar"}
        </button>
      </div>
    </div>
  </div>
</form>

  </div>
</div>
  );
};

export default SummaryGenerator;