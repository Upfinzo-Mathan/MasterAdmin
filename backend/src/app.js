import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import superadminRoutes from './routes/superadmin.js';
import adminRoutes from './routes/admin.js';

const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/superadmin', superadminRoutes);
app.use('/api/admin', adminRoutes);

// Error handler
app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  console.log("Hello From APP JS ");
  
  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;

