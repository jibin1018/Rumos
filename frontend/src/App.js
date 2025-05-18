// frontend/src/App.js
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './i18n';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import MainLayout from './components/layouts/MainLayout';

// Pages
import Home from './pages/Home';
import PropertyList from './pages/PropertyList';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterAgent from './pages/RegisterAgent';
import UserProfile from './pages/UserProfile';
import AgentProfile from './pages/AgentProfile';
import Favorites from './pages/Favorites';
import Board from './pages/Board';
import BoardDetail from './pages/BoardDetail';
import CreatePost from './pages/CreatePost';
import PropertyUpload from './pages/PropertyUpload';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

// Routes
import PrivateRoute from './components/routes/PrivateRoute';
import AgentRoute from './components/routes/AgentRoute';
import AdminRoute from './components/routes/AdminRoute';

// Loading component
const Loading = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <AuthProvider>
        <Router>
          <MainLayout>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/properties" element={<PropertyList />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register/agent" element={<RegisterAgent />} />
              <Route path="/board" element={<Board />} />
              <Route path="/board/:id" element={<BoardDetail />} />

              {/* Protected routes - User */}
              <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
              <Route path="/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
              <Route path="/board/post/create" element={<PrivateRoute><CreatePost /></PrivateRoute>} />

              {/* Protected routes - Agent */}
              <Route path="/agent/profile" element={<AgentRoute><AgentProfile /></AgentRoute>} />
              <Route path="/agent/properties" element={<AgentRoute><PropertyList userProperties /></AgentRoute>} />
              <Route path="/agent/properties/upload" element={<AgentRoute><PropertyUpload /></AgentRoute>} />
              <Route path="/agent/properties/edit/:id" element={<AgentRoute><PropertyUpload /></AgentRoute>} />

              {/* Protected routes - Admin */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminDashboard tab="users" /></AdminRoute>} />
              <Route path="/admin/agents" element={<AdminRoute><AdminDashboard tab="agents" /></AdminRoute>} />
              <Route path="/admin/properties" element={<AdminRoute><AdminDashboard tab="properties" /></AdminRoute>} />
              <Route path="/admin/board" element={<AdminRoute><AdminDashboard tab="board" /></AdminRoute>} />

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </Router>
        <ToastContainer position="bottom-right" />
      </AuthProvider>
    </Suspense>
  );
}

export default App;
