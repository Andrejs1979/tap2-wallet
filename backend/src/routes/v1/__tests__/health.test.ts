import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { type Express } from 'express';

// Mock Prisma client BEFORE importing health router
const queryRawMock = vi.fn();
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Vitest mock
vi.mock('../../config/database.js', () => ({
  prisma: {
    $queryRaw: queryRawMock,
  },
}));

// Import after mock is defined
import { prisma } from '../../config/database.js';
import { healthRouter } from '../health.js';

/**
 * Creates a test app with the health router mounted
 * This tests the actual production code instead of duplicating it
 */
function createTestApp(): Express {
  const app = express();
  app.use(express.json());
  // Mount the actual health router
  app.use('/api/v1/health', healthRouter);
  return app;
}

describe('Health Check API', () => {
  let app: Express;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/health', () => {
    it('should return 200 OK status when database is connected', async () => {
      // Mock successful database query
      queryRawMock.mockResolvedValue([{ '?column?': 1 }]);

      const response = await request(app)
        .get('/api/v1/health')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toMatchObject({
        status: 'ok',
        database: 'connected',
      });
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
      expect(queryRawMock).toHaveBeenCalledTimes(1);
    });

    it('should return 503 Service Unavailable when database is disconnected', async () => {
      // Mock database connection failure
      queryRawMock.mockRejectedValue(new Error('Connection refused'));

      const response = await request(app)
        .get('/api/v1/health')
        .expect(503)
        .expect('Content-Type', /json/);

      expect(response.body).toMatchObject({
        status: 'error',
        database: 'disconnected',
      });
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('error');
      expect(queryRawMock).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors gracefully', async () => {
      // Mock database query error
      const dbError = new Error('Database timeout');
      queryRawMock.mockRejectedValue(dbError);

      const response = await request(app)
        .get('/api/v1/health')
        .expect(503);

      expect(response.body.error).toBe('Database timeout');
    });
  });
});
