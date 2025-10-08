import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DocumentUploadService } from '../_lib/documentUploadService';

const uploadService = new DocumentUploadService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Handle GET - List documents
    if (req.method === 'GET') {
      const result = await uploadService.listDocuments();
      return res.status(200).json(result);
    }

    // Handle POST - Upload document (JSON/text)
    if (req.method === 'POST') {
      const result = await uploadService.uploadDocument(req.body);
      return res.status(200).json(result);
    }

    // Handle DELETE - Delete document
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Document ID required' });
      }
      const result = await uploadService.deleteDocument(id);
      return res.status(200).json(result);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Document API error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}

