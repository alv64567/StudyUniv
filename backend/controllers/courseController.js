import Course from '../config/models/course.model.js';
import fs from 'fs';
import { extractTextFromPDF } from '../utils/pdfUtils.js';
import path from 'path';
import { OpenAI } from 'openai';
import Chat from "../config/models/chat.model.js"; 

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

export const createCourse = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'El nombre del curso es obligatorio.' });
  }

  try {
    let materials = [];
    let extractedText = '';

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const filePath = path.join('uploads', file.filename);
        materials.push(file.filename);
        let rawText = await extractTextFromPDF(filePath);
        extractedText += Array.isArray(rawText) ? rawText.join(' ') + '\n\n' : rawText.trim() + '\n\n';
      }
    }

    const course = new Course({
      name,
      description,
      materials,
      extractedText, 
      user: req.user.id,
    });

    const savedCourse = await course.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    console.error('Error al crear el curso:', error);
    res.status(500).json({ message: 'Error al crear el curso.' });
  }
};
  


export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ user: req.user.id })
      .select('name _id createdAt') 
      .lean(); // Convierte documentos de Mongoose en objetos JSON simples

    res.status(200).json(courses);
  } catch (error) {
    console.error('Error al obtener los cursos:', error);
    res.status(500).json({ message: 'Error al obtener los cursos.' });
  }
};


export const updateCourse = async (req, res) => {
  const { name, description } = req.body;

  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado.' });
    }

    if (course.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'No autorizado para actualizar este curso.' });
    }

   
    course.name = name || course.name;
    course.description = description || course.description;

    let extractedText = course.extractedText; 
    let newMaterials = [];

    // Si se cargan nuevos archivos, procesarlos
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const filePath = path.join('uploads', file.filename);
        newMaterials.push(file.filename);

        // Extraer texto del nuevo PDF y combinarlo con el existente
        let rawText = await extractTextFromPDF(filePath);
        extractedText += Array.isArray(rawText) ? rawText.join(' ') + '\n\n' : rawText.trim() + '\n\n';
      }
    }

    // Combinar materiales antiguos con los nuevos
    course.materials = [...course.materials, ...newMaterials];

    // Actualizar el texto extraído en la base de datos
    course.extractedText = extractedText;

    const updatedCourse = await course.save();
    res.status(200).json(updatedCourse);
  } catch (error) {
    console.error('Error al actualizar el curso:', error);
    res.status(500).json({ message: 'Error al actualizar el curso.' });
  }
};


export const getCourseById = async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
  
      if (!course) {
        return res.status(404).json({ message: 'Curso no encontrado.' });
      }

      if (course.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'No autorizado.' });
      }
  
      res.status(200).json(course);
    } catch (error) {
      console.error('Error al obtener el curso:', error);
      res.status(500).json({ message: 'Error al obtener el curso.' });
    }
  };

  export const checkCourseMaterial = async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
  
      if (!course) {
        return res.status(404).json({ message: 'Curso no encontrado.' });
      }
  
      // Verificar si el curso tiene materiales adjuntos
      const hasMaterial = course.materials && course.materials.length > 0;
      res.status(200).json({ hasMaterial });
    } catch (error) {
      console.error('Error al verificar el material del curso:', error);
      res.status(500).json({ message: 'Error al verificar el material del curso.' });
    }
  };
  


export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado.' });
    }

    if (course.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'No autorizado.' });
    }

    // Eliminar materiales del servidor
    if (course.materials && course.materials.length > 0) {
      course.materials.forEach((file) => {
        const filePath = path.join(path.resolve(), 'uploads', file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await Course.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: 'Curso eliminado con éxito.' });
  } catch (error) {
    console.error('Error al eliminar el curso:', error);
    res.status(500).json({ message: 'Error al eliminar el curso.' });
  }
};


export const deleteMaterial = async (req, res) => {
  const { material } = req.body; 
  const courseId = req.params.id;

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado.' });
    }

   
    if (course.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'No autorizado.' });
    }

    if (!course.materials.includes(material)) {
      return res.status(404).json({ message: 'Archivo no encontrado en el curso.' });
    }

    // Eliminar el archivo
    const filePath = path.join(path.resolve(), 'uploads', material);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); 
    }

    // Actualizar la base de datos
    course.materials = course.materials.filter((m) => m !== material);
    await course.save();

    res.status(200).json({ message: 'Material eliminado con éxito.' });
  } catch (error) {
    console.error('Error al eliminar material:', error);
    res.status(500).json({ message: 'Error al eliminar el material.' });
  }
};


export const getSummaryHistory = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id;

  try {
    const chat = await Chat.findOne({ user: userId, courseId });

    if (!chat) {
      return res.json({ history: [] });
    }

    const summaryMessages = chat.messages
      .filter(msg => msg.type === "summary")
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    console.log("📌 Historial de resúmenes recuperado:", summaryMessages);

    res.json({ history: summaryMessages });
  } catch (error) {
    console.error("❌ Error al obtener historial de resúmenes:", error);
    res.status(500).json({ message: "Error al obtener historial del resumen." });
  }
};








