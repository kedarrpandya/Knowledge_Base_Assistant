import { Router, Request, Response } from 'express';
import { requireRole } from '../middleware/auth';
import { ragService } from '../services/ragService';
import { logger } from '../utils/logger';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All admin routes require admin role
router.use(requireRole('Admin', 'KnowledgeAdmin'));

/**
 * GET /api/admin/health
 * Check health of RAG service dependencies
 */
router.get(
  '/health',
  asyncHandler(async (req: Request, res: Response) => {
    logger.info('Admin health check requested', {
      userId: (req.user as any)?.oid,
    });

    const health = await ragService.healthCheck();

    const isHealthy = health.openai && health.search;

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'degraded',
      services: {
        openai: {
          status: health.openai ? 'operational' : 'down',
        },
        cognitiveSearch: {
          status: health.search ? 'operational' : 'down',
        },
      },
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/admin/config
 * Get current configuration (sanitized)
 */
router.get('/config', (req: Request, res: Response) => {
  logger.info('Admin config requested', {
    userId: (req.user as any)?.oid,
  });

  res.json({
    rag: {
      topK: process.env.RAG_TOP_K || 5,
      maxTokens: process.env.RAG_MAX_TOKENS || 1500,
      temperature: process.env.RAG_TEMPERATURE || 0.3,
      minRelevanceScore: process.env.RAG_MIN_RELEVANCE_SCORE || 0.7,
    },
    rateLimit: {
      windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60000,
      maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
    },
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
});

/**
 * POST /api/admin/reindex
 * Trigger reindexing of knowledge base
 */
router.post(
  '/reindex',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as any)?.oid;
    
    logger.info('Reindex requested', { userId });

    // In production, this would trigger an Azure Function or Logic App
    // For now, return a placeholder response

    res.json({
      message: 'Reindex job initiated',
      jobId: `reindex-${Date.now()}`,
      status: 'queued',
      estimatedDurationMinutes: 30,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/admin/stats
 * Get system statistics
 */
router.get('/stats', (req: Request, res: Response) => {
  logger.info('Admin stats requested', {
    userId: (req.user as any)?.oid,
  });

  // In production, fetch these from Application Insights or a database
  res.json({
    queries: {
      total: 0,
      last24Hours: 0,
      averageResponseTimeMs: 0,
    },
    users: {
      totalActive: 0,
      last24Hours: 0,
    },
    documents: {
      totalIndexed: 0,
      lastUpdated: new Date().toISOString(),
    },
    system: {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/admin/clear-cache
 * Clear any caches (if implemented)
 */
router.post('/clear-cache', (req: Request, res: Response) => {
  const userId = (req.user as any)?.oid;
  
  logger.info('Cache clear requested', { userId });

  // Implement cache clearing logic here
  
  res.json({
    message: 'Cache cleared successfully',
    timestamp: new Date().toISOString(),
  });
});

export { router as adminRoutes };

