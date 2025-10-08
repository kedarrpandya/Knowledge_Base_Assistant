import { app, InvocationContext, Timer } from '@azure/functions';
import { SearchClient, AzureKeyCredential } from '@azure/search-documents';
import { OpenAIClient, AzureKeyCredential as OpenAIKeyCredential } from '@azure/openai';
import axios from 'axios';

interface SharePointDocument {
  id: string;
  title: string;
  content: string;
  webUrl: string;
  lastModified: string;
  author: string;
}

/**
 * Timer-triggered function to sync SharePoint documents
 * Runs daily at 2 AM
 */
export async function sharepointSyncTimer(
  myTimer: Timer,
  context: InvocationContext
): Promise<void> {
  context.log('SharePoint sync function started');

  try {
    const siteUrl = process.env.SHAREPOINT_SITE_URL;
    const libraryName = process.env.SHAREPOINT_LIBRARY_NAME || 'Documents';

    if (!siteUrl) {
      context.warn('SharePoint site URL not configured. Skipping sync.');
      return;
    }

    // Get access token
    const accessToken = await getSharePointAccessToken();

    // Fetch documents from SharePoint
    const documents = await fetchSharePointDocuments(siteUrl, libraryName, accessToken, context);

    context.log(`Fetched ${documents.length} documents from SharePoint`);

    // Process and index documents
    const searchClient = getSearchClient();
    const openAIClient = getOpenAIClient();

    let processedCount = 0;
    let errorCount = 0;

    for (const doc of documents) {
      try {
        // Check if document was updated since last sync
        const lastSyncDate = await getLastSyncDate(doc.id);
        if (lastSyncDate && new Date(doc.lastModified) <= lastSyncDate) {
          context.log(`Skipping unchanged document: ${doc.title}`);
          continue;
        }

        // Chunk the content
        const chunks = chunkText(doc.content, 2000);

        // Process each chunk
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];

          // Generate embedding
          const embedding = await generateEmbedding(openAIClient, chunk);

          // Create search document
          const searchDoc = {
            id: `sharepoint-${doc.id}-chunk-${i}`,
            content: chunk,
            title: doc.title,
            metadata: {
              sourceType: 'sharepoint',
              webUrl: doc.webUrl,
              author: doc.author,
              lastModified: doc.lastModified,
              processedAt: new Date().toISOString(),
            },
            contentVector: embedding,
            updated_at: new Date().toISOString(),
          };

          // Upload to search index
          await searchClient.uploadDocuments([searchDoc]);
        }

        // Update last sync date
        await updateLastSyncDate(doc.id, new Date());

        processedCount++;
        context.log(`Processed SharePoint document: ${doc.title}`);
      } catch (error) {
        context.error(`Error processing document ${doc.title}:`, error);
        errorCount++;
      }
    }

    context.log(`SharePoint sync complete. Processed: ${processedCount}, Errors: ${errorCount}`);
  } catch (error) {
    context.error('SharePoint sync function failed:', error);
    throw error;
  }
}

// Helper functions

async function getSharePointAccessToken(): Promise<string> {
  const tenantId = process.env.AZURE_AD_TENANT_ID!;
  const clientId = process.env.AZURE_AD_CLIENT_ID!;
  const clientSecret = process.env.AZURE_AD_CLIENT_SECRET!;
  const resource = 'https://graph.microsoft.com';

  const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const response = await axios.post(
    tokenEndpoint,
    new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: `${resource}/.default`,
      grant_type: 'client_credentials',
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data.access_token;
}

async function fetchSharePointDocuments(
  siteUrl: string,
  libraryName: string,
  accessToken: string,
  context: InvocationContext
): Promise<SharePointDocument[]> {
  const documents: SharePointDocument[] = [];

  try {
    // Use Microsoft Graph API to fetch SharePoint documents
    const graphEndpoint = `https://graph.microsoft.com/v1.0/sites/${siteUrl}/lists/${libraryName}/items?expand=fields`;

    const response = await axios.get(graphEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    for (const item of response.data.value) {
      const fields = item.fields;

      // Fetch document content
      const contentUrl = `https://graph.microsoft.com/v1.0/sites/${siteUrl}/drive/items/${item.id}/content`;
      const contentResponse = await axios.get(contentUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: 'text',
      });

      documents.push({
        id: item.id,
        title: fields.Title || fields.Name || 'Untitled',
        content: contentResponse.data,
        webUrl: fields.FileRef || '',
        lastModified: fields.Modified || new Date().toISOString(),
        author: fields.Author?.LookupValue || 'Unknown',
      });
    }
  } catch (error) {
    context.error('Error fetching SharePoint documents:', error);
    throw error;
  }

  return documents;
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

function getSearchClient(): SearchClient<any> {
  return new SearchClient(
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

async function getLastSyncDate(documentId: string): Promise<Date | null> {
  // In production, retrieve from a database or table storage
  // For now, return null to always process
  return null;
}

async function updateLastSyncDate(documentId: string, date: Date): Promise<void> {
  // In production, store in a database or table storage
  // For now, this is a no-op
}

// Register function
app.timer('sharepointSyncTimer', {
  schedule: '0 0 2 * * *', // Daily at 2 AM
  handler: sharepointSyncTimer,
});

