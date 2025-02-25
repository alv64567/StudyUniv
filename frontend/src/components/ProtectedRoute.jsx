import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Obtén el token del localStorage
  const token = localStorage.getItem('token');

  // Si no hay token, redirige al inicio de sesión
  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
