import mongoose from 'mongoose';
import { config } from './env.js';

const tenantConnections = new Map();

export async function getTenantConnection(dbName) {
  if (!dbName) throw new Error('Tenant dbName is required');
  const existing = tenantConnections.get(dbName);
  if (existing && existing.readyState === 1) return existing;

  if (!config.mongoUri) {
    throw new Error('MONGO_URI is not configured');
  }

  const conn = await mongoose.createConnection(config.mongoUri, { dbName }).asPromise();
  tenantConnections.set(dbName, conn);
  return conn;
}

export function getTenantModel(connection, name, schemaFactory) {
  if (connection.models[name]) return connection.models[name];
  const schema = schemaFactory();
  return connection.model(name, schema);
}

