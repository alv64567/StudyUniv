import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Courses = () => {
  const [formData, setFormData] = useState({ name: '', description: '', files: [] });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files); 
    setFormData((prev) => ({ ...prev, files: selectedFiles }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const requestData = new FormData();
    requestData.append('name', formData.name);
    requestData.append('description', formData.description);
    
    if (formData.files.length > 0) { 
      formData.files.forEach((file) => requestData.append('files', file));
    }
  
    try {
      await axios.post('http://localhost:5000/courses', requestData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Asignatura creada con éxito.');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      console.error('Error al crear asignatura:', error);
      setMessage(error.response?.data?.message || 'Error al crear la asignatura.');
    }
    setLoading(false);
  };
  
  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-sm">
        <h2 className="text-center mb-4">Crear Nueva Asignatura</h2>

        {message && <div className="alert alert-info text-center">{message}</div>}

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
          <label className="form-label">Subir Material</label>
          <input
            type="file"
            name="files"
            multiple
            accept=".pdf"
            onChange={handleFileChange}
            className="form-control"
          />
            {formData.files.length > 0 && (
              <ul className="mt-2">
                {formData.files.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>

          { }
          <div className="d-flex justify-content-between align-items-center mt-4">
            <div className="mx-auto">
              <button type="submit" className="btn btn-primary px-4">
                Crear
              </button>
            </div>
            <div>
              <button
                type="button"
                className="btn btn-secondary px-4"
                onClick={() => navigate(-1)}
              >
                Volver
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Courses;
