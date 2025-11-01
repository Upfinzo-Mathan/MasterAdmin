import { Schema } from 'mongoose';
import { getMasterConnection } from '../config/masterDb.js';

const AdminSchema = new Schema(
  {
    username: { type: String, unique: true, required: true, index: true },
    passwordHash: { type: String, required: true },
    dbName: { type: String, required: true, unique: true },
    email: { type: String },
    isActive: { type: Boolean, default: true },
    company: {
      name: { type: String },
      logo: { type: String },
      details: { type: String }
    },
    selectedFields: [{ type: String }]
  },
  { timestamps: true }
);

let AdminModel;

export async function getAdminModel() {
  if (AdminModel) return AdminModel;
  const conn = await getMasterConnection();
  AdminModel = conn.model('Admin', AdminSchema);
  return AdminModel;
}

