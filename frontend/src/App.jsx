import { Routes, Route, Navigate, Link } from 'react-router-dom';
import SuperAdminLogin from './pages/SuperAdminLogin.jsx';
import SuperAdminDashboard from './pages/SuperAdminDashboard.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

function Guard({ children, role }) {
  const token = localStorage.getItem('token');
  const roleStored = localStorage.getItem('role');
  if (!token || roleStored !== role) return <Navigate to={role === 'superadmin' ? '/superadmin/login' : '/admin/login'} />;
  return children;
}

export default function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <Link to="/superadmin/login">SuperAdmin Login</Link>
        <Link to="/superadmin">SuperAdmin Dashboard</Link>
        <Link to="/admin/login">Admin Login</Link>
        <Link to="/admin">Admin Dashboard</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/superadmin/login" />} />
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />
        <Route
          path="/superadmin"
          element={
            <Guard role="superadmin">
              <SuperAdminDashboard />
            </Guard>
          }
        />
        <Route path="/admin/login" element={<AdminLogin />} />
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

