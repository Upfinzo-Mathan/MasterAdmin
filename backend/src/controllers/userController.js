import { getTenantModels } from '../models/TenantModels.js';

export async function createUser(req, res) {
  const { dbName } = req.auth;
  const { User } = await getTenantModels(dbName);
  const created = await User.create(req.body);
  return res.status(201).json(created);
}

export async function listUsers(req, res) {
  const { dbName } = req.auth;
  const { User } = await getTenantModels(dbName);
  const users = await User.find().sort({ createdAt: -1 });
  return res.json(users);
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
  const { dbName } = req.auth;
  const { id } = req.params;
  const { User } = await getTenantModels(dbName);
  const user = await User.findByIdAndDelete(id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  return res.json({ success: true });
}

