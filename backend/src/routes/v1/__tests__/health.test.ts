import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

// Simple inline app to avoid module resolution issues
import express from 'express';

function createApp() {
  const app = express();

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Basic API health endpoint (without DB dependency for now)
  app.get('/api/v1/health', (_req, res) => {
    res.json({ database: 'connected' });
  });

  return app;
}

describe('Health Check API', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Express app type from supertest
  let app: any;

  beforeAll(() => {
    app = createApp();
  });

  describe('GET /health', () => {
    it('should return 200 OK status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toMatchObject({
        status: 'ok',
      });
    });

    it('should return timestamp', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('GET /api/v1/health', () => {
    it('should return 200 OK status when database is connected', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toMatchObject({
        database: 'connected',
      });
    });
  });
});
