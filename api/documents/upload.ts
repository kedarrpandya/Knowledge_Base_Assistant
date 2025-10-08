import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DocumentUploadService } from '../_lib/documentUploadService';

const uploadService = new DocumentUploadService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For Vercel serverless, we'll accept base64 encoded file content
    const { filename, fileContent, title, category, author, tags } = req.body;
    
    if (!fileContent) {
      return res.status(400).json({ error: 'No file content provided' });
    }

    // Decode base64 content
    const buffer = Buffer.from(fileContent, 'base64');
    
    const { title: extractedTitle, content } = await uploadService.extractTextFromFile(
      filename || 'document.txt',
      buffer
    );

    const result = await uploadService.uploadDocument({
      title: title || extractedTitle,
      content,
      category: category || 'general',
      tags: tags || [],
      author: author || 'anonymous',
      source: 'file-upload'
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Upload failed'
    });
  }
}

