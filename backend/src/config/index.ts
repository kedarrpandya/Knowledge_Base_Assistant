import dotenv from 'dotenv';

dotenv.config();

interface Config {
  nodeEnv: string;
  port: number;
  
  // Azure OpenAI
  azureOpenAI: {
    endpoint: string;
    apiKey: string;
    deploymentName: string;
    apiVersion: string;
    embeddingDeploymentName: string;
  };
  
  // Azure Cognitive Search
  azureSearch: {
    endpoint: string;
    apiKey: string;
    indexName: string;
  };
  
  // Azure Key Vault
  keyVault: {
    uri: string;
  };
  
  // Azure AD / OAuth2
  azureAd: {
    tenantId: string;
    clientId: string;
    clientSecret: string;
    audience: string;
  };
  
  // Application Insights
  applicationInsights: {
    connectionString: string;
  };
  
  // API Configuration
  corsOrigins: string[];
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  
  // RAG Configuration
  rag: {
    topK: number;
    maxTokens: number;
    temperature: number;
    minRelevanceScore: number;
  };
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const config: Config = {
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  port: parseInt(getEnvVar('API_PORT', '3000'), 10),
  
  azureOpenAI: {
    endpoint: getEnvVar('AZURE_OPENAI_ENDPOINT'),
    apiKey: getEnvVar('AZURE_OPENAI_API_KEY', ''),
    deploymentName: getEnvVar('AZURE_OPENAI_DEPLOYMENT_NAME', 'gpt-4'),
    apiVersion: getEnvVar('AZURE_OPENAI_API_VERSION', '2024-02-15-preview'),
    embeddingDeploymentName: getEnvVar('AZURE_OPENAI_EMBEDDING_DEPLOYMENT', 'text-embedding-ada-002'),
  },
  
  azureSearch: {
    endpoint: getEnvVar('AZURE_SEARCH_ENDPOINT'),
    apiKey: getEnvVar('AZURE_SEARCH_API_KEY', ''),
    indexName: getEnvVar('AZURE_SEARCH_INDEX_NAME', 'enterprise-knowledge-index'),
  },
  
  keyVault: {
    uri: getEnvVar('AZURE_KEY_VAULT_URI', ''),
  },
  
  azureAd: {
    tenantId: getEnvVar('AZURE_AD_TENANT_ID', ''),
    clientId: getEnvVar('AZURE_AD_CLIENT_ID', ''),
    clientSecret: getEnvVar('AZURE_AD_CLIENT_SECRET', ''),
    audience: getEnvVar('AZURE_AD_AUDIENCE', ''),
  },
  
  applicationInsights: {
    connectionString: getEnvVar('APPLICATIONINSIGHTS_CONNECTION_STRING', ''),
  },
  
  corsOrigins: (getEnvVar('CORS_ORIGINS', 'http://localhost:3000')).split(','),
  
  rateLimit: {
    windowMs: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS', '60000'), 10),
    maxRequests: parseInt(getEnvVar('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
  },
  
  rag: {
    topK: parseInt(getEnvVar('RAG_TOP_K', '5'), 10),
    maxTokens: parseInt(getEnvVar('RAG_MAX_TOKENS', '1500'), 10),
    temperature: parseFloat(getEnvVar('RAG_TEMPERATURE', '0.3')),
    minRelevanceScore: parseFloat(getEnvVar('RAG_MIN_RELEVANCE_SCORE', '0.7')),
  },
};

