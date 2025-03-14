import React, { useState } from "react";
import axios from "axios";
import backgroundImage from "../src/assets/fondo1.jpg"

const Login = () => {
  const [formData, setFormData] = useState({
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
    console.log("Formulario enviado");
    try {
      const response = await axios.post(
        "http://localhost:5000/users/login",
        formData
      );
      const { token } = response.data;

      console.log("Respuesta del servidor:", response.data);
      console.log("Token recibido:", token);

      localStorage.setItem("token", token);
      console.log(
        "Token guardado en localStorage:",
        localStorage.getItem("token")
      );

      
      window.location.href = "/dashboard";
    } catch (error) {
      console.error(
        "Error al iniciar sesión:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.message || "Error al iniciar sesión");
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
          backdropFilter: "blur(5px)", // Desenfoque para mejor visibilidad
        }}
      >
        <h2 className="text-center mb-4 text-dark" style={{ fontWeight: "bold" }}>
          Iniciar Sesión
        </h2>
        <form onSubmit={handleSubmit}>
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
            Entrar
          </button>
        </form>
        <div className="text-center mt-3">
          <a href="/register" className="text-muted" style={{ fontSize: "0.9rem" }}>
            ¿No tienes cuenta? Regístrate aquí
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
