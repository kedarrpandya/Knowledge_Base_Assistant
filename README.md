#  Enterprise Knowledge Assistant - Demo: https://knowledge-assistant-v1.vercel.app/

**AI-powered knowledge base with RAG (Retrieval Augmented Generation)**

Beautiful Apple Liquid Glass UI · Interactive 3D Graphics · Sub-2-second Responses

---

## 🚀 Two Deployment Modes

### 🏠 Local Development (FREE)
Perfect for development, testing, and personal use.

```bash
./local/quick-start.sh
```

**Features:**
- ✅ 100% Free forever
- ✅ No cloud costs
- ✅ Groq API (15 req/min free tier)
- ✅ Local Qdrant vector database
- ✅ Ollama for local LLM fallback
- ✅ Complete privacy

📖 [Local Setup Guide](./RUN_LOCAL.md)

---

### 🏢 Enterprise (Azure)
Production-ready with Microsoft Power Platform integration.

**Features:**
- ✅ Azure OpenAI (GPT-4+)
- ✅ Azure Cognitive Search
- ✅ Power Platform integration
- ✅ Azure AD authentication
- ✅ Application Insights
- ✅ DLP policies
- ✅ Global CDN
- ✅ Auto-scaling

📖 [Enterprise Setup Guide](./RUN_ENTERPRISE.md)

**Cost:** ~$125-860/month

---

## 🎨 Features

### Beautiful UI

- **Apple Liquid Glass Theme** - Frosted glass aesthetic
- **Solid Black Background** - White/smoke graphics
- **Interactive 3D Elements**:
  - Mobius strip (torus knot) in center
  - Realistic planet with axial tilt on far right
  - 600 physics-based constellation stars
  - 150 network particles
  - 15 floating physics spheres

### AI-Powered Responses

- **Sub-2-second responses** (Groq in local mode)
- **Semantic search** with vector embeddings
- **Source citations** with confidence scores
- **Context-aware answers** using RAG

### Interactive Animations

- **All mouse-responsive** - Everything follows your cursor
- **Realistic physics** - Proper gravity, collisions, orbits
- **Smooth 60 FPS animations**
- **Hover effects** on all 3D elements

---

## 📁 Project Structure

```
Knowledge_Assistant/
│
├── 📄 START.md                    ← START HERE
├── 📄 RUN_LOCAL.md                ← Local setup guide  
├── 📄 RUN_ENTERPRISE.md           ← Enterprise setup guide
│
├── 📁 frontend/                   ← React UI (shared)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Scene3D.tsx       ← Torus knot + Planet
│   │   │   ├── StarConstellation.tsx  ← 600 stars + physics
│   │   │   ├── NetworkBackground.tsx  ← 150 particles
│   │   │   ├── ChatMessage.tsx
│   │   │   └── ChatInput.tsx
│   │   ├── App.tsx
│   │   └── index.css             ← Liquid Glass styles
│   ├── package.json
│   └── vite.config.ts
│
├── 📁 backend/                    ← Core backend (shared)
│   ├── src/
│   │   ├── index.ts              ← Enterprise entry point
│   │   ├── models/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
│
├── 📁 local/                      ← Local development
│   ├── backend/
│   │   ├── index-local.ts        ← Local server
│   │   ├── groqRagService.ts     ← Groq integration
│   │   └── localRagService.ts    ← Ollama + Qdrant
│   ├── scripts/
│   │   └── load-local-data.ts    ← Sample data loader
│   ├── docker-compose.local.yml  ← Qdrant + PostgreSQL
│   ├── quick-start.sh            ← Automated setup
│   ├── README.md
│   └── INTERACTIVE_FEATURES.md
│
└── 📁 enterprise/                 ← Enterprise/Azure
    ├── backend/
    ├── infrastructure/            ← Terraform/ARM templates
    └── power-platform/            ← Power Apps/Automate
```

---

## ⚡ Quick Start

### Option 1: Local (Recommended for First Time)

```bash
# Run automated setup
./local/quick-start.sh

# Start backend (Terminal 1)
cd backend && npx ts-node ../local/backend/index-local.ts

# Start frontend (Terminal 2)
cd frontend && npm run dev

# Open browser
# http://localhost:5173
```

### Option 2: Enterprise

```bash
# See RUN_ENTERPRISE.md for full instructions
cd enterprise/infrastructure
terraform apply

cd ../../backend
npm start
```

---

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite 5 (build tool)
- Tailwind CSS 3
- React Three Fiber (3D graphics)
- @react-three/drei (3D helpers)
- @react-three/cannon (physics)
- Framer Motion (animations)
- Axios (API calls)
- Lucide React (icons)

### Backend - Local
- Node.js + Express
- TypeScript
- Groq SDK (fast LLM)
- Qdrant Client (vector DB)
- Ollama (local LLM fallback)

### Backend - Enterprise
- Azure Functions
- Azure OpenAI Service
- Azure Cognitive Search
- Power Platform
- Application Insights

### Infrastructure - Local
- Docker Compose
- Qdrant (vector database)
- PostgreSQL (optional)
- Ollama (local LLM)

### Infrastructure - Enterprise
- Azure (cloud platform)
- Terraform/ARM (IaC)
- Azure AD (authentication)
- Azure Monitor (observability)

---

## 📊 Performance

### Local Mode
- **Response Time**: 1-2 seconds (Groq)
- **Search Latency**: <100ms (Qdrant)
- **UI Frame Rate**: 60 FPS
- **Memory Usage**: ~2GB RAM
- **Disk Usage**: ~5GB (includes models)

### Enterprise Mode
- **Response Time**: 2-5 seconds (Azure OpenAI)
- **Search Latency**: <200ms (Azure Cognitive Search)
- **Concurrent Users**: 1000+
- **Availability**: 99.9% SLA
- **Global CDN**: <50ms latency worldwide

---

## 🎯 Use Cases

### Local Mode Perfect For:
- Personal knowledge management
- Learning and experimentation
- Privacy-sensitive documents
- Offline work
- Development and testing

### Enterprise Mode Perfect For:
- Corporate knowledge bases
- Customer support systems
- Document management
- Compliance-required scenarios
- Large-scale deployments
- Power Platform integration

---

## 🔐 Security

### Local Mode
- ✅ All data stays on your machine
- ✅ No cloud uploads
- ✅ Local encryption
- ✅ No telemetry

### Enterprise Mode
- ✅ Azure AD authentication
- ✅ Role-based access control (RBAC)
- ✅ Data Loss Prevention (DLP)
- ✅ Encryption at rest and in transit
- ✅ Compliance certifications (SOC 2, ISO 27001)
- ✅ Audit logs

---

## 📈 Roadmap

- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Mobile app
- [ ] More 3D space elements (asteroids, nebulae)
- [ ] Custom knowledge base connectors
- [ ] Advanced analytics dashboard
- [ ] RAG optimization tools

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🆘 Support

### Local Mode Issues
- See [RUN_LOCAL.md](./RUN_LOCAL.md) troubleshooting section
- Check Docker is running
- Verify Groq API key is set

### Enterprise Mode Issues
- See [RUN_ENTERPRISE.md](./RUN_ENTERPRISE.md) troubleshooting section
- Check Azure resource status
- Review Application Insights logs

### General Questions
- Open an issue on GitHub
- Check existing documentation
- Review interactive features guide

---

## 🎓 Learn More

- [Interactive Features Guide](./local/INTERACTIVE_FEATURES.md)
- [Fast Setup Options](./local/FAST_SETUP.md)
- [Local Development Guide](./RUN_LOCAL.md)
- [Enterprise Deployment Guide](./RUN_ENTERPRISE.md)

---

## 🌟 Highlights

- **Beautiful Design** - Apple Liquid Glass aesthetic
- **Fast Responses** - Sub-2-second AI answers
- **Interactive 3D** - Realistic physics and animations
- **Flexible Deployment** - Local or Enterprise
- **Free Option** - Complete local setup at $0/month
- **Production Ready** - Enterprise Azure deployment

---

**Ready to start?** 

📖 Read [START.md](./START.md) for next steps!

---

Made with ❤️ for developers who want beautiful AI interfaces
