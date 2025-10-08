#!/bin/bash

# Knowledge Assistant - Quick Start Script (Local Development)
# This script sets up everything you need to run locally for FREE

set -e

echo "🚀 Knowledge Assistant - Local Development Setup"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is not installed"
        return 1
    fi
}

MISSING=0

check_command "node" || MISSING=1
check_command "npm" || MISSING=1
check_command "docker" || MISSING=1
check_command "curl" || MISSING=1

if [ $MISSING -eq 1 ]; then
    echo ""
    echo -e "${RED}Error: Missing prerequisites. Please install:${NC}"
    echo "  - Node.js 18+: https://nodejs.org"
    echo "  - Docker Desktop: https://docker.com"
    exit 1
fi

# Check for Ollama
echo ""
if ! check_command "ollama"; then
    echo -e "${YELLOW}⚠ Ollama not found${NC}"
    echo "Installing Ollama for local LLM..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        curl -fsSL https://ollama.com/install.sh | sh
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://ollama.com/install.sh | sh
    else
        echo "Please install Ollama manually from: https://ollama.com"
        exit 1
    fi
fi

echo ""
echo "📦 Step 1: Starting Docker services (Qdrant)..."

# Try docker compose (new) or docker-compose (old)
if docker compose version &> /dev/null; then
    docker compose -f docker-compose.local.yml up -d
else
    docker-compose -f docker-compose.local.yml up -d
fi

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if Qdrant is running
if curl -s http://localhost:6333/health > /dev/null; then
    echo -e "${GREEN}✓${NC} Qdrant is running"
else
    echo -e "${RED}✗${NC} Qdrant failed to start"
    exit 1
fi

echo ""
echo "🤖 Step 2: Setting up Ollama..."

# Start Ollama service
if [[ "$OSTYPE" == "darwin"* ]]; then
    # On macOS, Ollama runs as a service
    echo "Ollama service starting..."
else
    # On Linux, start as background process
    ollama serve > /dev/null 2>&1 &
    sleep 3
fi

# Pull model if not exists
if ! ollama list | grep -q "llama2"; then
    echo "Downloading Llama 2 model (this may take a few minutes)..."
    ollama pull llama2
else
    echo -e "${GREEN}✓${NC} Llama 2 model already downloaded"
fi

# Pull embedding model
if ! ollama list | grep -q "nomic-embed-text"; then
    echo "Downloading embedding model..."
    ollama pull nomic-embed-text
else
    echo -e "${GREEN}✓${NC} Embedding model already downloaded"
fi

echo ""
echo "📄 Step 3: Setting up backend..."
cd backend

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    cat > .env.local << EOF
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
EOF
    echo -e "${GREEN}✓${NC} Created .env.local"
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    npm install ollama @qdrant/js-client-rest
else
    echo -e "${GREEN}✓${NC} Dependencies already installed"
fi

echo ""
echo "📚 Step 4: Loading sample data..."

# Create load-data script
cat > scripts/load-local-data.ts << 'EOF'
import { LocalRAGService } from '../src/services/localRagService';
import * as fs from 'fs';
import * as path from 'path';

async function loadSampleData() {
  try {
    const ragService = new LocalRAGService();
    
    // Wait for service to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const dataPath = path.join(__dirname, '../../data-ingestion/sample-data/sample-documents.json');
    
    if (!fs.existsSync(dataPath)) {
      console.log('Sample data not found, creating basic documents...');
      const basicDocs = [
        {
          id: 'doc-1',
          title: 'Vacation Policy',
          content: 'Employees receive 15 days of paid vacation per year. Vacation must be requested at least 2 weeks in advance through the HR portal.'
        },
        {
          id: 'doc-2',
          title: 'Expense Reimbursement',
          content: 'To submit expenses, use the Finance Portal within 30 days. Attach receipts for expenses over $25. Manager approval is required.'
        },
        {
          id: 'doc-3',
          title: 'IT Security',
          content: 'Use strong passwords, enable MFA, and report suspicious emails to security@company.com. Never share your credentials.'
        }
      ];
      
      for (const doc of basicDocs) {
        console.log(\`Indexing: \${doc.title}\`);
        await ragService.indexDocument(doc.id, doc.content, doc.title);
      }
    } else {
      const docs = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      
      for (const doc of docs) {
        console.log(\`Indexing: \${doc.title}\`);
        await ragService.indexDocument(doc.id, doc.content, doc.title);
      }
    }
    
    console.log('✅ Sample data loaded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error loading data:', error);
    process.exit(1);
  }
}

loadSampleData();
EOF

mkdir -p scripts
npx ts-node scripts/load-local-data.ts

cd ..

echo ""
echo "================================================"
echo -e "${GREEN}✅ Setup complete!${NC}"
echo "================================================"
echo ""
echo "🎉 Your Knowledge Assistant is ready!"
echo ""
echo "To start the server:"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "Then test it:"
echo "  curl -X POST http://localhost:3000/api/query \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"question\":\"What is the vacation policy?\"}'"
echo ""
echo "Or open test-ui.html in your browser"
echo ""
echo "To stop services:"
echo "  docker compose -f docker-compose.local.yml down"
echo ""
echo "Documentation: LOCAL_DEVELOPMENT.md"
echo ""

