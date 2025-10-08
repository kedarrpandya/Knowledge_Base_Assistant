import { Router } from 'express';
import { queryRoutes } from './query';
import { adminRoutes } from './admin';
import { analyticsRoutes } from './analytics';

const router = Router();

// API version
router.get('/', (req, res) => {
  res.json({
    name: 'Enterprise Knowledge Assistant API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      query: '/api/query',
      admin: '/api/admin',
      analytics: '/api/analytics',
    },
  });
});

// Mount route modules
router.use('/query', queryRoutes);
router.use('/admin', adminRoutes);
router.use('/analytics', analyticsRoutes);

export { router as routes };

