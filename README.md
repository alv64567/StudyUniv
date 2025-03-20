# 📚 StudyUniv - Plataforma Educativa con IA

StudyUniv es una plataforma educativa que aprovecha la inteligencia artificial (IA) para generar exámenes, resúmenes y responder preguntas de manera automatizada. Construido con el stack MERN (MongoDB, Express, React y Node.js), 
permite una experiencia de aprendizaje personalizada.


## ⚡⚡ Requisitos Previos
Antes de instalar el proyecto, asegúrate de tener instalado:

📌 **Node.js**
📌  **MongoDB** (Si deseas correr la base de datos localmente)
📌  **Git**     (Para clonar el repositorio)
📌  **Vite**    (Para correr el frontend)

## 🚀 Pasos de Instalación
### 1️⃣ Clonar el Repositorio

```
git clone enlace_repositorio
```
### 2️⃣ Instalar dependencias y entrar en la carpeta del frontend

```
cd .\frontend\
npm install
```

### 3️⃣ Crear un archivo .env
Crea un archivo .env en la raíz del proyecto con las siguientes variables:

```
MONGO_URI=
JWT_SECRET=clave_secreta
OPENAI_API_KEY=
```
## 📝 Ejecutar el Proyecto Completo
### 📌 Terminal 1 (Ejecutar el backend)
```
cd .\backend
npm run dev
```
### 📌 Terminal 2 (Ejecutar el frontend)
```
cd .\frontend\
npm run dev
```
👉 Esto levantará el frontend en http://localhost:5173/


