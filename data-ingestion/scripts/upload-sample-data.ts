import { SearchClient, AzureKeyCredential } from '@azure/search-documents';
import { OpenAIClient, AzureKeyCredential as OpenAIKeyCredential } from '@azure/openai';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const indexName = process.env.AZURE_SEARCH_INDEX_NAME || 'enterprise-knowledge-index';
const searchEndpoint = process.env.AZURE_SEARCH_ENDPOINT!;
const searchApiKey = process.env.AZURE_SEARCH_API_KEY!;
const openaiEndpoint = process.env.AZURE_OPENAI_ENDPOINT!;
const openaiApiKey = process.env.AZURE_OPENAI_API_KEY!;
const embeddingDeployment = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-ada-002';

async function main() {
  console.log('Uploading sample data to Azure Cognitive Search...');

  // Load sample data
  const sampleDataPath = path.join(__dirname, '../sample-data/sample-documents.json');
  const sampleData = JSON.parse(fs.readFileSync(sampleDataPath, 'utf-8'));

  console.log(`Loaded ${sampleData.length} sample documents`);

  // Initialize clients
  const searchClient = new SearchClient(
    searchEndpoint,
    indexName,
    new AzureKeyCredential(searchApiKey)
  );

  const openaiClient = new OpenAIClient(
    openaiEndpoint,
    new OpenAIKeyCredential(openaiApiKey)
  );

  console.log('Generating embeddings and uploading documents...');

  const documents = [];

  for (const doc of sampleData) {
    console.log(`Processing: ${doc.title}`);

    try {
      // Generate embedding for the content
      const embeddings = await openaiClient.getEmbeddings(embeddingDeployment, [doc.content]);
      const contentVector = embeddings.data[0].embedding;

      // Prepare document for upload
      const searchDoc = {
        id: doc.id,
        content: doc.content,
        title: doc.title,
        metadata: {
          ...doc.metadata,
          sourceType: 'sample-data',
          uploadedAt: new Date().toISOString(),
          processedAt: new Date().toISOString(),
        },
        contentVector,
        updated_at: new Date().toISOString(),
      };

      documents.push(searchDoc);
      console.log(`✓ Processed: ${doc.title}`);
    } catch (error) {
      console.error(`✗ Error processing ${doc.title}:`, error);
    }
  }

  // Upload all documents
  console.log(`\nUploading ${documents.length} documents to search index...`);
  
  try {
    const result = await searchClient.uploadDocuments(documents);
    console.log(`Upload complete!`);
    console.log(`- Successful: ${result.results.filter(r => r.succeeded).length}`);
    console.log(`- Failed: ${result.results.filter(r => !r.succeeded).length}`);

    // Show any errors
    const failures = result.results.filter(r => !r.succeeded);
    if (failures.length > 0) {
      console.log('\nFailures:');
      failures.forEach(f => {
        console.log(`- ${f.key}: ${f.errorMessage}`);
      });
    }

    console.log('\nSample data uploaded successfully!');
    console.log('You can now test the RAG API with queries like:');
    console.log('- "How do I submit expense reimbursements?"');
    console.log('- "What are the IT security best practices?"');
    console.log('- "Tell me about the onboarding process"');
  } catch (error) {
    console.error('Error uploading documents:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

