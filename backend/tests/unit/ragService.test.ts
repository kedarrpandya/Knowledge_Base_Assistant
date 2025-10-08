import { RAGService } from '../../src/services/ragService';
import { OpenAIClient } from '@azure/openai';
import { SearchClient } from '@azure/search-documents';

// Mock Azure clients
jest.mock('@azure/openai');
jest.mock('@azure/search-documents');

describe('RAGService', () => {
  let ragService: RAGService;
  let mockOpenAIClient: jest.Mocked<OpenAIClient>;
  let mockSearchClient: jest.Mocked<SearchClient<any>>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create service instance
    ragService = new RAGService();
    
    // Get mocked clients
    mockOpenAIClient = (OpenAIClient as jest.MockedClass<typeof OpenAIClient>).mock.instances[0] as any;
    mockSearchClient = (SearchClient as jest.MockedClass<typeof SearchClient>).mock.instances[0] as any;
  });

  describe('answerQuestion', () => {
    it('should return an answer with sources when documents are found', async () => {
      // Mock search results
      const mockSearchResults = {
        results: [
          {
            document: {
              id: 'doc1',
              content: 'This is test content about onboarding.',
              title: 'Onboarding Guide',
              metadata: { category: 'HR' },
            },
            score: 0.85,
          },
        ],
      };

      mockSearchClient.search = jest.fn().mockResolvedValue(mockSearchResults);

      // Mock OpenAI completion
      mockOpenAIClient.getChatCompletions = jest.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: 'The onboarding process includes...',
            },
          },
        ],
        usage: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
        },
      });

      const result = await ragService.answerQuestion('How does onboarding work?', 'user123');

      expect(result).toHaveProperty('answer');
      expect(result).toHaveProperty('sources');
      expect(result).toHaveProperty('confidence');
      expect(result.sources).toHaveLength(1);
      expect(result.answer).toContain('onboarding');
      expect(mockSearchClient.search).toHaveBeenCalled();
      expect(mockOpenAIClient.getChatCompletions).toHaveBeenCalled();
    });

    it('should return a helpful message when no documents are found', async () => {
      // Mock empty search results
      mockSearchClient.search = jest.fn().mockResolvedValue({ results: [] });

      const result = await ragService.answerQuestion('Nonexistent topic', 'user123');

      expect(result.answer).toContain('could not find');
      expect(result.sources).toHaveLength(0);
      expect(result.confidence).toBe(0);
      expect(mockOpenAIClient.getChatCompletions).not.toHaveBeenCalled();
    });

    it('should handle search errors gracefully', async () => {
      mockSearchClient.search = jest.fn().mockRejectedValue(new Error('Search service unavailable'));

      await expect(ragService.answerQuestion('Test question', 'user123'))
        .rejects
        .toThrow('Failed to search knowledge base');
    });

    it('should handle OpenAI errors gracefully', async () => {
      // Mock successful search
      mockSearchClient.search = jest.fn().mockResolvedValue({
        results: [
          {
            document: { id: 'doc1', content: 'Content', title: 'Title', metadata: {} },
            score: 0.8,
          },
        ],
      });

      // Mock OpenAI error
      mockOpenAIClient.getChatCompletions = jest.fn().mockRejectedValue(
        new Error('OpenAI service unavailable')
      );

      await expect(ragService.answerQuestion('Test question', 'user123'))
        .rejects
        .toThrow('Failed to generate answer');
    });

    it('should filter results by minimum relevance score', async () => {
      const mockSearchResults = {
        results: [
          {
            document: { id: 'doc1', content: 'High relevance', title: 'Title 1', metadata: {} },
            score: 0.85,
          },
          {
            document: { id: 'doc2', content: 'Low relevance', title: 'Title 2', metadata: {} },
            score: 0.5,
          },
        ],
      };

      mockSearchClient.search = jest.fn().mockResolvedValue(mockSearchResults);
      mockOpenAIClient.getChatCompletions = jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Answer' } }],
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      });

      const result = await ragService.answerQuestion('Test', 'user123');

      // Should only include high relevance document
      expect(result.sources.length).toBeLessThanOrEqual(1);
    });
  });

  describe('generateEmbedding', () => {
    it('should generate embeddings for text', async () => {
      const mockEmbedding = new Array(1536).fill(0.1);
      
      mockOpenAIClient.getEmbeddings = jest.fn().mockResolvedValue({
        data: [{ embedding: mockEmbedding }],
      });

      const result = await ragService.generateEmbedding('Test text');

      expect(result).toHaveLength(1536);
      expect(mockOpenAIClient.getEmbeddings).toHaveBeenCalledWith(
        expect.any(String),
        ['Test text']
      );
    });

    it('should handle embedding generation errors', async () => {
      mockOpenAIClient.getEmbeddings = jest.fn().mockRejectedValue(
        new Error('Embedding service unavailable')
      );

      await expect(ragService.generateEmbedding('Test'))
        .rejects
        .toThrow('Failed to generate embedding');
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when all services are operational', async () => {
      mockOpenAIClient.getChatCompletions = jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'test' } }],
      });

      mockSearchClient.getDocument = jest.fn().mockRejectedValue(
        new Error('Not found') // Expected 404, means search is working
      );

      const result = await ragService.healthCheck();

      expect(result.openai).toBe(true);
      expect(result.search).toBe(true);
    });

    it('should return unhealthy status when OpenAI is down', async () => {
      mockOpenAIClient.getChatCompletions = jest.fn().mockRejectedValue(
        new Error('Service unavailable')
      );

      mockSearchClient.getDocument = jest.fn().mockRejectedValue(new Error('Not found'));

      const result = await ragService.healthCheck();

      expect(result.openai).toBe(false);
      expect(result.search).toBe(true);
    });
  });
});

