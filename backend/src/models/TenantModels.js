import { Schema } from 'mongoose';
import { getTenantConnection, getTenantModel } from '../config/tenantManager.js';

// Factory for a simple demo collection per tenant
function createUserSchema() {
  return new Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      role: { type: String, enum: ['user', 'manager', 'admin'], default: 'user' }
    },
    { timestamps: true }
  );
}

export async function getTenantModels(dbName) {
  const connection = await getTenantConnection(dbName);
  const User = getTenantModel(connection, 'User', createUserSchema);
  return { connection, User };
}

