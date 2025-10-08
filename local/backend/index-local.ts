import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { GroqRAGService } from './groqRagService';
import { DocumentUploadService } from './documentUploadService';
import multer from 'multer';

// Load local environment
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.API_PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(morgan('dev'));

// Initialize services
const ragService = new GroqRAGService();
const uploadService = new DocumentUploadService();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    mode: 'groq-fast-mode',
    timestamp: new Date().toISOString(),
    services: {
      groq: 'enabled',
      qdrant: process.env.QDRANT_URL
    }
  });
});

// Query endpoint (no auth for local dev)
app.post('/api/query', async (req, res): Promise<void> => {
  try {
    const { question } = req.body;

    if (!question || question.length < 3) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Question must be at least 3 characters'
      });
      return;
    }

    console.log(`📝 Processing question: ${question}`);

    const startTime = Date.now();
    const result = await ragService.answerQuestion(question);
    const processingTime = Date.now() - startTime;

    res.json({
      answer: result.answer,
      sources: result.sources,
      confidence: Math.round(result.confidence * 100),
      processingTimeMs: processingTime,
      timestamp: new Date().toISOString(),
      mode: 'local'
    });
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Batch query endpoint
app.post('/api/query/batch', async (req, res): Promise<void> => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'questions must be a non-empty array'
      });
      return;
    }

    const results = await Promise.all(
      questions.map(q => ragService.answerQuestion(q))
    );

    res.json({
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing batch:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Index document endpoint (for testing)
app.post('/api/admin/index', async (req, res): Promise<void> => {
  try {
    const { id, content, title } = req.body;

    if (!id || !content || !title) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'id, content, and title are required'
      });
      return;
    }

    await ragService.indexDocument(id, content, title);

    res.json({
      message: 'Document indexed successfully',
      id,
      title
    });
  } catch (error) {
    console.error('Error indexing document:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Stats endpoint
app.get('/api/admin/stats', async (_req, res) => {
  try {
    const stats = await ragService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Document upload endpoint (file)
app.post('/api/documents/upload', upload.single('file'), async (req, res): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { title, content } = await uploadService.extractTextFromFile(
      req.file.originalname,
      req.file.buffer
    );

    const result = await uploadService.uploadDocument({
      title: req.body.title || title,
      content,
      category: req.body.category,
      tags: req.body.tags ? req.body.tags.split(',') : [],
      author: req.body.author,
      source: 'file-upload'
    });

    res.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Upload failed'
    });
  }
});

// Document upload endpoint (JSON/text)
app.post('/api/documents', async (req, res): Promise<void> => {
  try {
    const result = await uploadService.uploadDocument(req.body);
    res.json(result);
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Upload failed'
    });
  }
});

// List all documents
app.get('/api/documents', async (_req, res): Promise<void> => {
  try {
    const result = await uploadService.listDocuments();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list documents' });
  }
});

// Delete document
app.delete('/api/documents/:id', async (req, res): Promise<void> => {
  try {
    const result = await uploadService.deleteDocument(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('⚡ Knowledge Assistant - GROQ FAST MODE ⚡');
  console.log('='.repeat(60));
  console.log(`\n✅ Server running at http://localhost:${PORT}`);
  console.log(`\n📡 Services:`);
  console.log(`   - Groq AI: ENABLED (Lightning Fast!)`);
  console.log(`   - Model: llama-3.1-8b-instant`);
  console.log(`   - Qdrant: ${process.env.QDRANT_URL}`);
  console.log(`   - Document Upload: ENABLED`);
  console.log(`\n🧪 Test it:`);
  console.log(`   curl -X POST http://localhost:${PORT}/api/query \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{"question":"What is the vacation policy?"}'`);
  console.log(`\n⚡ Expected response time: 1-2 seconds!`);
  console.log('\n' + '='.repeat(60) + '\n');
});

export { app };

