import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DocumentUploadService } from '../_lib/documentUploadService';

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadService = new DocumentUploadService();

// Helper to parse multipart form data
async function parseFormData(req: VercelRequest): Promise<{ fields: any; file?: { name: string; data: Buffer } }> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const data = buffer.toString('utf-8');
      
      // Simple multipart parser (for demo - production would use a library)
      const boundary = req.headers['content-type']?.split('boundary=')[1];
      if (!boundary) {
        resolve({ fields: {} });
        return;
      }
      
      const parts = data.split(`--${boundary}`);
      const fields: any = {};
      let file: { name: string; data: Buffer } | undefined;
      
      for (const part of parts) {
        if (part.includes('filename=')) {
          // This is a file
          const nameMatch = part.match(/filename="([^"]+)"/);
          const filename = nameMatch ? nameMatch[1] : 'untitled.txt';
          
          // Extract file content (after double CRLF)
          const contentStart = part.indexOf('\r\n\r\n') + 4;
          const contentEnd = part.lastIndexOf('\r\n');
          const content = part.substring(contentStart, contentEnd);
          
          file = {
            name: filename,
            data: Buffer.from(content, 'utf-8')
          };
        } else if (part.includes('name=')) {
          // This is a field
          const nameMatch = part.match(/name="([^"]+)"/);
          const fieldName = nameMatch ? nameMatch[1] : '';
          
          const contentStart = part.indexOf('\r\n\r\n') + 4;
          const contentEnd = part.lastIndexOf('\r\n');
          const value = part.substring(contentStart, contentEnd).trim();
          
          if (fieldName) {
            fields[fieldName] = value;
          }
        }
      }
      
      resolve({ fields, file });
    });
    
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fields, file } = await parseFormData(req);
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, content } = await uploadService.extractTextFromFile(
      file.name,
      file.data
    );

    const result = await uploadService.uploadDocument({
      title: fields.title || title,
      content,
      category: fields.category,
      tags: fields.tags ? fields.tags.split(',') : [],
      author: fields.author,
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

