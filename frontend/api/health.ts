import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const envStatus = {
    GROQ_API_KEY: process.env.GROQ_API_KEY ? '✅ Configured' : '❌ Missing',
    QDRANT_URL: process.env.QDRANT_URL ? `✅ ${process.env.QDRANT_URL}` : '❌ Missing',
    QDRANT_API_KEY: process.env.QDRANT_API_KEY ? '✅ Configured' : '❌ Missing',
    QDRANT_COLLECTION: process.env.QDRANT_COLLECTION || 'knowledge_base (default)'
  };

  const allConfigured = !!(process.env.GROQ_API_KEY && 
                           process.env.QDRANT_URL && 
                           process.env.QDRANT_API_KEY);

  return res.status(200).json({
    status: allConfigured ? 'healthy' : 'configuration_incomplete',
    mode: 'groq-fast-mode',
    timestamp: new Date().toISOString(),
    environment: envStatus,
    services: {
      groq: process.env.GROQ_API_KEY ? 'enabled' : 'missing_api_key',
      qdrant: process.env.QDRANT_URL ? 'enabled' : 'missing_url',
      documentUpload: 'enabled'
    },
    message: allConfigured 
      ? '✅ All systems operational'
      : '⚠️ Missing environment variables - check settings'
  });
}

