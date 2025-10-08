# Local Development Guide - Free & No Azure Deployment

This guide shows you how to run the Knowledge Assistant entirely on your local machine for **FREE** without deploying to Azure.

## Quick Start (3 Steps)

1. **Set up local environment**
2. **Run with Docker Compose**
3. **Test the API**

## Prerequisites

Install these free tools:

```bash
# Required
- Node.js 18+ (free)
- Docker Desktop (free)
- Git (free)

# Optional but recommended
- Postman or curl (for API testing)
- VS Code (free)
```

## Option 1: Fully Local with Free Services (Recommended)

### Architecture

```
Local Machine
├── Backend API (Node.js) - Port 3000
├── Qdrant (Vector DB) - Port 6333 - FREE
├── Ollama (Local LLM) - Port 11434 - FREE
└── PostgreSQL (Optional) - Port 5432 - FREE
```

### Step 1: Install Ollama (Free Local LLM)

**macOS/Linux:**
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull a model (choose one)
ollama pull llama2          # 7B model, good for 16GB+ RAM
ollama pull mistral         # 7B model, faster
ollama pull phi             # 3B model, runs on 8GB RAM

# Test it
ollama run llama2
```

**Windows:**
Download from https://ollama.com/download/windows

### Step 2: Set Up Local Vector Database

We'll use **Qdrant** (free, open-source):

```bash
# Using Docker
docker run -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage:z \
    qdrant/qdrant
```

### Step 3: Create Local Environment Config

Create `.env.local`:

```bash
# Local Development Configuration
NODE_ENV=development
API_PORT=3000

# Local Ollama (FREE)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# Local Qdrant (FREE)
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=knowledge_base

# Disable Azure services
USE_AZURE=false
SKIP_AUTH=true

# Logging
LOG_LEVEL=debug
```

### Step 4: Install Local Backend

```bash
cd backend

# Install dependencies
npm install

# Create local-specific files
npm install ollama qdrant-client
```

### Step 5: Create Local RAG Service

Create `backend/src/services/localRagService.ts`:

```typescript
import { Ollama } from 'ollama';
import { QdrantClient } from '@qdrant/js-client-rest';

export class LocalRAGService {
  private ollama: Ollama;
  private qdrant: QdrantClient;
  
  constructor() {
    // Initialize Ollama (free local LLM)
    this.ollama = new Ollama({
      host: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
    });
    
    // Initialize Qdrant (free vector DB)
    this.qdrant = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://localhost:6333'
    });
  }

  async answerQuestion(question: string): Promise<any> {
    // 1. Generate embedding for question
    const embedding = await this.generateEmbedding(question);
    
    // 2. Search for similar documents
    const searchResults = await this.qdrant.search('knowledge_base', {
      vector: embedding,
      limit: 5,
      with_payload: true
    });
    
    // 3. Build context from results
    const context = searchResults.map(r => r.payload?.content).join('\n\n');
    
    // 4. Generate answer with Ollama
    const prompt = `Context:\n${context}\n\nQuestion: ${question}\n\nAnswer:`;
    
    const response = await this.ollama.generate({
      model: process.env.OLLAMA_MODEL || 'llama2',
      prompt: prompt,
      stream: false
    });
    
    return {
      answer: response.response,
      sources: searchResults.map(r => ({
        id: r.id,
        title: r.payload?.title,
        score: r.score
      })),
      confidence: searchResults[0]?.score || 0
    };
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.ollama.embeddings({
      model: 'nomic-embed-text', // Free embedding model
      prompt: text
    });
    return response.embedding;
  }

  async indexDocument(id: string, content: string, title: string) {
    const embedding = await this.generateEmbedding(content);
    
    await this.qdrant.upsert('knowledge_base', {
      points: [{
        id,
        vector: embedding,
        payload: { content, title }
      }]
    });
  }
}
```

### Step 6: Run Locally

```bash
# Terminal 1: Start Qdrant
docker run -p 6333:6333 qdrant/qdrant

# Terminal 2: Start Ollama (if not running as service)
ollama serve

# Terminal 3: Start Backend
cd backend
npm run dev

# The API is now running at http://localhost:3000
```

### Step 7: Test It

```bash
# Health check
curl http://localhost:3000/health

# Query (no auth in local mode)
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question":"What is the vacation policy?"}'
```

## Option 2: Docker Compose (Easiest)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # Vector Database (FREE)
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - ./qdrant_storage:/qdrant/storage
    environment:
      - QDRANT__SERVICE__HTTP_PORT=6333

  # Backend API
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - QDRANT_URL=http://qdrant:6333
      - OLLAMA_BASE_URL=http://host.docker.internal:11434
      - USE_AZURE=false
      - SKIP_AUTH=true
    depends_on:
      - qdrant
    volumes:
      - ./backend:/app
      - /app/node_modules

  # PostgreSQL (optional, for storing queries)
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=knowledge_assistant
      - POSTGRES_USER=dev
      - POSTGRES_PASSWORD=devpass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  qdrant_storage:
  postgres_data:
```

**Run everything:**

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

## Option 3: Using OpenAI Free Tier (Cloud, but Free Credits)

If you don't want to run a local LLM:

```bash
# Sign up at https://platform.openai.com
# Get $5 free credits (no credit card required for trial)

# .env.local
OPENAI_API_KEY=sk-your-free-key
USE_OPENAI=true
USE_AZURE=false
SKIP_AUTH=true
```

Update backend to use OpenAI instead of Azure OpenAI:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo", // Free tier
  messages: [{ role: "user", content: prompt }]
});
```

## Load Sample Data Locally

Create `scripts/load-local-data.ts`:

```typescript
import { LocalRAGService } from '../src/services/localRagService';
import * as fs from 'fs';

async function loadSampleData() {
  const ragService = new LocalRAGService();
  
  // Create collection
  await ragService.qdrant.createCollection('knowledge_base', {
    vectors: {
      size: 768, // nomic-embed-text dimension
      distance: 'Cosine'
    }
  });
  
  // Load sample documents
  const docs = JSON.parse(
    fs.readFileSync('./data-ingestion/sample-data/sample-documents.json', 'utf-8')
  );
  
  for (const doc of docs) {
    console.log(`Indexing: ${doc.title}`);
    await ragService.indexDocument(doc.id, doc.content, doc.title);
  }
  
  console.log('✅ Sample data loaded!');
}

loadSampleData();
```

Run it:

```bash
npm run load-data
```

## Local Development Workflow

```bash
# 1. Start services
docker-compose up -d

# 2. Install and run backend
cd backend
npm install
npm run dev

# 3. Load sample data
npm run load-data

# 4. Test queries
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question":"How do I submit expenses?"}'

# 5. Make changes and test
# Hot reload is enabled with nodemon

# 6. Stop when done
docker-compose down
```

## Testing Without Power Platform

You can test the API directly:

### Using Postman

1. Import this collection:

```json
{
  "info": { "name": "Knowledge Assistant Local" },
  "item": [
    {
      "name": "Query",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/query",
        "body": {
          "mode": "raw",
          "raw": "{\"question\":\"What is the vacation policy?\"}"
        }
      }
    }
  ]
}
```

### Using curl

```bash
# Health check
curl http://localhost:3000/health

# Submit query
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How do I submit expense reimbursements?"
  }'

# Batch queries
curl -X POST http://localhost:3000/api/query/batch \
  -H "Content-Type: application/json" \
  -d '{
    "questions": [
      "What is the vacation policy?",
      "How do I reset my password?"
    ]
  }'
```

### Using a Simple Web UI

Create `test-ui.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Knowledge Assistant Test</title>
  <style>
    body { font-family: Arial; max-width: 800px; margin: 50px auto; }
    textarea { width: 100%; height: 100px; }
    button { padding: 10px 20px; background: #0078D4; color: white; border: none; cursor: pointer; }
    #response { margin-top: 20px; padding: 20px; background: #f5f5f5; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>🤖 Knowledge Assistant</h1>
  <textarea id="question" placeholder="Ask a question..."></textarea>
  <button onclick="askQuestion()">Ask</button>
  <div id="response"></div>

  <script>
    async function askQuestion() {
      const question = document.getElementById('question').value;
      const responseDiv = document.getElementById('response');
      
      responseDiv.innerHTML = 'Thinking...';
      
      try {
        const response = await fetch('http://localhost:3000/api/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question })
        });
        
        const data = await response.json();
        
        responseDiv.innerHTML = `
          <h3>Answer:</h3>
          <p>${data.answer}</p>
          <h4>Sources:</h4>
          <ul>
            ${data.sources.map(s => `<li>${s.title} (${Math.round(s.score * 100)}%)</li>`).join('')}
          </ul>
          <p><strong>Confidence:</strong> ${data.confidence}%</p>
        `;
      } catch (error) {
        responseDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
      }
    }
  </script>
</body>
</html>
```

Open `test-ui.html` in your browser.

## Cost Comparison

| Service | Azure (Deployed) | Local (Dev) |
|---------|------------------|-------------|
| OpenAI | $500-1000/mo | FREE (Ollama) |
| Vector DB | $250/mo | FREE (Qdrant) |
| App Service | $150/mo | FREE (localhost) |
| Functions | $50/mo | FREE (local scripts) |
| Storage | $20/mo | FREE (disk) |
| **Total** | **~$1000/mo** | **$0** |

## Limitations of Local Setup

- No Power Platform integration (need Azure)
- Smaller LLM models (less capable than GPT-4)
- No auto-scaling
- No production monitoring
- No SSO authentication
- Single machine performance

## When to Deploy to Azure

Consider deploying when you need:
- Multi-user access
- Production reliability
- GPT-4 quality responses
- Power Platform integration
- Enterprise security
- Auto-scaling
- 24/7 availability

## Next Steps

Once you're ready to deploy:

1. Test locally first
2. Review `docs/DEPLOYMENT.md`
3. Deploy to Azure (free trial available)
4. Use Azure's free tier services initially

## Troubleshooting

### Ollama not responding
```bash
# Check if running
curl http://localhost:11434

# Restart
ollama serve
```

### Qdrant connection error
```bash
# Check if running
docker ps | grep qdrant

# Restart
docker restart <qdrant-container-id>
```

### Port already in use
```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>
```

## Resources

- Ollama: https://ollama.com
- Qdrant: https://qdrant.tech
- Docker: https://docker.com
- OpenAI Free Tier: https://platform.openai.com

## Summary

✅ **100% FREE** local development
✅ No Azure deployment needed
✅ No credit card required
✅ Full RAG capabilities
✅ Test everything locally
✅ Deploy to Azure when ready

