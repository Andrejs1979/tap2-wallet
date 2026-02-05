import 'dotenv/config';
import { createApp } from './app.js';

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = createApp();

app.listen(PORT, () => {
  console.log(`🚀 Tap2 Wallet API server running in ${NODE_ENV} mode`);
  console.log(`📡 Listening on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 API v1: http://localhost:${PORT}/api/v1`);
});
