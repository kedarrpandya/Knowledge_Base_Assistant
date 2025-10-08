import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GroqRAGService } from './_lib/groqRagService';

const ragService = new GroqRAGService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stats = await ragService.getStats();
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

