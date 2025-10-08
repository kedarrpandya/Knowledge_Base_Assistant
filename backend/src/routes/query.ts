import { Router, Request, Response } from 'express';
import Joi from 'joi';
import rateLimit from 'express-rate-limit';
import { ragService } from '../services/ragService';
import { logger } from '../utils/logger';
import { trackEvent } from '../utils/monitoring';
import { asyncHandler } from '../middleware/errorHandler';
import { config } from '../config';

const router = Router();

// Rate limiter for query endpoint
const queryRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schema
const questionSchema = Joi.object({
  question: Joi.string().min(3).max(1000).required(),
  sessionId: Joi.string().optional(),
  metadata: Joi.object().optional(),
});

/**
 * POST /api/query
 * Main RAG query endpoint
 */
router.post(
  '/',
  queryRateLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    // Validate request
    const { error, value } = questionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
      });
    }

    const { question, sessionId, metadata } = value;
    const userId = (req.user as any)?.oid || 'anonymous';

    logger.info('Query received', {
      userId,
      sessionId,
      questionLength: question.length,
    });

    // Track query event
    trackEvent('query.received', {
      userId,
      sessionId: sessionId || 'none',
      questionLength: question.length.toString(),
    });

    // Process query
    const result = await ragService.answerQuestion(question, userId);

    // Track successful query
    trackEvent('query.completed', {
      userId,
      sessionId: sessionId || 'none',
      sourcesCount: result.sources.length.toString(),
      confidence: result.confidence.toString(),
      processingTimeMs: result.processingTimeMs.toString(),
    });

    // Return response
    res.json({
      answer: result.answer,
      sources: result.sources.map((source) => ({
        id: source.id,
        title: source.title,
        excerpt: source.content.substring(0, 200) + '...',
        relevanceScore: Math.round(source.score * 100) / 100,
        metadata: source.metadata,
      })),
      confidence: Math.round(result.confidence * 100) / 100,
      processingTimeMs: result.processingTimeMs,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * POST /api/query/batch
 * Batch query endpoint for multiple questions
 */
router.post(
  '/batch',
  asyncHandler(async (req: Request, res: Response) => {
    const questionsSchema = Joi.object({
      questions: Joi.array().items(Joi.string().min(3).max(1000)).min(1).max(10).required(),
    });

    const { error, value } = questionsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
      });
    }

    const { questions } = value;
    const userId = (req.user as any)?.oid || 'anonymous';

    logger.info('Batch query received', {
      userId,
      questionsCount: questions.length,
    });

    // Process all questions in parallel
    const results = await Promise.all(
      questions.map((question: string) => ragService.answerQuestion(question, userId))
    );

    res.json({
      results: results.map((result) => ({
        answer: result.answer,
        sources: result.sources.map((source) => ({
          id: source.id,
          title: source.title,
          excerpt: source.content.substring(0, 200) + '...',
          relevanceScore: Math.round(source.score * 100) / 100,
        })),
        confidence: Math.round(result.confidence * 100) / 100,
        processingTimeMs: result.processingTimeMs,
      })),
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * POST /api/query/feedback
 * Collect user feedback on answers
 */
router.post(
  '/feedback',
  asyncHandler(async (req: Request, res: Response) => {
    const feedbackSchema = Joi.object({
      questionId: Joi.string().required(),
      rating: Joi.number().integer().min(1).max(5).required(),
      comment: Joi.string().max(500).optional(),
      helpful: Joi.boolean().required(),
    });

    const { error, value } = feedbackSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message,
      });
    }

    const { questionId, rating, comment, helpful } = value;
    const userId = (req.user as any)?.oid || 'anonymous';

    logger.info('Feedback received', {
      userId,
      questionId,
      rating,
      helpful,
    });

    // Track feedback event
    trackEvent('query.feedback', {
      userId,
      questionId,
      rating: rating.toString(),
      helpful: helpful.toString(),
      hasComment: (!!comment).toString(),
    });

    // In production, store this in a database
    // For now, just acknowledge receipt

    res.json({
      message: 'Feedback received successfully',
      timestamp: new Date().toISOString(),
    });
  })
);

export { router as queryRoutes };

