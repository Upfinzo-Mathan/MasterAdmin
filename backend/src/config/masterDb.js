import mongoose from 'mongoose';
import { config } from './env.js';

let masterConnection; // singleton connection for superadmin_db

export async function getMasterConnection() {
  if (masterConnection && masterConnection.readyState === 1) return masterConnection;

  if (!config.mongoUri) {
    throw new Error('MONGO_URI is not configured');
  }

  masterConnection = await mongoose.createConnection(config.mongoUri, {
    dbName: config.masterDbName
  }).asPromise();

  return masterConnection;
}

