import { Request, Response, NextFunction } from 'express';
import { BearerStrategy, IBearerStrategyOptionWithRequest, ITokenPayload } from 'passport-azure-ad';
import passport from 'passport';
import { config } from '../config';
import { logger } from '../utils/logger';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface User extends ITokenPayload {}
  }
}

// Configure Azure AD Bearer Strategy
const bearerStrategy = new BearerStrategy(
  {
    identityMetadata: `https://login.microsoftonline.com/${config.azureAd.tenantId}/v2.0/.well-known/openid-configuration`,
    clientID: config.azureAd.clientId,
    audience: config.azureAd.audience || config.azureAd.clientId,
    loggingLevel: config.nodeEnv === 'development' ? 'info' : 'error',
    passReqToCallback: false,
    validateIssuer: true,
    issuer: `https://login.microsoftonline.com/${config.azureAd.tenantId}/v2.0`,
  } as IBearerStrategyOptionWithRequest,
  (token: ITokenPayload, done: (error: any, user?: any, info?: any) => void) => {
    // Validate token claims
    if (!token.oid) {
      return done(new Error('Invalid token: missing oid claim'), null);
    }
    
    // You can add additional authorization logic here
    // For example, check if user has required roles or groups
    
    return done(null, token, token);
  }
);

passport.use(bearerStrategy);

// Initialize passport
export const initializeAuth = () => {
  return passport.initialize();
};

// Authentication middleware
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip authentication in development if configured
  if (config.nodeEnv === 'development' && process.env.SKIP_AUTH === 'true') {
    logger.warn('Authentication skipped in development mode');
    req.user = {
      oid: 'dev-user-id',
      name: 'Development User',
      preferred_username: 'dev@example.com',
    } as ITokenPayload;
    return next();
  }

  passport.authenticate(
    'oauth-bearer',
    { session: false },
    (err: Error, user: ITokenPayload, info: any) => {
      if (err) {
        logger.error('Authentication error', { error: err.message });
        return res.status(500).json({
          error: 'Authentication Error',
          message: 'An error occurred during authentication',
        });
      }

      if (!user) {
        logger.warn('Authentication failed', { info });
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or missing authentication token',
        });
      }

      req.user = user;
      logger.info('User authenticated', {
        userId: user.oid,
        userName: user.name,
      });
      
      next();
    }
  )(req, res, next);
};

// Role-based authorization middleware
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const userRoles = (req.user as ITokenPayload).roles || [];
    const hasRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      logger.warn('Authorization failed', {
        userId: (req.user as ITokenPayload).oid,
        requiredRoles: allowedRoles,
        userRoles,
      });
      
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};

// API Key authentication (for service-to-service calls)
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key required',
    });
  }

  // In production, validate against stored API keys
  // For now, this is a placeholder
  const validApiKey = process.env.SERVICE_API_KEY;
  
  if (apiKey !== validApiKey) {
    logger.warn('Invalid API key attempt', {
      sourceIp: req.ip,
    });
    
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API key',
    });
  }

  next();
};

