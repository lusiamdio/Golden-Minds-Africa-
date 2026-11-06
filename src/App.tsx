import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Assignments from './pages/Assignments';
import Attendance from './pages/Attendance';
import LearningHub from './pages/LearningHub';
import Forum from './pages/Forum';
import Debates from './pages/Debates';
import Ecosystem from './pages/Ecosystem';
import AINotes from './pages/AINotes';
import Admin from './pages/Admin';
import VirtualRooms from './pages/VirtualRooms';
import LectureRoom from './pages/LectureRoom';
import Onboarding from './pages/Onboarding';
import Network from './pages/Network';
import Projects from './pages/Projects';
import Simulations from './pages/Simulations';
import Achievements from './pages/Achievements';
import CollaborationRooms from './pages/CollaborationRooms';
import Certifications from './pages/Certifications';
import KnowledgeVault from './pages/KnowledgeVault';
import Opportunities from './pages/Opportunities';
import Portfolio from './pages/Portfolio';
import Mentors from './pages/Mentors';
import Verify from './pages/Verify';
import Showcase from './pages/Showcase';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Contributions from './pages/Contributions';
import ProtectedRoute from './components/ProtectedRoute';
import { AdminStateProvider } from './contexts/AdminStateContext';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import PerformanceMonitor from './components/PerformanceMonitor';

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <AdminStateProvider>
              <Toaster position="top-right" richColors />
              <PerformanceMonitor />
              <BrowserRouter>
              <Routes>
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/verify/:id" element={<Verify />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                } />
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="contributions" element={<Contributions />} />
                
                {/* 1. AI Mentor Matching */}
                <Route path="mentorship/*" element={<Mentors />} />
                
                {/* 2. Projects & Portfolio */}
                <Route path="projects/*" element={<Projects />} />
                
                {/* 3. Digital Legacy (Portfolio Engine) */}
                <Route path="portfolio/*" element={<Portfolio />} />
                
                {/* 4. Smart Calendar */}
                <Route path="calendar/*" element={<Schedule />} />
                
                {/* 5. Fellowship Achievements */}
                <Route path="achievements/*" element={<Achievements />} />
                
                {/* 6. Rooms (Chat + Collaboration) */}
                <Route path="rooms/*" element={<VirtualRooms />} />
                <Route path="rooms/:roomId" element={<LectureRoom />} />
                
                {/* 7. Smart Certifications */}
                <Route path="certifications/*" element={<Certifications />} />
                
                {/* 8. Knowledge Vault */}
                <Route path="knowledge/*" element={<KnowledgeVault />} />
                
                {/* 9. Opportunity Marketplace */}
                <Route path="opportunities/*" element={<Opportunities />} />
                
                {/* 10. Digital Portfolio Showcase */}
                <Route path="showcase/*" element={<Showcase />} />
                
                {/* 11. Content & Engagement Ecosystem */}
                <Route path="ecosystem/*" element={<Ecosystem />} />

                {/* User Settings & Profile */}
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />

                {/* Legacy / Other Routes */}
                <Route path="assignments" element={<Assignments />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="learning-hub/*" element={<LearningHub />} />
                <Route path="forum" element={<Forum />} />
                <Route path="notes" element={<AINotes />} />
                <Route path="pan-african-network/*" element={<Network />} />
                <Route path="simulations" element={<Simulations />} />
                <Route path="collaboration" element={<CollaborationRooms />} />

                {/* Redirects for old routes */}
                <Route path="smart-calendar/*" element={<Navigate to="/calendar" replace />} />
                <Route path="debates/*" element={<Navigate to="/ecosystem" replace />} />
                <Route path="publications/*" element={<Navigate to="/ecosystem" replace />} />
                <Route path="vault/*" element={<Navigate to="/knowledge" replace />} />
                <Route path="portfolio-builder/*" element={<Navigate to="/portfolio" replace />} />
                <Route path="mentors/*" element={<Navigate to="/mentorship" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
          </AdminStateProvider>
        </AuthProvider>
      </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
