import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    status: 'healthy',
    mode: 'groq-fast-mode',
    timestamp: new Date().toISOString(),
    services: {
      groq: 'enabled',
      qdrant: process.env.QDRANT_URL,
      documentUpload: 'enabled'
    }
  });
}

