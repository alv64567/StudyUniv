import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import defaultAvatar from '../assets/avatar.png';
import axios from 'axios';


const DropdownItem = ({ to, iconName, text, iconColor }) => (
  <Link to={to} className="dropdown-item d-flex align-items-center py-2 px-3">
    <span className="material-icons me-2" style={{ fontSize: '20px', color: iconColor || 'inherit' }}>
      {iconName}
    </span>
    {text}
  </Link>
);

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) fetchUserProfile();
  }, [isAuthenticated]);

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5000/users/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUser(res.data);
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('selectedCourse');
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('chatHistory_') || key.startsWith('summaryHistory_')) {
        localStorage.removeItem(key);
      }
    });
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth >= 992) setIsMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white py-2 px-3 shadow-sm">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        { }
        <Link to="/" className="navbar-brand d-flex align-items-center me-3">
          <img src={logo} alt="Logo" style={{ width: '36px', height: '36px', marginRight: '10px' }} />
          <span className="fw-bold fs-5 text-dark">StudyUniv</span>
        </Link>

        { }
        {isAuthenticated && !isMobile && (
          <ul className="navbar-nav flex-row gap-5 mx-auto"> { }
           <ul className="navbar-nav flex-row gap-5 mx-auto">
  <NavItem to="/chat-ai" iconName="chat" text="Chat AI" iconColor="#2196f3" />
  <NavItem to="/exam-generator" iconName="create" text="Generador de Exámenes" iconColor="#673ab7" />
  <NavItem to="/exam-catalog" iconName="menu_book" text="Catálogo de Exámenes" iconColor="#3f51b5" />
  <NavItem to="/summary-generator" iconName="description" text="Generador de Resúmenes" iconColor="#009688" />
</ul>
      </ul>
    )}

        { }
        <div className="d-flex align-items-center">
          {isAuthenticated && isMobile && (
            <button
              className="navbar-toggler border-0 me-2"
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          )}

          {isAuthenticated ? (
            <div className="position-relative" ref={dropdownRef}>
              <img
                src={user?.profilePicture || defaultAvatar}
                alt="Perfil"
                className="rounded-circle border"
                style={{ width: '42px', height: '42px', objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => setShowDropdown(!showDropdown)}
              />
              {showDropdown && (
                <div className="dropdown-menu show position-absolute end-0 mt-2 p-2 shadow-lg rounded-3" style={{ minWidth: '220px', zIndex: 1050 }}>
                 <div className="px-3 py-2 text-center border-bottom">
                <h6 className="mb-1 fw-bold">Usuario</h6>
                <div style={{ fontSize: '15px' }}>{user?.username || ''}</div>
              </div>

                  <DropdownItem to="/grades" iconName="menu_book" text="Libro de Calificaciones" iconColor="#3f51b5" />
                  <DropdownItem to="/statistics" iconName="bar_chart" text="Estadísticas" iconColor="#4caf50" />
                  <DropdownItem to="/settings" iconName="settings" text="Configuración" iconColor="#ff9800" />


                  <div className="dropdown-divider my-1"></div>
                  <div
                  className="dropdown-item text-danger d-flex align-items-center"
                  role="button"
                  onClick={handleLogout}
                >
                  <span className="material-icons me-2" style={{ color: '#e53935' }}>logout</span>
                  Cerrar sesión
                </div>

                </div>
              )}
            </div>
          ) : (
            <div className="d-flex gap-2">
              <Link to="/login" className="btn btn-outline-dark rounded-pill px-4">Iniciar sesión</Link>
              <Link to="/register" className="btn btn-dark rounded-pill px-4">Registrar</Link>
            </div>
          )}
        </div>
      </div>

      { }
      {isAuthenticated && isMobile && isMenuOpen && (
  <div className="navbar-collapse">
    <ul className="navbar-nav flex-column mt-3">
      <NavItem to="/chat-ai" iconName="chat" text="Chat AI" iconColor="#2196f3" />
      <NavItem to="/exam-generator" iconName="create" text="Generador de Exámenes" iconColor="#673ab7" />
      <NavItem to="/exam-catalog" iconName="menu_book" text="Catálogo de Exámenes" iconColor="#3f51b5" />
      <NavItem to="/summary-generator" iconName="description" text="Generador de Resúmenes" iconColor="#009688" />
    </ul>
  </div>
)}
    </nav>
  );
};

const NavItem = ({ to, iconName, text, iconColor }) => (
  <li className="nav-item">
    <NavLink
      to={to}
      className={({ isActive }) =>
        `nav-link d-flex align-items-center py-2 ${isActive ? 'fw-bold text-primary' : 'text-dark'}`
      }
      style={{ fontSize: '1rem', fontWeight: '500', marginRight: '1rem' }}
    >
      <span className="material-icons me-2" style={{ fontSize: '20px', color: iconColor || 'inherit' }}>
        {iconName}
      </span>
      {text}
    </NavLink>
  </li>
);




export default Navbar;
