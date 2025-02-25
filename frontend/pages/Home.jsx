import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import image1 from "../src/assets/image1.jpg";
import image2 from "../src/assets/image2.jpg";
import image3 from "../src/assets/image3.jpg";
import "bootstrap/dist/css/bootstrap.min.css";
import { Carousel } from "bootstrap";

const Home = () => {
  const carouselRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (carouselRef.current) {
      new Carousel(carouselRef.current, {
        interval: 3000,
        ride: "carousel",
        pause: false,
        wrap: true,
      });
    }
  }, []);

  return (
    <div
      style={{
        background: "linear-gradient(to bottom, #f0f9ff, #e0f2fe)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "3rem",
        paddingBottom: "3rem",
      }}
    >
      <div className="text-center" style={{ padding: "2rem", maxWidth: "800px" }}>
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "700",
            marginBottom: "1rem",
            color: "#007bff",
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Aprendizaje Inteligente para Universitarios
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            marginBottom: "2rem",
            color: "#444",
            maxWidth: "700px",
            textAlign: "justify",
            fontFamily: "'Poppins', sans-serif",
            lineHeight: "1.6",
          }}
        >
          Organiza tus materias, crea exámenes y aprovecha al máximo la inteligencia artificial
          para mejorar tu rendimiento académico.
        </p>

        {token ? (
          <Link to="/dashboard" className="btn btn-success btn-lg m-2">
            Ir al Dashboard
          </Link>
        ) : (
          <div>
            <Link to="/login" className="btn btn-primary btn-lg m-2">
              Iniciar Sesión
            </Link>
            <Link to="/register" className="btn btn-outline-primary btn-lg m-2">
              Registrarse
            </Link>
          </div>
        )}
      </div>

      <div
        id="carouselExample"
        ref={carouselRef}
        className="carousel slide mt-5"
        data-bs-ride="carousel"
        style={{
          width: "90%",
          maxWidth: "900px",
          borderRadius: "15px",
          overflow: "hidden",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        }}
      >
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src={image1} className="d-block w-100" alt="Imagen 1" style={{ objectFit: "cover", height: "300px" }} />
          </div>
          <div className="carousel-item">
            <img src={image2} className="d-block w-100" alt="Imagen 2" style={{ objectFit: "cover", height: "300px" }} />
          </div>
          <div className="carousel-item">
            <img src={image3} className="d-block w-100" alt="Imagen 3" style={{ objectFit: "cover", height: "300px" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
