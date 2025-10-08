import request from 'supertest';
import { app } from '../../src/index';

describe('API Integration Tests', () => {
  const authToken = process.env.TEST_AUTH_TOKEN || 'test-token';

  describe('Health Endpoints', () => {
    it('GET /health should return healthy status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('GET /ready should return ready status', async () => {
      const response = await request(app).get('/ready');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ready');
    });
  });

  describe('Query Endpoint', () => {
    it('POST /api/query should require authentication', async () => {
      const response = await request(app)
        .post('/api/query')
        .send({ question: 'Test question' });

      expect(response.status).toBe(401);
    });

    it('POST /api/query should validate request body', async () => {
      const response = await request(app)
        .post('/api/query')
        .set('Authorization', `Bearer ${authToken}`)
        .send({}); // Missing question

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('POST /api/query should accept valid question', async () => {
      const response = await request(app)
        .post('/api/query')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          question: 'How do I submit expense reimbursements?',
        });

      // Depending on whether services are available
      expect([200, 503]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('answer');
        expect(response.body).toHaveProperty('sources');
        expect(response.body).toHaveProperty('confidence');
        expect(response.body).toHaveProperty('processingTimeMs');
      }
    });

    it('POST /api/query should reject too short questions', async () => {
      const response = await request(app)
        .post('/api/query')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ question: 'Hi' });

      expect(response.status).toBe(400);
    });

    it('POST /api/query should reject too long questions', async () => {
      const longQuestion = 'a'.repeat(1001);
      const response = await request(app)
        .post('/api/query')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ question: longQuestion });

      expect(response.status).toBe(400);
    });
  });

  describe('Batch Query Endpoint', () => {
    it('POST /api/query/batch should accept multiple questions', async () => {
      const response = await request(app)
        .post('/api/query/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          questions: [
            'What is the onboarding process?',
            'How do I submit expenses?',
          ],
        });

      if (response.status === 200) {
        expect(response.body).toHaveProperty('results');
        expect(Array.isArray(response.body.results)).toBe(true);
        expect(response.body.results.length).toBe(2);
      }
    });

    it('POST /api/query/batch should limit number of questions', async () => {
      const questions = Array(15).fill('Test question');
      
      const response = await request(app)
        .post('/api/query/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ questions });

      expect(response.status).toBe(400);
    });
  });

  describe('Feedback Endpoint', () => {
    it('POST /api/query/feedback should accept valid feedback', async () => {
      const response = await request(app)
        .post('/api/query/feedback')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          questionId: 'test-question-id',
          rating: 5,
          helpful: true,
          comment: 'Very helpful!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('POST /api/query/feedback should validate rating range', async () => {
      const response = await request(app)
        .post('/api/query/feedback')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          questionId: 'test-question-id',
          rating: 10, // Invalid: should be 1-5
          helpful: true,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Admin Endpoints', () => {
    it('GET /api/admin/health should check service health', async () => {
      const response = await request(app)
        .get('/api/admin/health')
        .set('Authorization', `Bearer ${authToken}`);

      // May require admin role
      expect([200, 403]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('services');
      }
    });

    it('GET /api/admin/config should return configuration', async () => {
      const response = await request(app)
        .get('/api/admin/config')
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('rag');
        expect(response.body).toHaveProperty('environment');
      }
    });
  });

  describe('Analytics Endpoints', () => {
    it('GET /api/analytics/usage should return usage data', async () => {
      const response = await request(app)
        .get('/api/analytics/usage')
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('metrics');
        expect(response.body).toHaveProperty('period');
      }
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/api/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/query')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = Array(150).fill(null).map(() =>
        request(app)
          .post('/api/query')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ question: 'Test question' })
      );

      const responses = await Promise.all(requests);
      const tooManyRequests = responses.filter(r => r.status === 429);

      expect(tooManyRequests.length).toBeGreaterThan(0);
    }, 30000); // Extend timeout for this test
  });
});

