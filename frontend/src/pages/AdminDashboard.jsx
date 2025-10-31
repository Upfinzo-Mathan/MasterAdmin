import { useEffect, useState } from 'react';
import api from '../api/axios.js';

export default function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', role: 'user' });
  const [error, setError] = useState('');

  async function load() {
    try {
      const { data } = await api.get('/admin/users');
      setItems(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load');
    }
  }

  useEffect(() => { load(); }, []);

  async function onCreate(e) {
    e.preventDefault();
    try {
      await api.post('/admin/users', form);
      setForm({ name: '', email: '', role: 'user' });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Create failed');
    }
  }

  async function onDelete(id) {
    try {
      await api.delete(`/admin/users/${id}`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Delete failed');
    }
  }

  function logout() {
    localStorage.clear();
    window.location.href = '/admin/login';
  }

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <button onClick={logout}>Logout</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h3>Create User</h3>
      <form onSubmit={onCreate} style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
        <input placeholder="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="user">user</option>
          <option value="manager">manager</option>
          <option value="admin">admin</option>
        </select>
        <button type="submit">Create</button>
      </form>

      <h3>Users</h3>
      <ul>
        {items.map((u) => (
          <li key={u._id}>
            {u.name} - {u.email} ({u.role})
            <button style={{ marginLeft: 8 }} onClick={() => onDelete(u._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

