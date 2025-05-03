import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./ChatAI.css";
import { jwtDecode } from "jwt-decode";

const ChatAI = () => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState(localStorage.getItem("selectedCourse") || "");
  const chatEndRef = useRef(null);
  const token = localStorage.getItem("token");
  const userId = token ? jwtDecode(token).id : null;

  // Al montar el componente, eliminamos la asignatura seleccionada previamente
useEffect(() => {
  localStorage.removeItem("selectedCourse");
  setCourseId("");
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
      fetchChatHistory(courseId);
    }
  }, [courseId]);

  const fetchChatHistory = async (selectedCourseId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/courses/chat/history/${selectedCourseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log("📌 Historial recibido del servidor:", res.data);
  
      const formattedHistory = res.data.flatMap(chat => ([
        { sender: "user", content: chat.question },
        { sender: "ai", content: chat.answer }
      ]));
  
      setMessages(formattedHistory);
      localStorage.setItem(`chatHistory_${userId}_${selectedCourseId}`, JSON.stringify(formattedHistory));
    } catch (error) {
      console.error("❌ Error al obtener historial del chat:", error);
    }
  };
  

  const handleCourseChange = (e) => {
    const newCourseId = e.target.value;
    setCourseId(newCourseId);
    localStorage.setItem("selectedCourse", newCourseId);
    setMessages([]);
    fetchChatHistory(newCourseId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!courseId || !question) {
      alert("Debe seleccionar una asignatura y escribir una pregunta.");
      return;
    }

    setLoading(true);

    try {
      const payload = { courseId, question };
      const res = await axios.post(
        "http://localhost:5000/courses/chat",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newMessages = [
        ...messages,
        { sender: "user", content: question },
        { sender: "ai", content: res.data.response },
      ];

      setMessages(newMessages);
      localStorage.setItem(`chatHistory_${userId}_${courseId}`, JSON.stringify(newMessages));
      setQuestion("");
    } catch (error) {
      console.error("❌ Error en el chat:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-container">
      <h2>Chat para Resolver Dudas</h2>
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

      <div className="chat-content">
      <div className="chat-box container">
  {messages.map((msg, index) => (
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

<form onSubmit={handleSubmit} className="chat-input container">
  <div className="row g-2">
    <div className="col-9 col-sm-10">
      <input
        type="text"
        className="form-control"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Escribe tu pregunta..."
        disabled={loading}
      />
    </div>
    <div className="col-3 col-sm-2 d-grid">
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "..." : "Enviar"}
      </button>
    </div>
  </div>
</form>

      </div>
    </div>
  );
};

export default ChatAI;