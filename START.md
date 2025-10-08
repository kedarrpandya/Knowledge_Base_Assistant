# 🚀 Knowledge Assistant - Getting Started

Choose your deployment mode:

## 🏠 Local Development (FREE)

**Perfect for**: Development, Testing, Learning  
**Cost**: $0/month  
**Setup Time**: 5-10 minutes

```bash
./local/quick-start.sh
```

📖 **Full Instructions**: [RUN_LOCAL.md](./RUN_LOCAL.md)

---

## 🏢 Enterprise (Azure)

**Perfect for**: Production, Enterprise Scale  
**Cost**: ~$125-860/month  
**Setup Time**: 30-60 minutes

📖 **Full Instructions**: [RUN_ENTERPRISE.md](./RUN_ENTERPRISE.md)

---

## 📁 Project Structure

```
Knowledge_Assistant/
├── frontend/              # React UI (shared by both)
│   ├── src/
│   │   ├── components/   # UI components
│   │   └── App.tsx       # Main app
│   └── package.json
│
├── backend/              # Core backend code (shared)
│   ├── src/
│   │   ├── index.ts     # Enterprise entry point
│   │   ├── models/      # Data models
│   │   └── services/    # Business logic
│   └── package.json
│
├── local/                # Local development files
│   ├── backend/         # Local-specific backend
│   │   ├── index-local.ts
│   │   ├── groqRagService.ts
│   │   └── localRagService.ts
│   ├── scripts/         # Local scripts
│   ├── docker-compose.local.yml
│   ├── quick-start.sh
│   └── README.md
│
├── enterprise/           # Enterprise/Azure files
│   ├── backend/         # Azure-specific config
│   ├── infrastructure/  # Terraform/ARM templates
│   └── power-platform/  # Power Platform exports
│
├── RUN_LOCAL.md         # Local setup guide
├── RUN_ENTERPRISE.md    # Azure setup guide
└── START.md             # This file
```

---

## ⚡ Quick Commands

### Local Development

```bash
# One-command setup
./local/quick-start.sh

# Start backend
cd backend && npx ts-node ../local/backend/index-local.ts

# Start frontend
cd frontend && npm run dev

# Stop services
docker compose -f local/docker-compose.local.yml down
```

### Enterprise/Azure

```bash
# Deploy infrastructure
cd enterprise/infrastructure
terraform apply

# Start backend (Azure mode)
cd backend && npm start

# Start frontend
cd frontend && npm run dev

# Deploy to Azure
npm run deploy:azure
```

---

## 🎯 What You Get

### Local Version ✅
- ⚡ Sub-2-second AI responses (Groq)
- 🔍 Vector search (Qdrant)
- 🎨 Beautiful Apple Liquid Glass UI
- 🌌 Interactive 3D animations
- 🔒 100% private (no cloud)
- 💰 $0 cost forever

### Enterprise Version ✅
- 🏢 Azure OpenAI (GPT-4)
- 🔍 Azure Cognitive Search
- 🔐 Azure AD authentication
- 📊 Application Insights
- ⚖️ DLP policies
- 🤖 Power Platform integration
- 🌍 Global CDN
- 📈 Auto-scaling

---

## 🆘 Need Help?

- **Local Setup Issues**: See [RUN_LOCAL.md](./RUN_LOCAL.md) - Troubleshooting section
- **Azure Setup Issues**: See [RUN_ENTERPRISE.md](./RUN_ENTERPRISE.md) - Troubleshooting section
- **UI Questions**: Check `local/INTERACTIVE_FEATURES.md`

---

## 🎓 Recommended Path

1. **Start with Local** (5 minutes)
   - Get familiar with the UI
   - Test AI responses
   - Understand the features

2. **Move to Enterprise** (when ready)
   - Scale to production
   - Add authentication
   - Enable monitoring

---

**Ready to start?** 

Choose your mode above and follow the guide! 🚀

