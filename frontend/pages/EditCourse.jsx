import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditCourse = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [file, setFile] = useState(null); 
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData({ name: response.data.name, description: response.data.description });
      } catch (error) {
        console.error('Error al cargar los detalles:', error);
      }
    };

    fetchCourseDetails();
  }, [id, token]);

  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    for (const file of formData.files) {
      formDataToSend.append('files', file);
    }
  
    try {
      await axios.put(`http://localhost:5000/courses/${id}`, formDataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Asignatura actualizada con éxito.');
      setTimeout(() => navigate(`/courses/${id}`), 1500);
    } catch (error) {
      console.error('Error al actualizar la asignatura:', error);
      setMessage('Error al actualizar la asignatura.');
    }
  };
  
  
  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-lg">
        <h2 className="text-center mb-4" style={{ color: '#007bff' }}>Editar Asignatura</h2>

        { }
        {message && (
          <div className="alert alert-info text-center">{message}</div>
        )}

        { }
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nombre de la Asignatura</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Ej: Álgebra Lineal"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Descripción</label>
            <textarea
              name="description"
              className="form-control"
              placeholder="Breve descripción de la asignatura"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label">Subir Nuevo Material</label>
            <input
              type="file"
              className="form-control"
              onChange={handleFileChange}
            />
          </div>
          <div className="d-flex justify-content-center">
            <button type="submit" className="btn btn-primary me-3">
              Guardar Cambios
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`/courses/${id}`)}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourse;
