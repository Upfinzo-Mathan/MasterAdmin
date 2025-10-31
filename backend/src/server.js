import app from './app.js';
import { config } from './config/env.js';

const port = Number(config.port) || 4000;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on :${port}`);
});

