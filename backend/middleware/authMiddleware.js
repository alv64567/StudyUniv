import jwt from 'jsonwebtoken';
import User from '../config/models/user.model.js'; 


//garantizar solo usuarios autenticados

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado, falta el token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password'); 
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    next();
  } catch (error) {
    console.error('Error al validar el token:', error.message);
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

export default protect;
