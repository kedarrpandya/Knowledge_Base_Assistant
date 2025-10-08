#!/bin/bash

# Knowledge Assistant - Local Development Quick Start
# Run from project root: ./local/quick-start.sh

set -e  # Exit on error

echo "🚀 Knowledge Assistant - Local Setup"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script and project directories
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

cd "$PROJECT_ROOT"

echo -e "${GREEN}✓${NC} Running from project root: $PROJECT_ROOT"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found${NC}"
    echo "Please install Node.js 20+ from https://nodejs.org"
    exit 1
fi
echo -e "${GREEN}✓${NC} Node.js $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} npm $(npm --version)"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker not found${NC}"
    echo "Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker daemon is running
if ! docker ps &> /dev/null; then
    echo -e "${RED}✗ Docker daemon is not running${NC}"
    echo "Please start Docker Desktop and try again"
    exit 1
fi
echo -e "${GREEN}✓${NC} Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"

echo ""

# Step 1: Start Docker services
echo -e "${YELLOW}Step 1/7: Starting Docker services...${NC}"
docker compose -f local/docker-compose.local.yml up -d

echo -e "${GREEN}✓${NC} Docker services started"
echo -e "  - Qdrant (Vector DB): http://localhost:6333"
echo -e "  - PostgreSQL: localhost:5432"
echo ""

# Wait for services
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 5

# Check Qdrant
for i in {1..30}; do
    if curl -s http://localhost:6333/healthz > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Qdrant is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ Qdrant failed to start${NC}"
        exit 1
    fi
    sleep 1
done
echo ""

# Step 2: Check/Install Ollama
echo -e "${YELLOW}Step 2/7: Checking Ollama installation...${NC}"
if ! command -v ollama &> /dev/null; then
    echo -e "${YELLOW}Ollama not found. Installing...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install ollama
        else
            echo -e "${RED}Please install Homebrew first: https://brew.sh${NC}"
            exit 1
        fi
    else
        curl -fsSL https://ollama.ai/install.sh | sh
    fi
fi
echo -e "${GREEN}✓${NC} Ollama installed"
echo ""

# Step 3: Start Ollama service
echo -e "${YELLOW}Step 3/7: Starting Ollama service...${NC}"
# Check if ollama is already running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo -e "${YELLOW}Starting Ollama in background...${NC}"
    nohup ollama serve > /tmp/ollama.log 2>&1 &
    sleep 3
fi
echo -e "${GREEN}✓${NC} Ollama service is running"
echo ""

# Step 4: Pull Ollama model
echo -e "${YELLOW}Step 4/7: Checking Llama2 model...${NC}"
if ! ollama list | grep -q llama2; then
    echo -e "${YELLOW}Downloading llama2 model (this may take a few minutes)...${NC}"
    ollama pull llama2
fi
echo -e "${GREEN}✓${NC} Llama2 model ready"
echo ""

# Step 5: Create .env.local if it doesn't exist
echo -e "${YELLOW}Step 5/7: Setting up environment...${NC}"
if [ ! -f .env.local ]; then
    cat > .env.local << 'EOF'
# Groq Configuration (Get your free key from https://console.groq.com)
GROQ_API_KEY=your_groq_key_here

# Qdrant Configuration
QDRANT_URL=http://localhost:6333

# Ollama Configuration  
OLLAMA_URL=http://localhost:11434

PORT=3000
EOF
    echo -e "${YELLOW}⚠ Created .env.local - Please add your GROQ_API_KEY${NC}"
    echo -e "   Get a free key from: ${GREEN}https://console.groq.com${NC}"
fi
echo -e "${GREEN}✓${NC} Environment configured"
echo ""

# Step 6: Install backend dependencies
echo -e "${YELLOW}Step 6/7: Installing backend dependencies...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi
# Install additional local dependencies
npm install axios dotenv express cors @qdrant/js-client groq-sdk
echo -e "${GREEN}✓${NC} Backend dependencies installed"
cd ..
echo ""

# Step 7: Load sample data
echo -e "${YELLOW}Step 7/7: Loading sample data into Qdrant...${NC}"
cd backend
npx ts-node ../local/scripts/load-local-data.ts
cd ..
echo -e "${GREEN}✓${NC} Sample data loaded"
echo ""

# Done!
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

echo -e "${GREEN}🎯 NEXT STEPS:${NC}"
echo ""
echo -e "1. ${YELLOW}Add your Groq API key${NC} (if you haven't):"
echo -e "   Edit .env.local and add your key from https://console.groq.com"
echo ""
echo -e "2. ${YELLOW}Start the backend:${NC}"
echo -e "   cd backend && npx ts-node ../local/backend/index-local.ts"
echo ""
echo -e "3. ${YELLOW}In a new terminal, start the frontend:${NC}"
echo -e "   cd frontend && npm install && npm run dev"
echo ""
echo -e "4. ${YELLOW}Open your browser:${NC}"
echo -e "   http://localhost:5173"
echo ""
echo -e "5. ${YELLOW}When done, stop Docker services:${NC}"
echo -e "   docker compose -f local/docker-compose.local.yml down"
echo ""
echo -e "${GREEN}Enjoy your FREE Knowledge Assistant! 🎉${NC}"
