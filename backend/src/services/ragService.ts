import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { SearchClient, AzureKeyCredential as SearchKeyCredential } from '@azure/search-documents';
import { config } from '../config';
import { logger } from '../utils/logger';
import { trackDependency, trackMetric } from '../utils/monitoring';

interface SearchResult {
  id: string;
  content: string;
  title: string;
  metadata: Record<string, any>;
  score: number;
}

interface RAGResponse {
  answer: string;
  sources: SearchResult[];
  confidence: number;
  processingTimeMs: number;
}

export class RAGService {
  private openaiClient: OpenAIClient;
  private searchClient: SearchClient<any>;

  constructor() {
    // Initialize Azure OpenAI client
    this.openaiClient = new OpenAIClient(
      config.azureOpenAI.endpoint,
      new AzureKeyCredential(config.azureOpenAI.apiKey)
    );

    // Initialize Azure Cognitive Search client
    this.searchClient = new SearchClient(
      config.azureSearch.endpoint,
      config.azureSearch.indexName,
      new SearchKeyCredential(config.azureSearch.apiKey)
    );

    logger.info('RAG Service initialized');
  }

  /**
   * Process a user question and return an AI-generated answer with sources
   */
  async answerQuestion(question: string, userId: string): Promise<RAGResponse> {
    const startTime = Date.now();

    try {
      logger.info('Processing question', { userId, questionLength: question.length });

      // Step 1: Retrieve relevant documents from Cognitive Search
      const searchResults = await this.searchDocuments(question);

      if (searchResults.length === 0) {
        logger.warn('No relevant documents found', { userId, question });
        return {
          answer: 'I could not find any relevant information in the knowledge base to answer your question. Please try rephrasing or contact support for assistance.',
          sources: [],
          confidence: 0,
          processingTimeMs: Date.now() - startTime,
        };
      }

      // Step 2: Generate answer using Azure OpenAI with context
      const answer = await this.generateAnswer(question, searchResults);

      // Calculate confidence based on search scores and response
      const avgScore = searchResults.reduce((sum, r) => sum + r.score, 0) / searchResults.length;
      const confidence = Math.min(avgScore * 100, 95);

      const processingTime = Date.now() - startTime;

      // Track metrics
      trackMetric('rag.processing_time_ms', processingTime, { userId });
      trackMetric('rag.sources_count', searchResults.length, { userId });
      trackMetric('rag.confidence', confidence, { userId });

      logger.info('Question processed successfully', {
        userId,
        processingTimeMs: processingTime,
        sourcesCount: searchResults.length,
        confidence,
      });

      return {
        answer,
        sources: searchResults,
        confidence,
        processingTimeMs: processingTime,
      };
    } catch (error) {
      logger.error('Error processing question', { userId, error });
      throw error;
    }
  }

  /**
   * Search for relevant documents in Azure Cognitive Search
   */
  private async searchDocuments(query: string): Promise<SearchResult[]> {
    const searchStartTime = Date.now();

    try {
      const searchOptions = {
        top: config.rag.topK,
        select: ['id', 'content', 'title', 'metadata'],
        queryType: 'semantic' as const,
        semanticConfiguration: 'default',
        includeTotalCount: true,
      };

      const searchResults = await this.searchClient.search(query, searchOptions);

      const documents: SearchResult[] = [];
      
      for await (const result of searchResults.results) {
        const score = result.score || 0;
        
        // Filter by minimum relevance score
        if (score >= config.rag.minRelevanceScore) {
          documents.push({
            id: result.document.id,
            content: result.document.content,
            title: result.document.title,
            metadata: result.document.metadata || {},
            score,
          });
        }
      }

      const searchDuration = Date.now() - searchStartTime;
      trackDependency(
        'Azure Cognitive Search',
        `search: ${query.substring(0, 50)}`,
        searchDuration,
        true,
        'Azure Search'
      );

      logger.info('Search completed', {
        query: query.substring(0, 100),
        resultsCount: documents.length,
        durationMs: searchDuration,
      });

      return documents;
    } catch (error) {
      const searchDuration = Date.now() - searchStartTime;
      trackDependency(
        'Azure Cognitive Search',
        `search: ${query.substring(0, 50)}`,
        searchDuration,
        false,
        'Azure Search'
      );
      
      logger.error('Search failed', { error });
      throw new Error('Failed to search knowledge base');
    }
  }

  /**
   * Generate answer using Azure OpenAI with retrieved context
   */
  private async generateAnswer(question: string, sources: SearchResult[]): Promise<string> {
    const completionStartTime = Date.now();

    try {
      // Build context from search results
      const context = sources
        .map((source, idx) => {
          return `[Document ${idx + 1}: ${source.title}]\n${source.content}\n`;
        })
        .join('\n---\n\n');

      // Construct prompt
      const systemPrompt = `You are an intelligent enterprise knowledge assistant. Your role is to provide accurate, helpful answers based on the company's knowledge base.

Guidelines:
- Answer questions using only the provided context documents
- Be concise and professional
- If the context doesn't contain enough information, acknowledge the limitation
- Cite sources by referring to document numbers (e.g., "According to Document 1...")
- If multiple documents provide relevant information, synthesize the answer
- Maintain a helpful and professional tone`;

      const userPrompt = `Context documents:

${context}

---

Question: ${question}

Please provide a comprehensive answer based on the context above. Remember to cite your sources.`;

      // Call Azure OpenAI
      const completion = await this.openaiClient.getChatCompletions(
        config.azureOpenAI.deploymentName,
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        {
          maxTokens: config.rag.maxTokens,
          temperature: config.rag.temperature,
          topP: 0.95,
          frequencyPenalty: 0,
          presencePenalty: 0,
        }
      );

      const answer = completion.choices[0]?.message?.content || 'Unable to generate answer';

      const completionDuration = Date.now() - completionStartTime;
      trackDependency(
        'Azure OpenAI',
        `completion: ${config.azureOpenAI.deploymentName}`,
        completionDuration,
        true,
        'Azure OpenAI'
      );

      // Track token usage
      if (completion.usage) {
        trackMetric('openai.prompt_tokens', completion.usage.promptTokens);
        trackMetric('openai.completion_tokens', completion.usage.completionTokens);
        trackMetric('openai.total_tokens', completion.usage.totalTokens);
      }

      logger.info('Answer generated', {
        durationMs: completionDuration,
        tokensUsed: completion.usage?.totalTokens,
      });

      return answer;
    } catch (error) {
      const completionDuration = Date.now() - completionStartTime;
      trackDependency(
        'Azure OpenAI',
        `completion: ${config.azureOpenAI.deploymentName}`,
        completionDuration,
        false,
        'Azure OpenAI'
      );
      
      logger.error('Answer generation failed', { error });
      throw new Error('Failed to generate answer');
    }
  }

  /**
   * Generate embeddings for text (used in ingestion pipeline)
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const embeddings = await this.openaiClient.getEmbeddings(
        config.azureOpenAI.embeddingDeploymentName,
        [text]
      );

      return embeddings.data[0].embedding;
    } catch (error) {
      logger.error('Embedding generation failed', { error });
      throw new Error('Failed to generate embedding');
    }
  }

  /**
   * Health check for RAG service dependencies
   */
  async healthCheck(): Promise<{ openai: boolean; search: boolean }> {
    const health = {
      openai: false,
      search: false,
    };

    try {
      // Test OpenAI connection
      await this.openaiClient.getChatCompletions(
        config.azureOpenAI.deploymentName,
        [{ role: 'user', content: 'test' }],
        { maxTokens: 5 }
      );
      health.openai = true;
    } catch (error) {
      logger.error('OpenAI health check failed', { error });
    }

    try {
      // Test Search connection
      await this.searchClient.getDocument('health-check-doc');
      health.search = true;
    } catch (error) {
      // Expected to fail if document doesn't exist, but connection works
      if (error instanceof Error && !error.message.includes('404')) {
        logger.error('Search health check failed', { error });
      } else {
        health.search = true;
      }
    }

    return health;
  }
}

// Singleton instance
export const ragService = new RAGService();

