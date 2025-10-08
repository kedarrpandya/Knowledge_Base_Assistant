import { Ollama } from 'ollama';
import { QdrantClient } from '@qdrant/js-client-rest';

interface SearchResult {
  id: string | number;
  title: string;
  content: string;
  score: number;
}

export class LocalRAGService {
  private ollama: Ollama;
  private qdrant: QdrantClient;
  private collectionName: string;

  constructor() {
    // Initialize Ollama (free local LLM)
    this.ollama = new Ollama({
      host: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
    });

    // Initialize Qdrant (free vector DB)
    this.qdrant = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://localhost:6333'
    });

    this.collectionName = process.env.QDRANT_COLLECTION || 'knowledge_base';

    console.log('✅ LocalRAGService initialized');
    this.initializeCollection().catch(console.error);
  }

  private async initializeCollection() {
    try {
      const collections = await this.qdrant.getCollections();
      const exists = collections.collections.some(c => c.name === this.collectionName);

      if (!exists) {
        console.log(`📦 Creating collection: ${this.collectionName}`);
        await this.qdrant.createCollection(this.collectionName, {
          vectors: {
            size: 768, // nomic-embed-text dimension
            distance: 'Cosine'
          }
        });
        console.log('✅ Collection created');
      }
    } catch (error) {
      console.error('Error initializing collection:', error);
    }
  }

  async answerQuestion(question: string): Promise<any> {
    try {
      console.log(`🔍 Searching for: ${question.substring(0, 50)}...`);

      // 1. Generate embedding for question
      const embedding = await this.generateEmbedding(question);

      // 2. Search for similar documents
      const searchResults = await this.qdrant.search(this.collectionName, {
        vector: embedding,
        limit: 5,
        with_payload: true,
        score_threshold: 0.5
      });

      console.log(`📚 Found ${searchResults.length} relevant documents`);

      if (searchResults.length === 0) {
        return {
          answer: "I couldn't find any relevant information in the knowledge base to answer your question. Please try rephrasing or ask about a different topic.",
          sources: [],
          confidence: 0
        };
      }

      // 3. Build context from results
      const context = searchResults
        .map((r, idx) => `[Document ${idx + 1}: ${r.payload?.title}]\n${r.payload?.content}`)
        .join('\n\n---\n\n');

      // 4. Generate answer with Ollama
      console.log('🤖 Generating answer with Ollama...');
      
      const prompt = `You are a helpful enterprise knowledge assistant. Answer the question based ONLY on the provided context documents.

Context:
${context}

Question: ${question}

Instructions:
- Provide a clear, concise answer
- Cite which documents you used (e.g., "According to Document 1...")
- If the context doesn't contain enough information, say so
- Be professional and helpful

Answer:`;

      const response = await this.ollama.generate({
        model: process.env.OLLAMA_MODEL || 'llama2',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9
        }
      });

      const sources: SearchResult[] = searchResults.map(r => ({
        id: r.id,
        title: String(r.payload?.title || 'Untitled'),
        content: String(r.payload?.content || '').substring(0, 200) + '...',
        score: r.score || 0
      }));

      const avgScore = sources.reduce((sum, s) => sum + s.score, 0) / sources.length;

      console.log('✅ Answer generated');

      return {
        answer: response.response,
        sources,
        confidence: avgScore,
        model: process.env.OLLAMA_MODEL || 'llama2'
      };
    } catch (error) {
      console.error('Error in answerQuestion:', error);
      throw error;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.ollama.embeddings({
        model: 'nomic-embed-text', // Free embedding model
        prompt: text
      });
      return response.embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  async indexDocument(id: string | number, content: string, title: string, metadata?: any) {
    try {
      console.log(`📝 Indexing document: ${title}`);

      const embedding = await this.generateEmbedding(content);

      await this.qdrant.upsert(this.collectionName, {
        points: [{
          id: id,
          vector: embedding,
          payload: {
            content,
            title,
            ...metadata,
            indexed_at: new Date().toISOString()
          }
        }]
      });

      console.log(`✅ Document indexed: ${title}`);
    } catch (error) {
      console.error('Error indexing document:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const info = await this.qdrant.getCollection(this.collectionName);
      
      return {
        collection: this.collectionName,
        documentsCount: info.points_count || 0,
        vectorSize: info.config?.params?.vectors?.size || 0,
        model: process.env.OLLAMA_MODEL || 'llama2',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        error: 'Could not retrieve stats',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete a document from Qdrant
   */
  async deleteDocument(documentId: string): Promise<void> {
    await this.qdrant.delete(this.collectionName, {
      filter: {
        must: [
          {
            key: 'id',
            match: { value: documentId }
          }
        ]
      }
    });
  }

  /**
   * List all documents in the collection
   */
  async listAllDocuments(): Promise<Array<{
    id: string;
    title: string;
    category?: string;
    uploadedAt?: string;
    author?: string;
  }>> {
    try {
      const response = await this.qdrant.scroll(this.collectionName, {
        limit: 100,
        with_payload: true,
        with_vector: false
      });

      return response.points.map((point: any) => ({
        id: String(point.id),
        title: String(point.payload?.title || 'Untitled'),
        category: point.payload?.metadata?.category,
        uploadedAt: point.payload?.metadata?.uploadedAt,
        author: point.payload?.metadata?.author
      }));
    } catch (error) {
      console.error('Error listing documents:', error);
      return [];
    }
  }
}

