import { GroqRAGService } from './groqRagService';
import { v4 as uuidv4 } from 'uuid';
import pdf from 'pdf-parse';
import { createWorker } from 'tesseract.js';

interface DocumentMetadata {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  author?: string;
  source?: string;
  uploadedAt?: string;
}

export class DocumentUploadService {
  private ragService: GroqRAGService;

  constructor() {
    this.ragService = new GroqRAGService();
  }

  async uploadDocument(doc: DocumentMetadata): Promise<{ success: boolean; message: string; documentId?: string }> {
    try {
      if (!doc.title || !doc.content) {
        return { success: false, message: 'Document title and content are required.' };
      }

      const documentId = uuidv4();
      const metadata = {
        category: doc.category || 'general',
        tags: doc.tags || [],
        author: doc.author || 'anonymous',
        source: doc.source || 'manual-upload',
        uploadedAt: new Date().toISOString(),
      };

      await this.ragService.indexDocument(documentId, doc.content, doc.title, metadata);

      return {
        success: true,
        message: `Document "${doc.title}" added to knowledge base with ID: ${documentId}`,
        documentId,
      };
    } catch (error) {
      console.error('Error in DocumentUploadService.uploadDocument:', error);
      return { success: false, message: `Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  async extractTextFromFile(filename: string, buffer: Buffer): Promise<{ title: string; content: string }> {
    const fileExtension = filename.split('.').pop()?.toLowerCase();
    let content = '';
    let title = filename.split('.').slice(0, -1).join('.') || 'Untitled Document';

    try {
      switch (fileExtension) {
        case 'txt':
        case 'md':
        case 'json':
        case 'csv':
          content = buffer.toString('utf-8');
          break;

        case 'pdf':
          console.log(`📄 Extracting text from PDF: ${filename}`);
          const pdfData = await pdf(buffer);
          content = pdfData.text;
          console.log(`✅ Extracted ${content.length} characters from PDF`);
          break;

        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'bmp':
        case 'webp':
          console.log(`🖼️ Performing OCR on image: ${filename}`);
          content = await this.extractTextFromImage(buffer);
          console.log(`✅ Extracted ${content.length} characters from image via OCR`);
          break;

        default:
          content = buffer.toString('utf-8');
          console.warn(`Unsupported file type: ${fileExtension}. Attempting to read as plain text.`);
          break;
      }

      // Clean up extracted content
      content = content.trim();
      
      if (!content || content.length < 10) {
        throw new Error(`Insufficient content extracted from ${filename}. Please ensure the file contains readable text.`);
      }

    } catch (error) {
      console.error(`Error extracting text from file ${filename}:`, error);
      throw new Error(`Failed to extract text from ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { title, content };
  }

  private async extractTextFromImage(buffer: Buffer): Promise<string> {
    const worker = await createWorker('eng');
    
    try {
      const { data: { text } } = await worker.recognize(buffer);
      return text;
    } finally {
      await worker.terminate();
    }
  }

  async deleteDocument(documentId: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.ragService.deleteDocument(documentId);
      return { success: true, message: `Document with ID ${documentId} deleted.` };
    } catch (error) {
      console.error('Error deleting document:', error);
      return { success: false, message: `Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  async listDocuments(): Promise<Array<{
    id: string;
    title: string;
    category?: string;
    uploadedAt?: string;
    author?: string;
  }>> {
    try {
      return await this.ragService.listAllDocuments();
    } catch (error) {
      console.error('Error listing documents:', error);
      return [];
    }
  }
}

