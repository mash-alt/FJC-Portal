import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './styles/App.css'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import InstructorRegister from './pages/InstructorRegister'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'
import StudentsManagement from './pages/StudentsManagement'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/instructor-register" element={<InstructorRegister />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/students" element={<StudentsManagement />} />
        <Route path="/forgot-password" element={<ForgotPassword/>}></Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
