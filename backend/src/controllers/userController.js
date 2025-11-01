import { getTenantModels } from '../models/TenantModels.js';
import { getAdminModel } from '../models/Admin.js';

// Helper to get admin selectedFields
async function getAdminSelectedFields(adminId) {
  const Admin = await getAdminModel();
  const admin = await Admin.findById(adminId);
  return admin?.selectedFields || [];
}

export async function createUser(req, res) {
  const { dbName, adminId } = req.auth;
  const selectedFields = await getAdminSelectedFields(adminId);
  const { User } = await getTenantModels(dbName, selectedFields);
  const created = await User.create(req.body);
  return res.status(201).json(created);
}

export async function listUsers(req, res) {
  const { dbName, adminId } = req.auth;
  const selectedFields = await getAdminSelectedFields(adminId);
  const { User, Lead } = await getTenantModels(dbName, selectedFields);
  
  // Return leads instead of users (since we're using leads)
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    return res.json(leads);
  } catch (err) {
    // If Lead model doesn't exist yet, return empty array
    return res.json([]);
  }
}

// Create Lead endpoint
export async function createLead(req, res) {
  const { dbName, adminId } = req.auth;
  const selectedFields = await getAdminSelectedFields(adminId);
  const { Lead } = await getTenantModels(dbName, selectedFields);
  
  try {
    const leadData = {
      ...req.body,
      source: req.body.source || 'manual',
      time: req.body.time || new Date()
    };
    const created = await Lead.create(leadData);
    return res.status(201).json(created);
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Failed to create lead' });
  }
}

export async function getUser(req, res) {
  const { dbName } = req.auth;
  const { id } = req.params;
  const { User } = await getTenantModels(dbName);
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  return res.json(user);
}

export async function updateUser(req, res) {
  const { dbName } = req.auth;
  const { id } = req.params;
  const { User } = await getTenantModels(dbName);
  const user = await User.findByIdAndUpdate(id, req.body, { new: true });
  if (!user) return res.status(404).json({ message: 'Not found' });
  return res.json(user);
}

export async function deleteUser(req, res) {
  const { dbName, adminId } = req.auth;
  const { id } = req.params;
  const selectedFields = await getAdminSelectedFields(adminId);
  const { User, Lead } = await getTenantModels(dbName, selectedFields);
  
  // Try to delete from Lead first, then User
  try {
    const lead = await Lead.findByIdAndDelete(id);
    if (lead) return res.json({ success: true });
  } catch (err) {
    // Lead model might not exist, try User
  }
  
  const user = await User.findByIdAndDelete(id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  return res.json({ success: true });
}

export async function getLead(req, res) {
  const { dbName, adminId } = req.auth;
  const { id } = req.params;
  const selectedFields = await getAdminSelectedFields(adminId);
  const { Lead } = await getTenantModels(dbName, selectedFields);
  
  try {
    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ message: 'Not found' });
    return res.json(lead);
  } catch (err) {
    return res.status(404).json({ message: 'Not found' });
  }
}

