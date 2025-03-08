import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import QuickRelief from './pages/QuickRelief';
import BreathingTechnique from './pages/BreathingTechnique';
import GroundingTechnique from './pages/GroundingTechnique';
import PositiveAffirmations from './pages/PositiveAffirmations';
import ColdTherapy from './pages/ColdTherapy';
import ProtectedRoute from './components/ProtectedRoute';
import { initializeUsers } from './utils/auth';
import PanicJournal from './pages/PanicJournal';
import JournalEntry from './pages/JournalEntry';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize default admin if no users exist
    initializeUsers();
    
    // Load font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    // Set app name
    document.title = 'Pulih Alami';
    
    setIsLoading(false);
    
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-sky-50 text-slate-800 font-sans">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Admin routes - require admin role */}
            <Route path="/admin/*" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            {/* User routes - accessible to all authenticated users */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/quick-relief" element={
              <ProtectedRoute>
                <QuickRelief />
              </ProtectedRoute>
            } />
            
            <Route path="/breathing" element={
              <ProtectedRoute>
                <BreathingTechnique />
              </ProtectedRoute>
            } />
            
            <Route path="/grounding" element={
              <ProtectedRoute>
                <GroundingTechnique />
              </ProtectedRoute>
            } />
            
            <Route path="/affirmations" element={
              <ProtectedRoute>
                <PositiveAffirmations />
              </ProtectedRoute>
            } />
            
            <Route path="/cold-therapy" element={
              <ProtectedRoute>
                <ColdTherapy />
              </ProtectedRoute>
            } />
            
            <Route path="/journal" element={
              <ProtectedRoute>
                <PanicJournal />
              </ProtectedRoute>
            } />
            
            <Route path="/journal/new" element={
              <ProtectedRoute>
                <JournalEntry />
              </ProtectedRoute>
            } />
            
            <Route path="/journal/edit/:id" element={
              <ProtectedRoute>
                <JournalEntry />
              </ProtectedRoute>
            } />
            
            <Route path="/" element={<Navigate replace to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
