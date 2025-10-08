import { app, InvocationContext, Timer } from '@azure/functions';
import { BlobServiceClient } from '@azure/storage-blob';
import { SearchClient, AzureKeyCredential } from '@azure/search-documents';
import { OpenAIClient, AzureKeyCredential as OpenAIKeyCredential } from '@azure/openai';
import * as pdf from 'pdf-parse';
import * as mammoth from 'mammoth';
import { v4 as uuidv4 } from 'uuid';

interface Document {
  id: string;
  content: string;
  title: string;
  metadata: {
    sourceType: string;
    fileName: string;
    fileSize: number;
    uploadedAt: string;
    processedAt: string;
    contentType: string;
  };
  contentVector?: number[];
  updated_at: string;
}

/**
 * Timer-triggered function that processes documents from blob storage
 * Runs every 15 minutes to check for new documents
 */
export async function documentProcessorTimer(
  myTimer: Timer,
  context: InvocationContext
): Promise<void> {
  context.log('Document processor timer function started');

  try {
    const connectionString = process.env.STORAGE_CONNECTION_STRING!;
    const containerName = 'knowledge-documents';

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Get search client
    const searchClient = getSearchClient();
    const openAIClient = getOpenAIClient();

    let processedCount = 0;
    let errorCount = 0;

    // List all blobs in the container
    for await (const blob of containerClient.listBlobsFlat()) {
      try {
        context.log(`Processing blob: ${blob.name}`);

        // Check if already processed (using metadata or tags)
        const blobClient = containerClient.getBlobClient(blob.name);
        const properties = await blobClient.getProperties();

        if (properties.metadata?.processed === 'true') {
          context.log(`Skipping already processed blob: ${blob.name}`);
          continue;
        }

        // Download blob content
        const downloadResponse = await blobClient.download();
        const buffer = await streamToBuffer(downloadResponse.readableStreamBody!);

        // Extract text based on file type
        const text = await extractText(buffer, blob.name, context);

        if (!text || text.trim().length === 0) {
          context.warn(`No text extracted from ${blob.name}`);
          continue;
        }

        // Split into chunks if necessary
        const chunks = chunkText(text, 2000);

        // Process each chunk
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];

          // Generate embedding
          const embedding = await generateEmbedding(openAIClient, chunk);

          // Create document
          const document: Document = {
            id: `${blob.name}-chunk-${i}`,
            content: chunk,
            title: extractTitle(blob.name),
            metadata: {
              sourceType: 'blob-storage',
              fileName: blob.name,
              fileSize: blob.properties.contentLength || 0,
              uploadedAt: properties.createdOn?.toISOString() || new Date().toISOString(),
              processedAt: new Date().toISOString(),
              contentType: properties.contentType || 'unknown',
            },
            contentVector: embedding,
            updated_at: new Date().toISOString(),
          };

          // Upload to search index
          await searchClient.uploadDocuments([document]);
          context.log(`Uploaded document chunk: ${document.id}`);
        }

        // Mark as processed
        await blobClient.setMetadata({
          ...properties.metadata,
          processed: 'true',
          processedAt: new Date().toISOString(),
        });

        processedCount++;
      } catch (error) {
        context.error(`Error processing blob ${blob.name}:`, error);
        errorCount++;
      }
    }

    context.log(`Document processing complete. Processed: ${processedCount}, Errors: ${errorCount}`);
  } catch (error) {
    context.error('Document processor function failed:', error);
    throw error;
  }
}

/**
 * HTTP-triggered function for on-demand document processing
 */
export async function documentProcessorHttp(
  request: any,
  context: InvocationContext
): Promise<any> {
  context.log('HTTP document processor triggered');

  try {
    const fileName = request.query.get('fileName') || (await request.text());

    if (!fileName) {
      return {
        status: 400,
        body: JSON.stringify({
          error: 'fileName parameter required',
        }),
      };
    }

    const connectionString = process.env.STORAGE_CONNECTION_STRING!;
    const containerName = 'knowledge-documents';

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(fileName);

    // Check if blob exists
    const exists = await blobClient.exists();
    if (!exists) {
      return {
        status: 404,
        body: JSON.stringify({
          error: 'File not found',
        }),
      };
    }

    // Process the document
    const downloadResponse = await blobClient.download();
    const buffer = await streamToBuffer(downloadResponse.readableStreamBody!);
    const text = await extractText(buffer, fileName, context);

    if (!text || text.trim().length === 0) {
      return {
        status: 400,
        body: JSON.stringify({
          error: 'No text could be extracted from the document',
        }),
      };
    }

    const chunks = chunkText(text, 2000);
    const searchClient = getSearchClient();
    const openAIClient = getOpenAIClient();

    const documents: Document[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await generateEmbedding(openAIClient, chunk);

      const document: Document = {
        id: `${fileName}-chunk-${i}`,
        content: chunk,
        title: extractTitle(fileName),
        metadata: {
          sourceType: 'manual-upload',
          fileName,
          fileSize: buffer.length,
          uploadedAt: new Date().toISOString(),
          processedAt: new Date().toISOString(),
          contentType: 'unknown',
        },
        contentVector: embedding,
        updated_at: new Date().toISOString(),
      };

      documents.push(document);
    }

    await searchClient.uploadDocuments(documents);

    // Mark as processed
    const properties = await blobClient.getProperties();
    await blobClient.setMetadata({
      ...properties.metadata,
      processed: 'true',
      processedAt: new Date().toISOString(),
    });

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Document processed successfully',
        fileName,
        chunksCreated: documents.length,
        processedAt: new Date().toISOString(),
      }),
    };
  } catch (error) {
    context.error('Error processing document:', error);
    return {
      status: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}

// Helper functions

async function extractText(
  buffer: Buffer,
  fileName: string,
  context: InvocationContext
): Promise<string> {
  const extension = fileName.split('.').pop()?.toLowerCase();

  try {
    switch (extension) {
      case 'pdf':
        const pdfData = await pdf(buffer);
        return pdfData.text;

      case 'docx':
      case 'doc':
        const docResult = await mammoth.extractRawText({ buffer });
        return docResult.value;

      case 'txt':
      case 'md':
        return buffer.toString('utf-8');

      case 'html':
      case 'htm':
        // Basic HTML to text conversion
        return buffer.toString('utf-8').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

      default:
        context.warn(`Unsupported file type: ${extension}`);
        return buffer.toString('utf-8');
    }
  } catch (error) {
    context.error(`Error extracting text from ${fileName}:`, error);
    throw error;
  }
}

function chunkText(text: string, maxChunkSize: number): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);

  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }

      // If paragraph itself is too long, split by sentences
      if (paragraph.length > maxChunkSize) {
        const sentences = paragraph.split(/[.!?]+/);
        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length > maxChunkSize) {
            if (currentChunk.length > 0) {
              chunks.push(currentChunk.trim());
            }
            currentChunk = sentence;
          } else {
            currentChunk += sentence + '. ';
          }
        }
      } else {
        currentChunk = paragraph;
      }
    } else {
      currentChunk += '\n\n' + paragraph;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

function extractTitle(fileName: string): string {
  return fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

function getSearchClient(): SearchClient<Document> {
  return new SearchClient<Document>(
    process.env.AZURE_SEARCH_ENDPOINT!,
    process.env.AZURE_SEARCH_INDEX_NAME!,
    new AzureKeyCredential(process.env.AZURE_SEARCH_API_KEY!)
  );
}

function getOpenAIClient(): OpenAIClient {
  return new OpenAIClient(
    process.env.AZURE_OPENAI_ENDPOINT!,
    new OpenAIKeyCredential(process.env.AZURE_OPENAI_API_KEY!)
  );
}

async function generateEmbedding(client: OpenAIClient, text: string): Promise<number[]> {
  const embeddings = await client.getEmbeddings(
    process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-ada-002',
    [text]
  );
  return embeddings.data[0].embedding;
}

// Register functions
app.timer('documentProcessorTimer', {
  schedule: '0 */15 * * * *', // Every 15 minutes
  handler: documentProcessorTimer,
});

app.http('documentProcessorHttp', {
  methods: ['POST', 'GET'],
  authLevel: 'function',
  handler: documentProcessorHttp,
});

