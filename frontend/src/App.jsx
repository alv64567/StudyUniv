import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from '../pages/Home';
import Login from '../pages/login';
import Register from '../pages/Register';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Courses from '../pages/course';
import CourseDetails from '../pages/CourseDetails';
import EditCourse from '../pages/EditCourse';
import ChatAI from './components/ChatAI/chatAI';
import ExamGenerator from './components/ExamGenerator/ExamGenerator';
import SummaryGenerator from './components/SummaryGenerator/SummaryGenerator';
import Grades from "./components/Grades";  
import Statistics from '../pages/Statistics'; 
import Settings from '../pages/Settings'; 
import SavedExamCatalog from '../pages/SavedExamCatalog';


const App = () => {
  return (
    <Router>
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="container-fluid p-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:id"
            element={
              <ProtectedRoute>
                <CourseDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/edit/:id"
            element={
              <ProtectedRoute>
                <EditCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat-ai"
            element={
              <ProtectedRoute>
                <ChatAI />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exam-generator"
            element={
              <ProtectedRoute>
                <ExamGenerator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/summary-generator"
            element={
              <ProtectedRoute>
                <SummaryGenerator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grades"
            element={
              <ProtectedRoute>
                <Grades />
              </ProtectedRoute>
            }
          />
          <Route path="/statistics" element={<Statistics />} />
          <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

<Route
  path="/exam-catalog"
  element={
    <ProtectedRoute>
      <SavedExamCatalog />
    </ProtectedRoute>
  }
/>

          </Routes>
          
          
      </div>
      <Footer />
      </div>
    </Router>
  );
};

export default App;
