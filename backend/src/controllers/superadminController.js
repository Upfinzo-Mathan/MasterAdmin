import { getAdminModel } from '../models/Admin.js';
import { signToken } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { getTenantConnection } from '../config/tenantManager.js';

export async function superadminLogin(req, res) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Missing credentials' });

  // For simplicity, bootstrap a fixed superadmin user via env or seed. Here we accept env SUPERADMIN_USER/PASS if present, else deny.
  const envUser = process.env.SUPERADMIN_USER;
  const envPass = process.env.SUPERADMIN_PASS;
  if (!envUser || !envPass) return res.status(500).json({ message: 'SuperAdmin not configured' });

  if (username !== envUser || password !== envPass) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken({ role: 'superadmin', username });
  return res.json({ token });
}

export async function createAdmin(req, res) {
  const { username, password, email } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Missing fields' });
  const Admin = await getAdminModel();

  const existing = await Admin.findOne({ username });
  if (existing) return res.status(409).json({ message: 'Username already exists' });

  const dbName = `tenant_${username.toLowerCase()}`;
  const passwordHash = await hashPassword(password);
  const admin = await Admin.create({ username, passwordHash, dbName, email });

  // Lazily create DB by establishing a connection and touching a collection (optional)
  const conn = await getTenantConnection(dbName);
  await conn.db.listCollections().toArray();

  return res.status(201).json({ id: admin._id, username: admin.username, dbName: admin.dbName, email: admin.email });
}

export async function listAdmins(_req, res) {
  const Admin = await getAdminModel();
  const admins = await Admin.find().select('-passwordHash');
  return res.json(admins);
}

export async function deleteAdmin(req, res) {
  const Admin = await getAdminModel();
  const { id } = req.params;
  const admin = await Admin.findByIdAndDelete(id);
  if (!admin) return res.status(404).json({ message: 'Not found' });
  return res.json({ success: true });
}

export async function adminLogin(req, res) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Missing credentials' });
  const Admin = await getAdminModel();
  const admin = await Admin.findOne({ username, isActive: true });
  if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await verifyPassword(password, admin.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signToken({ role: 'admin', username: admin.username, dbName: admin.dbName, adminId: String(admin._id) });
  return res.json({ token, dbName: admin.dbName });
}

