import { useEffect, useState } from 'react';
import api from '../api/axios.js';

export default function SuperAdminDashboard() {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const [error, setError] = useState('');

  async function loadAdmins() {
    try {
      const { data } = await api.get('/superadmin/admins');
      setAdmins(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load admins');
    }
  }

  useEffect(() => { loadAdmins(); }, []);

  async function onCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/superadmin/create-admin', form);
      setForm({ username: '', password: '', email: '' });
      await loadAdmins();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create admin');
    }
  }

  async function onDelete(id) {
    try {
      await api.delete(`/superadmin/admins/${id}`);
      await loadAdmins();
    } catch (err) {
      setError(err?.response?.data?.message || 'Delete failed');
    }
  }

  function logout() {
    localStorage.clear();
    window.location.href = '/superadmin/login';
  }

  return (
    <div>
      <h2>SuperAdmin Dashboard</h2>
      <button onClick={logout}>Logout</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h3>Create Admin</h3>
      <form onSubmit={onCreate} style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
        <input placeholder="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input placeholder="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <input placeholder="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <button type="submit">Create</button>
      </form>

      <h3>Admins</h3>
      <ul>
        {admins.map((a) => (
          <li key={a._id}>
            <strong>{a.username}</strong> - {a.dbName} {a.email ? `(${a.email})` : ''}
            <button style={{ marginLeft: 8 }} onClick={() => onDelete(a._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

