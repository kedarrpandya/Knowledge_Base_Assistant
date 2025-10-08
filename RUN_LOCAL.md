# 🏠 Run Local Development Version

This is the **100% FREE** local development setup with no cloud costs!

## 📋 Prerequisites

- Node.js 20+ installed
- Docker Desktop installed and running
- 8GB RAM minimum
- 20GB free disk space

## 🚀 Quick Start (Automated)

### One-Command Setup

```bash
./local/quick-start.sh
```

This automated script will:
1. Check all prerequisites
2. Start Docker services (Qdrant, PostgreSQL)
3. Install Ollama
4. Pull the Llama model
5. Install backend dependencies
6. Load sample data
7. Provide next steps

**⏱️ Total time: 5-10 minutes**

---

## 🔧 Manual Setup (Alternative)

If you prefer manual control:

### 1. Start Docker Services

```bash
cd local
docker compose -f docker-compose.local.yml up -d

# Verify services are running
docker compose -f docker-compose.local.yml ps
```

**Services started:**
- Qdrant (Vector DB): http://localhost:6333
- PostgreSQL: localhost:5432

### 2. Install & Configure Ollama

```bash
# Install Ollama (macOS)
brew install ollama

# Start Ollama service
ollama serve

# Pull the model (in a new terminal)
ollama pull llama2
```

### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install axios dotenv express cors @qdrant/js-client groq-sdk

# Create environment file
cat > .env.local << 'EOF'
# Groq Configuration (FREE)
GROQ_API_KEY=your_groq_key_here

# Qdrant Configuration
QDRANT_URL=http://localhost:6333

# Ollama Configuration
OLLAMA_URL=http://localhost:11434

PORT=3000
EOF

# Get your free Groq API key from: https://console.groq.com
# Then update .env.local with your key
```

### 4. Load Sample Data

```bash
cd backend
npx ts-node local/scripts/load-local-data.ts
```

### 5. Start Backend

```bash
cd backend
npx ts-node local/backend/index-local.ts
```

**Backend running at:** http://localhost:3000

### 6. Start Frontend

```bash
# Open new terminal
cd frontend

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

**Frontend running at:** http://localhost:5173

---

## 🎯 Quick Commands Reference

### Start Everything

```bash
# Terminal 1: Docker Services
cd local && docker compose -f docker-compose.local.yml up

# Terminal 2: Ollama (if not running as service)
ollama serve

# Terminal 3: Backend
cd backend && npx ts-node local/backend/index-local.ts

# Terminal 4: Frontend
cd frontend && npm run dev
```

### Stop Everything

```bash
# Stop frontend & backend: Ctrl+C in their terminals

# Stop Docker services
cd local && docker compose -f docker-compose.local.yml down

# Stop Ollama
# Ctrl+C in Ollama terminal
```

### Check Service Health

```bash
# Backend health
curl http://localhost:3000/health

# Qdrant health
curl http://localhost:6333/healthz

# Ollama health
curl http://localhost:11434/api/tags
```

---

## 📦 What's Running Locally?

| Service | Port | Purpose | Cost |
|---------|------|---------|------|
| **Backend** | 3000 | API Server | FREE |
| **Frontend** | 5173 | React UI | FREE |
| **Qdrant** | 6333 | Vector Database | FREE |
| **PostgreSQL** | 5432 | Data Storage | FREE |
| **Ollama** | 11434 | Local LLM | FREE |
| **Groq API** | - | Fast Cloud LLM | FREE (15 RPM) |

**Total Monthly Cost: $0.00** 💰

---

## 🎨 Features You'll Have

✅ **AI-Powered Responses** - Sub-2-second answers via Groq  
✅ **Vector Search** - Semantic search with Qdrant  
✅ **Beautiful UI** - Apple Liquid Glass theme  
✅ **Interactive 3D** - Torus knot, planet, 600 stars  
✅ **Physics Animations** - 150 particles, 15 floating spheres  
✅ **Fully Local** - No cloud dependencies  
✅ **No Costs** - 100% free forever  

---

## 🔍 Troubleshooting

### Docker Won't Start

```bash
# Check if Docker Desktop is running
docker ps

# If not, start Docker Desktop app
open -a Docker

# Wait 30 seconds, then retry
```

### Ollama Not Found

```bash
# Install Ollama
brew install ollama

# Or download from: https://ollama.ai/download
```

### Backend Connection Errors

```bash
# Check if all services are running
docker compose -f local/docker-compose.local.yml ps
curl http://localhost:6333/healthz
curl http://localhost:11434/api/tags

# Restart services if needed
docker compose -f local/docker-compose.local.yml restart
```

### "No documents found"

```bash
# Reload sample data
cd backend
npx ts-node local/scripts/load-local-data.ts
```

### Port Already in Use

```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env.local
PORT=3001
```

---

## 🆕 Add Your Own Documents

### Method 1: Via API

```bash
curl -X POST http://localhost:3000/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Your Document Title",
    "content": "Your document content here...",
    "metadata": {
      "source": "custom",
      "date": "2025-01-08"
    }
  }'
```

### Method 2: Via Script

```typescript
// local/scripts/add-documents.ts
import { LocalRAGService } from '../backend/services/localRagService';

const ragService = new LocalRAGService();

await ragService.indexDocument({
  id: 'custom-1',
  title: 'My Document',
  content: 'Document content...'
});
```

```bash
npx ts-node local/scripts/add-documents.ts
```

---

## 🚀 Performance Tips

### Speed Up Responses

1. **Use Groq** (already configured) - 1-2 second responses
2. **Increase Qdrant memory**: Edit `docker-compose.local.yml`:
   ```yaml
   qdrant:
     environment:
       QDRANT__STORAGE__CACHE_SIZE: 1GB  # Increase from 512MB
   ```
3. **Use smaller Ollama model** (fallback only):
   ```bash
   ollama pull llama2:7b  # Faster than llama2:13b
   ```

### Reduce Resource Usage

```bash
# Stop unused services
docker compose -f local/docker-compose.local.yml stop postgres

# Limit container memory
docker compose -f local/docker-compose.local.yml up -d --scale qdrant=1
```

---

## 📊 Monitor Performance

### View Logs

```bash
# Backend logs
# Shown in terminal where backend is running

# Docker logs
docker compose -f local/docker-compose.local.yml logs -f

# Qdrant logs
docker compose -f local/docker-compose.local.yml logs qdrant
```

### Check Qdrant Collections

```bash
# List collections
curl http://localhost:6333/collections

# Get collection info
curl http://localhost:6333/collections/knowledge-base

# Count vectors
curl http://localhost:6333/collections/knowledge-base/points/count
```

---

## 🎓 Next Steps

1. **Try Sample Questions**:
   - "What is the vacation policy?"
   - "How do I submit expenses?"
   - "What are IT security best practices?"

2. **Add Your Own Documents**: Use the methods above

3. **Customize UI**: Edit `frontend/src/components/*`

4. **Adjust AI Behavior**: Modify system prompts in `local/backend/services/groqRagService.ts`

---

## 📚 Additional Resources

- [Groq Documentation](https://console.groq.com/docs)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [Ollama Documentation](https://github.com/ollama/ollama)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)

---

## 💡 Pro Tips

- Keep Docker Desktop running for best performance
- Groq has 15 requests/min limit (upgrade for more)
- Qdrant stores data in Docker volumes (persists between restarts)
- Frontend hot-reloads automatically on code changes

---

**Enjoy your FREE, fully local Knowledge Assistant!** 🎉

No cloud costs. No complexity. Just AI-powered answers in stunning UI.

