# 📂 Project Structure Overview

## 🎯 Quick Reference

| Mode | Entry Command | Backend Port | Frontend Port |
|------|--------------|--------------|---------------|
| **Local** | `./local/quick-start.sh` | 3000 | 5173 |
| **Enterprise** | `cd backend && npm start` | 3000 | 5173 |

---

## 📁 Folder Organization

### ✅ Local Development Files

```
local/
├── backend/
│   ├── index-local.ts          ← Run: npx ts-node ../local/backend/index-local.ts
│   ├── groqRagService.ts       ← Groq API integration (fast!)
│   └── localRagService.ts      ← Ollama + Qdrant integration
│
├── scripts/
│   └── load-local-data.ts      ← Run: npx ts-node local/scripts/load-local-data.ts
│
├── docker-compose.local.yml    ← Run: docker compose -f local/docker-compose.local.yml up -d
├── quick-start.sh              ← Run: ./local/quick-start.sh
├── README.md
├── INTERACTIVE_FEATURES.md
└── FAST_SETUP.md
```

**Services:**
- Qdrant (Vector DB): `http://localhost:6333`
- PostgreSQL: `localhost:5432`
- Ollama: `http://localhost:11434`
- Groq: Via API (remote)

---

### 🏢 Enterprise Files

```
enterprise/
├── backend/
│   └── (Azure-specific configurations)
│
├── infrastructure/
│   ├── terraform/              ← Infrastructure as Code
│   ├── arm-templates/          ← ARM templates
│   └── bicep/                  ← Bicep templates
│
└── power-platform/
    ├── power-apps/             ← Power Apps exports
    ├── power-automate/         ← Power Automate flows
    └── power-virtual-agents/   ← Bot configurations
```

**Services:**
- Azure OpenAI
- Azure Cognitive Search
- Azure Functions
- Azure Static Web Apps
- Application Insights
- Azure AD

---

### 🌐 Shared Files

```
frontend/                       ← Works with BOTH modes
├── src/
│   ├── components/
│   │   ├── Scene3D.tsx         ← Torus knot + Planet
│   │   ├── StarConstellation.tsx ← 600 stars
│   │   ├── NetworkBackground.tsx ← 150 particles
│   │   ├── ChatMessage.tsx
│   │   └── ChatInput.tsx
│   ├── App.tsx                 ← Main app
│   └── index.css               ← Liquid Glass styles
├── package.json
└── vite.config.ts

backend/                        ← Core business logic
├── src/
│   ├── index.ts                ← Enterprise entry point
│   ├── models/                 ← Data models
│   ├── services/               ← Business logic
│   └── utils/                  ← Helper functions
└── package.json
```

**API Endpoint:**
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

---

## 🔄 How It Works

### Local Mode Flow

```
User Browser
    ↓
Frontend (React)
    ↓ API Call
Backend (local/backend/index-local.ts)
    ↓
groqRagService.ts → Groq API (cloud) → Fast LLM response
    ↓
localRagService.ts → Qdrant (local) → Vector search
    ↓
Ollama (local) → Fallback LLM if Groq fails
```

### Enterprise Mode Flow

```
User Browser
    ↓
Frontend (React) → Azure Static Web Apps
    ↓ API Call
Backend (Azure Functions)
    ↓
Azure OpenAI Service → GPT-4
    ↓
Azure Cognitive Search → Vector search
    ↓
Azure AD → Authentication
    ↓
Application Insights → Monitoring
```

---

## 🎯 File Locations Quick Reference

| What You Need | File Location |
|--------------|---------------|
| **Run Local** | `./local/quick-start.sh` |
| **Local Backend** | `backend/` then run `npx ts-node ../local/backend/index-local.ts` |
| **Local Data** | `npx ts-node local/scripts/load-local-data.ts` |
| **Local Services** | `docker compose -f local/docker-compose.local.yml up -d` |
| **Frontend** | `cd frontend && npm run dev` |
| **Enterprise Backend** | `cd backend && npm start` |
| **Local Docs** | `local/README.md` |
| **Enterprise Docs** | `RUN_ENTERPRISE.md` |
| **Interactive Features** | `local/INTERACTIVE_FEATURES.md` |

---

## 📝 Configuration Files

| File | Purpose | Location |
|------|---------|----------|
| `.env.local` | Local environment variables | Project root |
| `.env` | Enterprise environment variables | Project root |
| `docker-compose.local.yml` | Local services | `local/` |
| `package.json` | Frontend deps | `frontend/` |
| `package.json` | Backend deps | `backend/` |
| `vite.config.ts` | Frontend build | `frontend/` |
| `tsconfig.json` | TypeScript config | Project root |
| `tailwind.config.js` | Tailwind CSS | `frontend/` |

---

## 🚀 Common Commands

### Local Development

```bash
# 1. Initial Setup (one time)
./local/quick-start.sh

# 2. Start Docker services
docker compose -f local/docker-compose.local.yml up -d

# 3. Start backend
cd backend
npx ts-node ../local/backend/index-local.ts

# 4. Start frontend (new terminal)
cd frontend
npm run dev

# 5. Stop Docker services (when done)
docker compose -f local/docker-compose.local.yml down
```

### Enterprise Development

```bash
# 1. Deploy infrastructure
cd enterprise/infrastructure
terraform init
terraform apply

# 2. Start backend
cd backend
npm start

# 3. Start frontend
cd frontend
npm run dev

# 4. Deploy to Azure
npm run deploy:azure
```

---

## 🔍 Debugging

### Check Local Services

```bash
# Backend health
curl http://localhost:3000/health

# Qdrant health
curl http://localhost:6333/healthz

# Ollama health
curl http://localhost:11434/api/tags

# Check Docker containers
docker compose -f local/docker-compose.local.yml ps

# View Docker logs
docker compose -f local/docker-compose.local.yml logs
```

### Check Enterprise Services

```bash
# Azure Function health
curl https://your-function.azurewebsites.net/api/health

# View Azure logs
az functionapp log tail --name your-function --resource-group your-rg

# Check Application Insights
az monitor app-insights query --app your-app --analytics-query "traces"
```

---

## 📊 Port Usage

| Service | Port | Mode |
|---------|------|------|
| Backend API | 3000 | Both |
| Frontend Dev | 5173 | Both |
| Qdrant | 6333 | Local |
| PostgreSQL | 5432 | Local |
| Ollama | 11434 | Local |

---

## 🎨 UI Components Map

```
App.tsx
├── NetworkBackground (Layer -10)
│   └── 150 particles + connections
├── StarConstellation (Layer -9)
│   └── 600 stars + 15 physics spheres
├── Scene3D (Layer -8)
│   ├── Torus Knot (center)
│   └── Planet (far right)
├── Header
│   ├── Logo
│   └── Title
├── ChatMessages
│   └── ChatMessage[]
└── ChatInput
    ├── Sample Questions
    └── Input Form
```

---

## 💡 Tips

### Local Development
- Keep Docker Desktop running
- Groq API: 15 requests/min free tier
- Qdrant data persists in Docker volumes
- Frontend hot-reloads on changes

### Enterprise Development
- Use Azure CLI for deployments
- Monitor costs in Azure Portal
- Set up budget alerts
- Use Application Insights for debugging

---

**Next Steps:**
1. Read [START.md](./START.md)
2. Choose your mode
3. Follow the guide
4. Build amazing things!

