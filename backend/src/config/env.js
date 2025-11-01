import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve .env file path: go up from src/config to backend root
const envPath = path.resolve(__dirname, '../../.env');

// Load .env file with explicit path
const result = dotenv.config({ path: envPath });

// Log warning if .env file not found (but don't crash - might be using system env vars)
if (result.error) {
  console.warn(`⚠️  Warning: Could not load .env file from ${envPath}`);
  console.warn('   Make sure backend/.env file exists with required variables');
}

export const config = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  masterDbName: 'superadmin_db',
  superadminUser: process.env.SUPERADMIN_USER || '',
  superadminPass: process.env.SUPERADMIN_PASS || ''
};

