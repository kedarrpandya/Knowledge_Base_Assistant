import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GroqRAGService } from '../api/_lib/groqRagService';

const ragService = new GroqRAGService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || question.length < 3) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Question must be at least 3 characters'
      });
    }

    console.log(`📝 Processing question: ${question}`);

    const startTime = Date.now();
    const result = await ragService.answerQuestion(question);
    const processingTime = Date.now() - startTime;

    return res.status(200).json({
      answer: result.answer,
      sources: result.sources,
      confidence: Math.round(result.confidence * 100),
      processingTimeMs: processingTime,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing query:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

