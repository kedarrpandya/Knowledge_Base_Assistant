import Groq from 'groq-sdk';
import { QdrantClient } from '@qdrant/js-client-rest';

interface SearchResult {
  id: string | number;
  title: string;
  content: string;
  score: number;
}

export class GroqRAGService {
  private groq: Groq;
  private qdrant: QdrantClient;
  private collectionName: string;

  constructor() {
    // Initialize Groq (super fast & FREE)
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY || ''
    });

    // Initialize Qdrant (free vector DB)
    this.qdrant = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      apiKey: process.env.QDRANT_API_KEY
    });

    this.collectionName = process.env.QDRANT_COLLECTION || 'knowledge_base';

    console.log('✅ GroqRAGService initialized (FAST MODE)');
  }

  async answerQuestion(question: string): Promise<any> {
    const startTime = Date.now();

    try {
      console.log(`🔍 Searching for: ${question.substring(0, 50)}...`);

      // 1. Search for similar documents
      const searchResults = await this.searchDocuments(question);

      console.log(`📚 Found ${searchResults.length} relevant documents`);

      if (searchResults.length === 0) {
        return {
          answer: "I couldn't find any relevant information in the knowledge base to answer your question.",
          sources: [],
          confidence: 0
        };
      }

      // 2. Build context from results
      const context = searchResults
        .map((r, idx) => `[Document ${idx + 1}: ${r.title}]\n${r.content}`)
        .join('\n\n---\n\n');

      // 3. Generate answer with Groq (SUPER FAST!)
      console.log('⚡ Generating answer with Groq (lightning fast)...');
      
      const completion = await this.groq.chat.completions.create({
        model: "llama-3.1-8b-instant", // Super fast model
        messages: [
          {
            role: "system",
            content: "You are a helpful enterprise knowledge assistant. Answer questions based ONLY on the provided context documents. Be concise and cite your sources."
          },
          {
            role: "user",
            content: `Context:\n${context}\n\nQuestion: ${question}\n\nProvide a clear answer and cite which documents you used.`
          }
        ],
        temperature: 0.3,
        max_tokens: 1024,
      });

      const answer = completion.choices[0]?.message?.content || 'Unable to generate answer';

      const sources: SearchResult[] = searchResults.map(r => ({
        id: r.id,
        title: r.title,
        content: r.content.substring(0, 200) + '...',
        score: r.score
      }));

      const avgScore = sources.reduce((sum, s) => sum + s.score, 0) / sources.length;
      const processingTime = Date.now() - startTime;

      console.log(`✅ Answer generated in ${processingTime}ms`);

      return {
        answer,
        sources,
        confidence: avgScore,
        model: 'llama-3.1-8b-instant (Groq)'
      };
    } catch (error) {
      console.error('Error in answerQuestion:', error);
      throw error;
    }
  }

  private async searchDocuments(query: string): Promise<SearchResult[]> {
    try {
      // Get all documents from collection
      const result = await this.qdrant.scroll(this.collectionName, {
        limit: 100,
        with_payload: true
      });

      // Simple keyword matching
      const queryLower = query.toLowerCase();
      const scoredDocs = result.points
        .map(point => ({
          id: point.id,
          title: String(point.payload?.title || 'Untitled'),
          content: String(point.payload?.content || ''),
          score: this.calculateScore(queryLower, String(point.payload?.content || '').toLowerCase())
        }))
        .filter(doc => doc.score > 0.1)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      return scoredDocs;
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  private calculateScore(query: string, content: string): number {
    const queryWords = query.split(/\s+/);
    let matches = 0;
    
    for (const word of queryWords) {
      if (word.length > 3 && content.includes(word)) {
        matches++;
      }
    }
    
    return matches / queryWords.length;
  }

  async indexDocument(id: string | number, content: string, title: string, metadata?: any) {
    try {
      console.log(`📝 Indexing document: ${title}`);

      await this.qdrant.upsert(this.collectionName, {
        points: [{
          id: id,
          vector: new Array(768).fill(0), // Dummy vector for now
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

  async getStats() {
    try {
      const info = await this.qdrant.getCollection(this.collectionName);
      
      return {
        collection: this.collectionName,
        documentsCount: info.points_count || 0,
        model: 'llama-3.1-8b-instant (Groq - FAST)',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        error: 'Could not retrieve stats',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

