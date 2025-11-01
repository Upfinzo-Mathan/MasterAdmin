import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import SuperAdminDashboard from './pages/SuperAdminDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

function Guard({ children, role }) {
  const token = localStorage.getItem('token');
  const roleStored = localStorage.getItem('role');
  if (!token || roleStored !== role) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem('token');
  const roleStored = localStorage.getItem('role');
  
  if (token && roleStored === 'superadmin') {
    return <Navigate to="/superadmin" replace />;
  }
  if (token && roleStored === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        
        <Route
          path="/superadmin"
          element={
            <Guard role="superadmin">
              <SuperAdminDashboard />
            </Guard>
          }
        />
        
        <Route
          path="/admin"
          element={
            <Guard role="admin">
              <AdminDashboard />
            </Guard>
          }
        />
      </Routes>
    </div>
  );
}
