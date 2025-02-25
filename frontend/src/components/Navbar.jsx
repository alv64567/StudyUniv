import React, { useState, useEffect, useRef } from 'react'; 

import { Link, NavLink } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import defaultAvatar from '../assets/avatar.png';
import axios from 'axios';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null); 

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5000/users/profile', { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    window.location.href = '/login';
  };


//  Cierra el dropdown, clic fuera
useEffect(() => {
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  if (showDropdown) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [showDropdown]);



  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        backgroundColor: '#ffffff',
        padding: '1rem 2rem',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="container-fluid d-flex justify-content-between align-items-center">
        
        { }
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img src={logo} alt="Logo" style={{ width: '40px', height: '40px', marginRight: '10px' }} />
          <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#000000' }}>
            StudyUniv
          </span>
        </Link>

        { }
        <div className="d-flex align-items-center">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                style={{
                  color: '#000000',
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '1rem',
                  fontWeight: '500',
                  marginRight: '1rem',
                  textDecoration: 'none',
                }}
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="btn"
                style={{
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '1rem',
                  fontWeight: '500',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '30px',
                  textDecoration: 'none',
                  border: 'none',
                }}
              >
                Registrar
              </Link>

            </>
          ) : (
            <>
              <ul className="navbar-nav me-auto mb-2 mb-lg-0 d-flex align-items-center">
                
                { }
                <li className="nav-item">
                  <NavLink
                    className="nav-link d-flex align-items-center"
                    to="/chat-ai"
                    style={{ color: '#000000', fontSize: '1rem', fontWeight: '500', marginRight: '1rem' }}
                  >
                    <span className="material-icons" style={{ marginRight: '5px' }}>chat</span>
                    Chat AI
                  </NavLink>
                </li>

                { }
                <li className="nav-item">
                  <NavLink
                    className="nav-link d-flex align-items-center"
                    to="/exam-generator"
                    style={{ color: '#000000', fontSize: '1rem', fontWeight: '500', marginRight: '1rem' }}
                  >
                    <span className="material-icons" style={{ marginRight: '5px' }}>create</span>
                    Generador de Exámenes
                  </NavLink>
                </li>

                { }
                <li className="nav-item">
                  <NavLink
                    className="nav-link d-flex align-items-center"
                    to="/summary-generator"
                    style={{ color: '#000000', fontSize: '1rem', fontWeight: '500', marginRight: '1rem' }}
                  >
                    <span className="material-icons" style={{ marginRight: '5px' }}>description</span>
                    Generador de Resúmenes
                  </NavLink>
                </li>
              </ul>

              { }
              <div className="position-relative" ref={dropdownRef}>  { }
              <img
                src={user?.profilePicture || defaultAvatar}
                alt="Perfil"
                className="rounded-circle"
                style={{ width: '45px', height: '45px', cursor: 'pointer' }}
                onClick={() => setShowDropdown(!showDropdown)}
              />
              {showDropdown && (
                              <div
                              className="dropdown-menu show position-absolute end-0 mt-2 p-2"
                              style={{ minWidth: '200px', boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)' }}
                            >
                              <Link to="/grades" className="dropdown-item">📚 Libro de Calificaciones</Link>
                              <Link to="/settings" className="dropdown-item">⚙️ Configuración</Link>
                              <div className="dropdown-divider"></div>
                              <button className="dropdown-item text-danger" onClick={handleLogout}>Cerrar sesión</button>
                            </div>
                          )}
                    </div>
                    </>
                  )}
                </div>
              </div>
            </nav>
          );
          };

export default Navbar;
