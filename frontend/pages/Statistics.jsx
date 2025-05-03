import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import "./Statistics.css"; 

const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/users/statistics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="loading">Cargando estadísticas...</div>;

  return (
    <div className="stats-container">
      <h2 className="stats-title">📊 Estadísticas Generales</h2>

      <div className="stats-overview">
        <div className="stat-card">📝 Exámenes realizados: <strong>{stats.totalExams}</strong></div>
        <div className="stat-card">📚 Resúmenes generados: <strong>{stats.totalSummaries}</strong></div>
        <div className="stat-card">❓ Dudas respondidas: <strong>{stats.totalQuestions}</strong></div>
      </div>

      <div className="chart-section">
        <h3>Promedio por Asignatura</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={stats.averageByCourse}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="course" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="average" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-section">
        <h3>Distribución de Tipos de Examen</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={Object.entries(stats.examTypesCount).map(([type, value]) => ({ name: type, value }))}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              fill="#82ca9d"
              label
            >
              {Object.entries(stats.examTypesCount).map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
             { }
            <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right" 
                wrapperStyle={{ right: 200 }}
            />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-section">


      <div className="chart-section">
  <h3>Calificaciones a lo largo del tiempo por Asignatura</h3>
  {Object.entries(stats.scoresOverTimeByCourse).map(([course, data]) => (
    <div key={course}>
      <h4>{course}</h4>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid stroke="#ccc" />
          <XAxis 
          dataKey="date"
          angle={-45}             
          textAnchor="end" 
          interval={0}   
          height={70}    
        />

          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line 
            type="linear"
            dataKey="score"
            stroke="#82ca9d"
            strokeWidth={2}
            strokeDasharray="5 5"  // linea discontinua
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  ))}
</div>

  <h3>Calificaciones a lo largo del tiempo</h3>
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={stats.scoresOverTime}>
      <CartesianGrid stroke="#ccc" />
      <XAxis 
      dataKey="date"
      angle={-45}             
      textAnchor="end"        
      interval={0}            
      height={70}             
    />

      <YAxis domain={[0, 100]} />
      <Tooltip />
      <Legend />
      <Line 
        type="linear"
        dataKey="score"
        stroke="#8884d8"
        strokeWidth={2}
        strokeDasharray="5 5"  
        dot={false}

      />
    </LineChart>
  </ResponsiveContainer>
</div>
    </div>
  );
};

export default Statistics;
