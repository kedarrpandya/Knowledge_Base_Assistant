import { SearchIndexClient, AzureKeyCredential, SearchIndex } from '@azure/search-documents';
import * as dotenv from 'dotenv';

dotenv.config();

const indexName = process.env.AZURE_SEARCH_INDEX_NAME || 'enterprise-knowledge-index';
const endpoint = process.env.AZURE_SEARCH_ENDPOINT!;
const apiKey = process.env.AZURE_SEARCH_API_KEY!;

/**
 * Define the search index schema for enterprise knowledge documents
 */
const indexSchema: SearchIndex = {
  name: indexName,
  fields: [
    {
      name: 'id',
      type: 'Edm.String',
      key: true,
      searchable: false,
      filterable: true,
      sortable: false,
    },
    {
      name: 'content',
      type: 'Edm.String',
      searchable: true,
      filterable: false,
      sortable: false,
      analyzerName: 'en.microsoft',
    },
    {
      name: 'title',
      type: 'Edm.String',
      searchable: true,
      filterable: true,
      sortable: true,
      facetable: false,
    },
    {
      name: 'metadata',
      type: 'Edm.ComplexType',
      fields: [
        {
          name: 'sourceType',
          type: 'Edm.String',
          searchable: false,
          filterable: true,
          facetable: true,
        },
        {
          name: 'fileName',
          type: 'Edm.String',
          searchable: true,
          filterable: true,
        },
        {
          name: 'category',
          type: 'Edm.String',
          searchable: false,
          filterable: true,
          facetable: true,
        },
        {
          name: 'department',
          type: 'Edm.String',
          searchable: false,
          filterable: true,
          facetable: true,
        },
        {
          name: 'author',
          type: 'Edm.String',
          searchable: true,
          filterable: true,
        },
        {
          name: 'fileSize',
          type: 'Edm.Int64',
          searchable: false,
          filterable: true,
          sortable: true,
        },
        {
          name: 'uploadedAt',
          type: 'Edm.DateTimeOffset',
          searchable: false,
          filterable: true,
          sortable: true,
        },
        {
          name: 'processedAt',
          type: 'Edm.DateTimeOffset',
          searchable: false,
          filterable: true,
          sortable: true,
        },
        {
          name: 'contentType',
          type: 'Edm.String',
          searchable: false,
          filterable: true,
          facetable: true,
        },
      ],
    },
    {
      name: 'updated_at',
      type: 'Edm.DateTimeOffset',
      searchable: false,
      filterable: true,
      sortable: true,
    },
    {
      name: 'contentVector',
      type: 'Collection(Edm.Single)',
      searchable: true,
      dimensions: 1536, // text-embedding-ada-002 dimensions
      vectorSearchProfile: 'vector-profile',
    },
  ],
  scoringProfiles: [
    {
      name: 'relevanceBoost',
      text: {
        weights: {
          title: 3.0,
          content: 1.0,
        },
      },
    },
  ],
  suggesters: [
    {
      name: 'sg-titles',
      sourceFields: ['title'],
    },
  ],
  vectorSearch: {
    algorithms: [
      {
        name: 'vector-algorithm',
        kind: 'hnsw',
        hnswParameters: {
          metric: 'cosine',
          m: 4,
          efConstruction: 400,
          efSearch: 500,
        },
      },
    ],
    profiles: [
      {
        name: 'vector-profile',
        algorithm: 'vector-algorithm',
      },
    ],
  },
  semantic: {
    configurations: [
      {
        name: 'default',
        prioritizedFields: {
          titleField: {
            fieldName: 'title',
          },
          contentFields: [
            {
              fieldName: 'content',
            },
          ],
        },
      },
    ],
  },
};

async function main() {
  console.log('Initializing Azure Cognitive Search index...');
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Index name: ${indexName}`);

  const client = new SearchIndexClient(endpoint, new AzureKeyCredential(apiKey));

  try {
    // Check if index exists
    console.log('Checking if index exists...');
    try {
      await client.getIndex(indexName);
      console.log(`Index '${indexName}' already exists.`);
      
      const response = await promptUser('Do you want to delete and recreate it? (yes/no): ');
      if (response.toLowerCase() === 'yes') {
        console.log('Deleting existing index...');
        await client.deleteIndex(indexName);
        console.log('Index deleted.');
      } else {
        console.log('Keeping existing index. Exiting.');
        return;
      }
    } catch (error) {
      console.log('Index does not exist. Creating new index...');
    }

    // Create the index
    console.log('Creating index with schema...');
    const result = await client.createIndex(indexSchema);
    console.log(`Index '${result.name}' created successfully!`);
    
    console.log('\nIndex details:');
    console.log(`- Fields: ${result.fields.length}`);
    console.log(`- Vector search enabled: Yes`);
    console.log(`- Semantic search enabled: Yes`);
    console.log(`- Scoring profiles: ${result.scoringProfiles?.length || 0}`);

    console.log('\nNext steps:');
    console.log('1. Upload sample data using: npm run upload-sample-data');
    console.log('2. Start the data ingestion function');
    console.log('3. Test the search functionality');
  } catch (error) {
    console.error('Error initializing search index:', error);
    throw error;
  }
}

function promptUser(question: string): Promise<string> {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    readline.question(question, (answer: string) => {
      readline.close();
      resolve(answer);
    });
  });
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

