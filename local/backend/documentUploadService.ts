import { LocalRAGService } from './localRagService';
import { GroqRAGService } from './groqRagService';
import pdf from 'pdf-parse';
import { createWorker } from 'tesseract.js';

export interface DocumentUpload {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  author?: string;
  source?: string;
}

export class DocumentUploadService {
  private ragService: LocalRAGService;
  private groqService: GroqRAGService;

  constructor() {
    this.ragService = new LocalRAGService();
    this.groqService = new GroqRAGService();
  }

  /**
   * Upload and index a new document
   */
  async uploadDocument(document: DocumentUpload): Promise<{
    success: boolean;
    message: string;
    documentId: string;
  }> {
    try {
      // Generate unique document ID
      const documentId = this.generateDocumentId(document.title);

      // Validate document
      this.validateDocument(document);

      // Index document in Qdrant
      await this.ragService.indexDocument(
        documentId,
        document.content,
        document.title,
        {
          category: document.category || 'general',
          tags: document.tags || [],
          author: document.author || 'unknown',
          source: document.source || 'user-upload',
          uploadedAt: new Date().toISOString(),
        }
      );

      return {
        success: true,
        message: `✅ Document "${document.title}" has been successfully added to the knowledge base! It's now available for AI-powered search.`,
        documentId
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      return {
        success: false,
        message: `❌ Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        documentId: ''
      };
    }
  }

  /**
   * Upload multiple documents at once
   */
  async uploadMultipleDocuments(documents: DocumentUpload[]): Promise<{
    success: boolean;
    message: string;
    successCount: number;
    failedCount: number;
    details: Array<{ title: string; success: boolean; documentId?: string; error?: string }>;
  }> {
    const results = await Promise.allSettled(
      documents.map(doc => this.uploadDocument(doc))
    );

    const details = results.map((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        return {
          title: documents[index].title,
          success: true,
          documentId: result.value.documentId
        };
      } else {
        return {
          title: documents[index].title,
          success: false,
          error: result.status === 'fulfilled' ? result.value.message : 'Upload failed'
        };
      }
    });

    const successCount = details.filter(d => d.success).length;
    const failedCount = details.length - successCount;

    return {
      success: successCount > 0,
      message: `📊 Uploaded ${successCount} of ${documents.length} documents successfully.`,
      successCount,
      failedCount,
      details
    };
  }

  /**
   * Extract text from file buffer (supports TXT, JSON, etc.)
   */
  async extractTextFromFile(
    fileName: string,
    fileBuffer: Buffer
  ): Promise<{ title: string; content: string }> {
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    switch (fileExtension) {
      case 'txt':
        return {
          title: fileName,
          content: fileBuffer.toString('utf-8')
        };

      case 'json':
        try {
          const jsonData = JSON.parse(fileBuffer.toString('utf-8'));
          return {
            title: jsonData.title || fileName,
            content: JSON.stringify(jsonData, null, 2)
          };
        } catch (error) {
          throw new Error('Invalid JSON file');
        }

      case 'md':
        return {
          title: fileName,
          content: fileBuffer.toString('utf-8')
        };

      case 'pdf':
        console.log(`📄 Extracting text from PDF: ${fileName}`);
        const pdfData = await pdf(fileBuffer);
        console.log(`✅ Extracted ${pdfData.text.length} characters from PDF`);
        return {
          title: fileName,
          content: pdfData.text
        };

      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'bmp':
      case 'webp':
        console.log(`🖼️ Performing OCR on image: ${fileName}`);
        const imageText = await this.extractTextFromImage(fileBuffer);
        console.log(`✅ Extracted ${imageText.length} characters from image via OCR`);
        return {
          title: fileName,
          content: imageText
        };

      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }
  }

  /**
   * Extract text from image using OCR
   */
  private async extractTextFromImage(buffer: Buffer): Promise<string> {
    const worker = await createWorker('eng');
    
    try {
      const { data: { text } } = await worker.recognize(buffer);
      
      if (!text || text.trim().length < 10) {
        throw new Error('Could not extract sufficient text from image. Please ensure the image contains readable text.');
      }
      
      return text;
    } finally {
      await worker.terminate();
    }
  }

  /**
   * Validate document before upload
   */
  private validateDocument(document: DocumentUpload): void {
    if (!document.title || document.title.trim().length === 0) {
      throw new Error('Document title is required');
    }

    if (!document.content || document.content.trim().length === 0) {
      throw new Error('Document content is required');
    }

    if (document.content.length < 10) {
      throw new Error('Document content is too short (minimum 10 characters)');
    }

    if (document.content.length > 1000000) {
      throw new Error('Document content is too large (maximum 1MB)');
    }
  }

  /**
   * Generate unique document ID
   */
  private generateDocumentId(title: string): string {
    const timestamp = Date.now();
    const sanitizedTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .substring(0, 50);
    return `${sanitizedTitle}-${timestamp}`;
  }

  /**
   * Delete a document from the knowledge base
   */
  async deleteDocument(documentId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      await this.ragService.deleteDocument(documentId);
      return {
        success: true,
        message: `✅ Document has been removed from the knowledge base.`
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * List all uploaded documents
   */
  async listDocuments(): Promise<{
    success: boolean;
    documents: Array<{
      id: string;
      title: string;
      category?: string;
      uploadedAt?: string;
      author?: string;
    }>;
  }> {
    try {
      const documents = await this.ragService.listAllDocuments();
      return {
        success: true,
        documents
      };
    } catch (error) {
      return {
        success: true,
        documents: []
      };
    }
  }
}

