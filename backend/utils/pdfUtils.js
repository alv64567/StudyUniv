
import fs from 'fs';
import pdf from 'pdf-parse';

export const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);

    // Convertir texto en string
    const text = data.text.replace(/\s+/g, ' ').trim(); // Eliminar espacios extra
    return text || ''; // Devuelve string vacío si no hay texto
  } catch (error) {
    console.error('Error al extraer texto del PDF:', error);
    throw new Error('No se pudo extraer el texto del PDF');
  }
};

