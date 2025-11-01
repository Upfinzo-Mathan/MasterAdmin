import app from './app.js';
import { config } from './config/env.js';

// Validate required environment variables on startup
const requiredEnvVars = {
  'MONGO_URI': config.mongoUri,
  'JWT_SECRET': config.jwtSecret,
  'SUPERADMIN_USER': config.superadminUser,
  'SUPERADMIN_PASS': config.superadminPass
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value || value === '')
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n💡 Create backend/.env file with the following variables:');
  console.error('   PORT=4000');
  console.error('   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/');
  console.error('   JWT_SECRET=your-very-long-random-secret-key-here');
  console.error('   CORS_ORIGIN=http://localhost:5173');
  console.error('   SUPERADMIN_USER=admin');
  console.error('   SUPERADMIN_PASS=your-secure-password');
  console.error('\n⚠️  Server will start but SuperAdmin login will fail until configured.\n');
} else {
  console.log('✅ All required environment variables are configured');
}

const port = Number(config.port) || 4000;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 API server listening on :${port}`);
});
