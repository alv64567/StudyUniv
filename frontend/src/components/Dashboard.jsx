import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/courses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data);
    } catch (error) {
      console.error('❌ Error al obtener asignaturas:', error);
    } finally {
      setLoading(false); 
    }
  };

 
  const coursesList = useMemo(() => {
    return courses.map((course) => (
      <Link
        to={`/courses/${course._id}`}
        key={course._id}
        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
      >
        <span>{course.name}</span>
        <span className="badge bg-primary rounded-pill">Ver detalles</span>
      </Link>
    ));
  }, [courses]);

  return (
    <div className="container mt-5">
      { }
      <div className="row">
        <div className="col-12 text-center mb-5">
          <h1 style={{ fontWeight: 'bold', color: '#007bff' }}>Bienvenido a tu Dashboard</h1>
          <p className="text-muted">Gestiona tus asignaturas y maximiza tu aprendizaje con IA.</p>
        </div>
      </div>

      { }
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-lg h-100">
            <div className="card-body text-center">
              <h3 className="card-title" style={{ color: '#007bff' }}>Crear Nueva Asignatura</h3>
              <p className="text-muted">Añade un nombre y una descripción para empezar.</p>
              <Link to="/courses" className="btn btn-primary">Crear Asignatura</Link>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-lg h-100">
            <div className="card-body text-center">
              <h3 className="card-title" style={{ color: '#007bff' }}>Cómo Empezar</h3>
              <ul className="list-group text-start">
                <li className="list-group-item"><strong>1.</strong> Crea una asignatura en <Link to="/courses">"Crear Asignatura"</Link>.</li>
                <li className="list-group-item"><strong>2.</strong> Sube material como apuntes o PDFs.</li>
                <li className="list-group-item"><strong>3.</strong> Genera resúmenes, chatea con IA o crea exámenes.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      { }
      <div className="row mt-5">
        <div className="col-12">
          <h3 style={{ color: '#007bff' }}>Tus Asignaturas</h3>
          <p className="text-muted">Gestiona tus asignaturas desde aquí:</p>
          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2">Cargando asignaturas...</p>
            </div>
          ) : courses.length > 0 ? (
            <div className="list-group">{coursesList}</div>
          ) : (
            <p className="text-center">Aún no has creado asignaturas. ¡Crea una ahora!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
