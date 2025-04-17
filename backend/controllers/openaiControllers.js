import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

import Chat from '../config/models/chat.model.js';

import Course from '../config/models/course.model.js';

import Score from '../config/models/score.model.js';

import Exam from "../config/models/exam.model.js";

import Summary from '../config/models/summary.model.js';

import mongoose from "mongoose";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// Dividir texto por páginas y fragmentos
// Función para dividir texto en fragmentos de tamaño manejable

const splitTextByTokens = (text, maxTokens) => {
  const regex = new RegExp(`(.|[\\r\\n]){1,${maxTokens}}`, 'g');
  return text.match(regex) || [];
};

// Obtener embeddings para texto(convertir texto en vectores)
const getEmbeddings = async (texts) => {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: texts,
  });
  return response.data.map((item) => item.embedding);
};

// Calcular similitud coseno entre vectores
const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
};

// Seleccionar fragmentos relevantes
const findRelevantChunks = async (topic, fragments) => {
  const embeddings = await getEmbeddings([topic, ...fragments]);
  const topicEmbedding = embeddings[0];
  const fragmentEmbeddings = embeddings.slice(1);

  const scores = fragmentEmbeddings.map((embedding, idx) => ({
    text: fragments[idx],
    score: cosineSimilarity(topicEmbedding, embedding),
  }));

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, 5).map((item) => item.text); // Limitar a los 5 fragmentos más relevantes
};


// Controladores

//Responder preguntas con contexto relevante
export const answerQuestionWithContext = async (req, res) => {
  const { question, pdfText } = req.body;

  if (!question || !pdfText) {
    return res.status(400).json({ message: "La pregunta y el texto del PDF son obligatorios." });
  }

  try {
    // Divide el texto en fragmentos si es muy largo
    const maxTokens = 1000;
    const fragments = splitTextByTokens(pdfText, maxTokens);

    const relevantChunks = fragments.slice(0, 5);

    const context = relevantChunks.join("\n\n");
    const prompt = `
      Usa el siguiente contexto para responder la pregunta de manera precisa:
      ${context}

      Pregunta: "${question}"
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });

    res.status(200).json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error("Error en OpenAI:", error.response?.data || error.message);
    res.status(500).json({ message: "Error interno al procesar la solicitud." });
  }
};


export const chatWithAI = async (req, res) => {
  const { question, courseId } = req.body;
  const userId = req.user.id;

  if (!question || !courseId) {
    return res.status(400).json({ message: "La pregunta y la asignatura son obligatorias." });
  }

  try {
    const course = await Course.findById(courseId);
    if (!course || !course.extractedText) {
      return res.status(400).json({ message: "No se encontró material para este curso." });
    }


    const maxTokensPerChunk = 1000;
const fragments = splitTextByTokens(course.extractedText.trim(), maxTokensPerChunk);

const relevantChunks = await findRelevantChunks(question, fragments);
const context = relevantChunks.join("\n\n");

const prompt = `
  Material del curso:\n${context}
  Pregunta del usuario: ${question}
  Responde de manera clara y concisa en base al material proporcionado.
`;


    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content.trim();

    const newChat = new Chat({
      userId,
      courseId,
      question,
      answer: response,
      createdAt: new Date(),
    });

    await newChat.save();

    console.log("📌 Pregunta y respuesta guardadas en la base de datos:", newChat);

    res.status(200).json({ response });
  } catch (error) {
    console.error("❌ Error en chatWithAI:", error);
    res.status(500).json({ message: "Error en el chat." });
  }
};

export const generateExam = async (req, res) => {
  const { topic, numQuestions, examType } = req.body;
  const userId = req.user.id;

  if (!topic || topic.length !== 24) {
    return res.status(400).json({ message: "❌ Error: ID de curso inválido." });
  }

  try {
    const course = await Course.findById(topic);
    if (!course) {
      return res.status(404).json({ message: "❌ Curso no encontrado." });
    }

    let documentation = course.extractedText;
    if (!documentation || documentation.trim() === "") {
      return res.status(404).json({ message: "❌ No hay documentación para este curso." });
    }

    const maxTokensPerFragment = 2000;
    const fragments = documentation.match(new RegExp(`.{1,${maxTokensPerFragment}}`, "g")) || [];
    const relevantChunks = fragments.slice(0, 3).join("\n\n");

    const prompt = `
    Genera un examen de ${numQuestions} preguntas basado en el siguiente contenido del curso.
    Las preguntas deben ser del tipo '${examType}'.
    
    Si es de opción múltiple, incluye 4 opciones y la respuesta correcta. 
    
    📖 **Contenido del curso**:
    ${relevantChunks}

    ### Formato de salida obligatorio (devuelve solo un JSON válido sin texto adicional):
    [
      {
        "question": "¿Qué función desempeña GRUB en un sistema Unix?",
        "options": ["A) Administrar servicios y demonios", "B) Modificar la organización de directorios", "C) Modificar las opciones al arrancar el equipo", "D) Cambiar el nivel de ejecución del sistema"],
        "answer": "C) Modificar las opciones al arrancar el equipo"
      }
    ]
    `;

    console.log("📌 Prompt enviado a OpenAI:", prompt);

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    if (!completion.choices || completion.choices.length === 0) {
      throw new Error("❌ No se recibió una respuesta válida de OpenAI.");
    }

    let responseText = completion.choices[0].message.content.trim();
    console.log("📌 Respuesta de OpenAI:", responseText);

    const jsonMatch = responseText.match(/\[.*\]/s);
    if (!jsonMatch) {
      throw new Error("❌ OpenAI devolvió una respuesta sin JSON válido.");
    }

    let generatedExam;
    try {
      generatedExam = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("❌ Error al parsear JSON:", parseError);
      return res.status(500).json({ message: "Error al interpretar la respuesta de OpenAI." });
    }

    if (!Array.isArray(generatedExam)) {
      throw new Error("❌ OpenAI devolvió un objeto en lugar de un array.");
    }

    const newExam = new Exam({
      userId,
      courseId: topic,
      examType,
      examLocked: false,
      finalScore: null,
      responses: [],
      gradingResults: [],
      questions: generatedExam.map(q => ({
        question: q.question,
        options: q.options || [],
        correctAnswer: q.answer
      })),
    });

    await newExam.save();

    console.log("✅ Examen guardado correctamente en la base de datos.");

    res.status(200).json({ examId: newExam._id, exam: generatedExam });

  } catch (error) {
    console.error("❌ Error en generateExam:", error.message);
    res.status(500).json({ message: "❌ Error al generar el examen." });
  }
};

export const getSummary = async (req, res) => {
  const { topic, courseId, maxWords = 100 } = req.body;
  const userId = req.user.id;

  if (!topic || !courseId) {
    return res.status(400).json({ message: "El tema y la asignatura son obligatorios." });
  }

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    if (!course.extractedText || course.extractedText.trim() === "") {
      return res.status(404).json({ message: "No hay material en este curso para generar un resumen." });
    }

    let fullText = course.extractedText.trim();
    const maxTokensPerChunk = 1000;
    
    const fragments = splitTextByTokens(fullText, maxTokensPerChunk);
    const relevantChunks = await findRelevantChunks(topic, fragments);
    const text = relevantChunks.join("\n\n"); 
    

    const prompt = `
    A partir del contenido proporcionado, genera un resumen enfocado exclusivamente en el tema: '${topic}'.
    
    - Si el tema aparece en el contenido, elabora un resumen claro, conciso y preciso de aproximadamente ${maxWords} palabras (entre ${Math.floor(maxWords * 0.9)} y ${Math.floor(maxWords * 1.1)}). El resumen debe terminar en una frase completa.
    
  
    Contenido del curso:
    ${text}
    `;
    


    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxWords * 2,
      temperature: 0.3,
    });

    let summary = completion.choices[0]?.message?.content?.trim();
    if (!summary) {
      return res.status(500).json({ message: "OpenAI no pudo generar un resumen válido." });
    }

    const newSummary = new Summary({
      userId,
      courseId,
      topic,
      summary,
    });

    await newSummary.save();

    console.log("📌 Resumen guardado en la colección summaries:", newSummary);

    res.json({ summary });

  } catch (error) {
    console.error("❌ Error en OpenAI:", error.response?.data || error.message);
    res.status(500).json({ message: "Error interno al generar el resumen." });
  }
};


export const gradeExam = async (req, res) => {
  const { responses, exam, courseId, examType } = req.body;
  const userId = req.user.id;

  if (!exam || !Array.isArray(exam) || !responses || !courseId || !examType) {
    return res.status(400).json({ message: "Faltan datos en la solicitud." });
  }

  try {
    let totalScore = 0;
    const gradingResults = [];

    for (let i = 0; i < exam.length; i++) {
      const question = exam[i];
      const userAnswer = responses[i]?.trim() || "";
      let score = 0;
      let feedback = "";

      if (userAnswer === "") {
        score = 0;
        feedback = "⚠️ Respuesta en blanco. Se otorgan 0 puntos.";
      } else if (examType === "test") {
        const correctOption = question.answer;
        score = userAnswer.toLowerCase() === correctOption.toLowerCase() ? 100 : 0;
        feedback = score === 100 ? "✅ Correcto." : `❌ Incorrecto. La respuesta correcta es: "${correctOption}"`;
      } else {
        const aiFeedback = await getAIGradingFeedback(userAnswer, question.question, question.answer);
        score = aiFeedback.score;
        feedback = aiFeedback.comment;
      }

      totalScore += score;
      gradingResults.push({ question: question.question, userAnswer, correctAnswer: question.answer, score, feedback });
    }

    const averageScore = (totalScore / exam.length).toFixed(2);

    const newScore = new Score({
      userId,
      topic: courseId,
      score: averageScore,
      examType,
      questions: exam.map(q => ({
        question: q.question,
        options: q.options || [],
        correctAnswer: q.answer
      })),
      responses: responses,
      gradingResults: gradingResults,
      createdAt: new Date(),
    });

    await newScore.save();

    res.status(200).json({ totalScore: averageScore, results: gradingResults });
  } catch (error) {
    console.error("❌ Error interno en /exam/grade:", error);
    res.status(500).json({ message: "Error al corregir el examen." });
  }
};


const getAIGradingFeedback = async (userAnswer, question, correctAnswer) => {
  try {
    console.log("📡 Enviando a OpenAI...");
    console.log("❓ Pregunta:", question);
    console.log("📝 Respuesta del usuario:", userAnswer);
    console.log("✅ Respuesta correcta esperada:", correctAnswer);

    const prompt = `
      Evalúa la siguiente respuesta en base a la pregunta y la respuesta correcta proporcionada.
      Proporciona una calificación en una escala de 0 a 100 y un comentario explicativo.
      
      Pregunta: ${question}
      Tu respuesta ${userAnswer}
      Respuesta correcta esperada: ${correctAnswer}

      Devuelve SOLO un JSON válido con este formato:
      {
        "score": 0-100,
        "comment": "Explicación detallada de la calificación"
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.1,
    });

    console.log("📩 Respuesta de OpenAI:", completion.choices[0].message.content);

    const jsonMatch = completion.choices[0].message.content.match(/\{.*\}/s);
    if (!jsonMatch) throw new Error("No se encontró JSON válido en la respuesta de OpenAI.");

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("❌ Error en getAIGradingFeedback:", error);
    return { score: 50, comment: "Evaluación manual requerida." }; 
  }
};
















