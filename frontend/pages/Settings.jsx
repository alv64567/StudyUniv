import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Settings.css'; 

const Settings = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', profilePicture: '' });
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/users/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setFormData({
          username: res.data.username || '',
          email: res.data.email || '',
          password: '',
          profilePicture: res.data.profilePicture || '',
        });
        setPreviewImage(res.data.profilePicture);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, profilePicture: reader.result }));
      setPreviewImage(reader.result);
    };
    if (file) reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/users/update-profile', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      
      localStorage.setItem('username', formData.username);
      localStorage.setItem('profilePicture', formData.profilePicture);
      
      alert('Perfil actualizado correctamente');
      window.location.reload();
      
    } catch (err) {
      console.error(err);
      alert('❌ Error al actualizar perfil');
    }
  };
  
  return (
    <div className="settings-container">
      <h2>Configuración de Perfil</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre de Usuario</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Correo Electrónico</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Nueva Contraseña (opcional)</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Foto de Perfil</label>
          {previewImage && <img src={previewImage} alt="Preview" className="profile-preview" />}
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>

        <button type="submit" className="save-button">Guardar Cambios</button>
      </form>
    </div>
  );
};

export default Settings;
