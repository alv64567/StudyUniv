import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [existingFiles, setExistingFiles] = useState([]); 
  const [newFiles, setNewFiles] = useState([]); 
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData({ name: response.data.name, description: response.data.description });
        setExistingFiles(response.data.materials || []); 
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
    setNewFiles(Array.from(e.target.files));
  };


  const handleRemoveExistingFile = (file) => {
    setExistingFiles(existingFiles.filter((f) => f !== file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);

    existingFiles.forEach((file) => formDataToSend.append('existingFiles', file));

    newFiles.forEach((file) => formDataToSend.append('files', file));

    try {
      await axios.put(`http://localhost:5000/courses/${id}`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
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

        {message && <div className="alert alert-info text-center">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nombre de la Asignatura</label>
            <input
              type="text"
              name="name"
              className="form-control"
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
              rows="3"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          { }
          <div className="mb-3">
            <label className="form-label">Material Existente</label>
            {existingFiles.length > 0 ? (
              <ul className="list-group">
                {existingFiles.map((file, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    <a href={`http://localhost:5000/uploads/${file}`} target="_blank" rel="noopener noreferrer">
                      {file}
                    </a>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleRemoveExistingFile(file)}
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No hay archivos subidos.</p>
            )}
          </div>

          { }
          <div className="mb-3">
            <label className="form-label">Subir Nuevos Materiales</label>
            <input
              type="file"
              className="form-control"
              multiple
              accept=".pdf"
              onChange={handleFileChange}
            />
            {newFiles.length > 0 && (
              <ul className="mt-2">
                {newFiles.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="d-flex justify-content-center">
            <button type="submit" className="btn btn-primary me-3">
              Guardar Cambios
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(`/courses/${id}`)}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourse;
