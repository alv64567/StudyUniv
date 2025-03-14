import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourse(response.data);
      } catch (error) {
        console.error('Error al obtener detalles de la asignatura:', error);
        setMessage('No se pudieron cargar los detalles de la asignatura.');
      }
    };

    fetchCourseDetails();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Asignatura eliminada con éxito.');
      setTimeout(() => navigate('/dashboard'), 1500); 
    } catch (error) {
      console.error('Error al eliminar la asignatura:', error);
      setMessage('Error al eliminar la asignatura.');
    }
  };

  
const handleDeleteMaterial = async (file) => {
  try {
    await axios.delete(`http://localhost:5000/courses/${id}/material`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { material: file }, 
    });
    setMessage('Material eliminado con éxito.');
    setCourse((prev) => ({
      ...prev,
      materials: prev.materials.filter((m) => m !== file),
    }));
  } catch (error) {
    console.error('Error al eliminar material:', error);
    setMessage('Error al eliminar el material.');
  }
};

  return (
    <div className="container mt-5">
      {course ? (
        <div className="card shadow-lg p-4">
          { }
          <h2 className="text-center mb-4" style={{ color: '#007bff', fontWeight: 'bold' }}>
            Detalles de la Asignatura
          </h2>

          { }
          <div className="row">
            <div className="col-md-12 text-center">
              <h4 className="mb-3" style={{ fontWeight: 'bold' }}>{course.name}</h4>
              <p className="text-muted">{course.description}</p>
            </div>
          </div>

          <div className="mt-4 text-center">
          <h5>Material Subido</h5>
          {course.materials && course.materials.length > 0 ? (
            <ul className="list-group">
              {course.materials.map((file, index) => (
                <li
                  key={index}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <a
                    href={`http://localhost:5000/uploads/${file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary"
                  >
            {file}
          </a>
          <div>
            <button
              className="btn btn-sm btn-success me-2"
              onClick={() =>
                window.open(`http://localhost:5000/uploads/${file}`, '_blank')
              }
            >
                Descargar
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDeleteMaterial(file)}
              >
                Eliminar
              </button>
          </div>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-muted">No se ha subido ningún material.</p>
  )}
</div>

        { }
        <div className="d-flex justify-content-center mt-4">
          <button
            className="btn btn-warning me-3"
            onClick={() => navigate(`/courses/edit/${id}`)}
          >
            <i className="fas fa-edit me-1"></i> Editar
          </button>
          <button
            className="btn btn-danger me-3"
            onClick={handleDelete}
          >
            <i className="fas fa-trash-alt me-1"></i> Eliminar
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard')}
          >
            <i className="fas fa-arrow-left me-1"></i> Volver
          </button>
        </div>

        { }
          {message && (
            <div className="alert alert-info text-center mt-3" role="alert">
              {message}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando detalles de la asignatura...</p>
        </div>
      )}
      
    </div>
    
  );
};

export default CourseDetails;
