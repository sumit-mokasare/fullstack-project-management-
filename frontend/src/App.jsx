import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';

import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import VerifyEmail from '@/pages/auth/VerifyEmail';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';

import Dashboard from '@/pages/Dashboard';
import ProjectList from '@/pages/projects/ProjectList';
import CreateProject from '@/pages/projects/CreateProject';
import EditProject from '@/pages/projects/EditProject';
import ProjectDetail from '@/pages/projects/ProjectDetail';
import ProjectMembers from '@/pages/projects/ProjectMembers';

import CreateTask from '@/pages/tasks/CreateTask';
import TaskDetail from '@/pages/tasks/TaskDetail';

import NotesPage from '@/pages/notes/NotesPage';
import Profile from '@/pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/create" element={<CreateProject />} />
            <Route path="/projects/:projectId" element={<ProjectDetail />} />
            <Route path="/projects/:projectId/edit" element={<EditProject />} />
            <Route path="/projects/:projectId/members" element={<ProjectMembers />} />
            <Route path="/projects/:projectId/tasks/create" element={<CreateTask />} />
            <Route path="/projects/:projectId/tasks/:taskId" element={<TaskDetail />} />
            <Route path="/projects/:projectId/notes" element={<NotesPage />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
