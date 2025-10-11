import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GroqRAGService } from '../api/_lib/groqRagService';

const ragService = new GroqRAGService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check environment variables
    const missingEnvVars = [];
    if (!process.env.GROQ_API_KEY) missingEnvVars.push('GROQ_API_KEY');
    if (!process.env.QDRANT_URL) missingEnvVars.push('QDRANT_URL');
    if (!process.env.QDRANT_API_KEY) missingEnvVars.push('QDRANT_API_KEY');

    if (missingEnvVars.length > 0) {
      console.error('❌ Missing environment variables:', missingEnvVars);
      return res.status(500).json({
        error: 'Configuration Error',
        message: `Missing environment variables: ${missingEnvVars.join(', ')}. Please add them in Vercel Dashboard → Settings → Environment Variables, then redeploy.`,
        missingVars: missingEnvVars
      });
    }

    const { question } = req.body;

    if (!question || typeof question !== 'string' || question.length < 3) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Question must be at least 3 characters'
      });
    }

    console.log(`📝 Processing question: ${question}`);
    console.log(`✅ Environment check passed. Qdrant: ${process.env.QDRANT_URL?.substring(0, 30)}...`);

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
    console.error('❌ Error processing query:', error);
    
    // More detailed error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    
    console.error('Error details:', { message: errorMessage, stack: errorStack });
    
    return res.status(500).json({
      error: 'Internal Server Error',
      message: errorMessage,
      details: errorStack?.split('\n')[0] || 'No additional details',
      hint: errorMessage.includes('collection') 
        ? 'Try uploading a document first to create the collection'
        : errorMessage.includes('API key')
        ? 'Check if your API keys are valid'
        : 'Check Vercel logs for more details'
    });
  }
}

