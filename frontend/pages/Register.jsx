import React, { useState } from "react";
import axios from "axios";
import backgroundImage from "../src/assets/fondo1.jpg"; 

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/users/register",
        formData
      );
      console.log("Usuario registrado:", response.data);
      alert(response.data.message); 
      window.location.href = "/login"; 
    } catch (error) {
      console.error(
        "Error al registrar el usuario:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.message || "Error al registrar el usuario");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundImage: `url(${backgroundImage})`, 
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div
        className="card p-4 shadow-lg"
        style={{
          width: "400px",
          borderRadius: "12px",
          background: "rgba(255, 255, 255, 0.9)", 
          border: "1px solid #ddd",
          backdropFilter: "blur(5px)", // Efecto de desenfoque
        }}
      >
        <h2 className="text-center mb-4 text-dark" style={{ fontWeight: "bold" }}>
          Registrarse
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" style={{ fontWeight: "bold" }}>
              Nombre de Usuario
            </label>
            <input
              type="text"
              name="username"
              className="form-control"
              placeholder="Nombre de Usuario"
              value={formData.username}
              onChange={handleChange}
              required
              style={{
                borderRadius: "8px",
                padding: "10px",
                border: "1px solid #ccc",
                transition: "0.3s",
              }}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ fontWeight: "bold" }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                borderRadius: "8px",
                padding: "10px",
                border: "1px solid #ccc",
                transition: "0.3s",
              }}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ fontWeight: "bold" }}>
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                borderRadius: "8px",
                padding: "10px",
                border: "1px solid #ccc",
                transition: "0.3s",
              }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            style={{
              fontWeight: "bold",
              padding: "10px",
              borderRadius: "8px",
              transition: "0.3s",
            }}
          >
            Registrarse
          </button>
        </form>
        <div className="text-center mt-3">
          <a href="/login" className="text-muted" style={{ fontSize: "0.9rem" }}>
            ¿Ya tienes una cuenta? Inicia sesión aquí
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
