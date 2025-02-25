import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crear carpeta 'uploads' si no existe
const uploadsPath = path.join(path.resolve(), 'uploads');
if (!fs.existsSync(uploadsPath)) {
  console.log("Creando carpeta 'uploads'...");
  fs.mkdirSync(uploadsPath);
} else {
  console.log("Carpeta 'uploads' ya existe.");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directorio donde se guardarán los archivos
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Solo se permiten archivos PDF'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
});
