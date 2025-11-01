import { getAdminModel } from '../models/Admin.js';
import { signToken } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { getTenantConnection } from '../config/tenantManager.js';
import { getTenantModels } from '../models/TenantModels.js';

export async function superadminLogin(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Missing credentials' });
  }

  // For simplicity, bootstrap a fixed superadmin user via env or seed. Here we accept env SUPERADMIN_USER/PASS if present, else deny.
  const envUser = process.env.SUPERADMIN_USER;
  const envPass = process.env.SUPERADMIN_PASS;
  
  if (!envUser || !envPass) {
    console.error('SuperAdmin login attempt failed: Missing SUPERADMIN_USER or SUPERADMIN_PASS in environment variables');
    return res.status(500).json({ 
      message: 'SuperAdmin not configured',
      error: 'SUPERADMIN_USER and SUPERADMIN_PASS must be set in backend/.env file',
      hint: 'Create backend/.env file with SUPERADMIN_USER and SUPERADMIN_PASS variables'
    });
  }

  if (username !== envUser || password !== envPass) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken({ role: 'superadmin', username });
  return res.json({ token });
}

export async function createAdmin(req, res) {
  const { username, password, email, company, selectedFields } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Missing fields' });
  const Admin = await getAdminModel();

  const existing = await Admin.findOne({ username });
  if (existing) return res.status(409).json({ message: 'Username already exists' });

  const dbName = `tenant_${username.toLowerCase()}`;
  const passwordHash = await hashPassword(password);
  
  const adminData = {
    username,
    passwordHash,
    dbName,
    email: email || undefined,
    company: company || undefined,
    selectedFields: selectedFields || []
  };

  const admin = await Admin.create(adminData);

  // Log the complete admin creation data
  console.log('Admin Creation Data:', {
    company: admin.company,
    selectedFields: admin.selectedFields,
    credentials: {
      username: admin.username,
      email: admin.email,
      dbName: admin.dbName
    }
  });

  // Lazily create DB by establishing a connection and touching a collection (optional)
  const conn = await getTenantConnection(dbName);
  await conn.db.listCollections().toArray();

  return res.status(201).json({ 
    id: admin._id, 
    username: admin.username, 
    dbName: admin.dbName, 
    email: admin.email,
    company: admin.company,
    selectedFields: admin.selectedFields
  });
}

export async function listAdmins(_req, res) {
  const Admin = await getAdminModel();
  const admins = await Admin.find().select('-passwordHash');
  return res.json(admins);
}

export async function getAdmin(req, res) {
  const Admin = await getAdminModel();
  const { id } = req.params;
  const admin = await Admin.findById(id).select('-passwordHash');
  if (!admin) return res.status(404).json({ message: 'Not found' });
  return res.json(admin);
}

export async function updateAdmin(req, res) {
  const Admin = await getAdminModel();
  const { id } = req.params;
  const { isActive, email, company, selectedFields } = req.body;
  
  const updateData = {};
  if (typeof isActive === 'boolean') updateData.isActive = isActive;
  if (email !== undefined) updateData.email = email;
  if (company !== undefined) updateData.company = company;
  if (selectedFields !== undefined) updateData.selectedFields = selectedFields;
  
  const admin = await Admin.findByIdAndUpdate(id, updateData, { new: true }).select('-passwordHash');
  if (!admin) return res.status(404).json({ message: 'Not found' });
  return res.json(admin);
}

export async function toggleAdminStatus(req, res) {
  const Admin = await getAdminModel();
  const { id } = req.params;
  const admin = await Admin.findById(id);
  if (!admin) return res.status(404).json({ message: 'Not found' });
  
  admin.isActive = !admin.isActive;
  await admin.save();
  
  return res.json({ 
    id: admin._id, 
    isActive: admin.isActive,
    message: `Admin ${admin.isActive ? 'activated' : 'deactivated'} successfully`
  });
}

export async function deleteAdmin(req, res) {
  const Admin = await getAdminModel();
  const { id } = req.params;
  const admin = await Admin.findByIdAndDelete(id);
  if (!admin) return res.status(404).json({ message: 'Not found' });
  return res.json({ success: true });
}

export async function getAdminUsers(req, res) {
  const { id } = req.params;
  const Admin = await getAdminModel();
  const admin = await Admin.findById(id);
  
  if (!admin) {
    return res.status(404).json({ message: 'Admin not found' });
  }

  try {
    const { Lead } = await getTenantModels(admin.dbName, admin.selectedFields || []);
    
    // Fetch leads/users from this admin's database
    const leads = await Lead.find().sort({ createdAt: -1 });
    return res.json(leads);
  } catch (err) {
    // If Lead model doesn't exist yet or database doesn't exist, return empty array
    console.error('Error fetching admin users:', err);
    return res.json([]);
  }
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
  return res.json({ 
    token, 
    dbName: admin.dbName,
    selectedFields: admin.selectedFields || [],
    company: admin.company || {}
  });
}

