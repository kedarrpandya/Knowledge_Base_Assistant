# 🏢 Run Enterprise (Azure) Version

This is the **production-ready Azure deployment** with Microsoft Power Platform integration.

## 📋 Prerequisites

- Azure Account with active subscription
- Azure CLI installed
- Node.js 20+
- npm or yarn

## 🚀 Quick Start

### 1. Setup Azure Resources

```bash
# Login to Azure
az login

# Set your subscription
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Deploy infrastructure (choose one)
cd enterprise/infrastructure

# Option A: Using Terraform
terraform init
terraform plan
terraform apply

# Option B: Using ARM templates
az deployment group create \
  --resource-group knowledge-assistant-rg \
  --template-file main.bicep
```

### 2. Configure Environment Variables

```bash
# Copy and edit environment file
cp enterprise/backend/.env.example enterprise/backend/.env

# Required variables:
# AZURE_OPENAI_ENDPOINT=https://your-openai.openai.azure.com/
# AZURE_OPENAI_KEY=your-key-here
# AZURE_SEARCH_ENDPOINT=https://your-search.search.windows.net
# AZURE_SEARCH_KEY=your-key-here
# AZURE_SEARCH_INDEX=knowledge-base
```

### 3. Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 4. Run Backend (Azure Mode)

```bash
cd backend
npm start
# Backend runs on http://localhost:3000
```

### 5. Run Frontend

```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

## 🔧 Development Commands

```bash
# Backend
cd backend
npm run dev          # Development mode with hot reload
npm run build        # Build for production
npm run lint         # Run linter
npm test            # Run tests

# Frontend
cd frontend
npm run dev         # Development mode
npm run build       # Build for production
npm run preview     # Preview production build
```

## 🚢 Deploy to Azure

### Deploy Backend (Azure Functions)

```bash
cd backend
npm run build
az functionapp deployment source config-zip \
  --resource-group knowledge-assistant-rg \
  --name your-function-app-name \
  --src dist.zip
```

### Deploy Frontend (Azure Static Web Apps)

```bash
cd frontend
npm run build

# Deploy using Azure CLI
az staticwebapp create \
  --name knowledge-assistant-frontend \
  --resource-group knowledge-assistant-rg \
  --source dist/ \
  --location "eastus2"
```

## 🔐 Security Configuration

### Setup Azure AD Authentication

```bash
# Register app in Azure AD
az ad app create --display-name "Knowledge Assistant"

# Configure authentication
# Add redirect URIs, configure API permissions
```

### Configure DLP Policies

1. Go to Power Platform Admin Center
2. Create DLP policies for your environment
3. Configure data connectors and restrictions

## 📊 Monitoring & Analytics

### Application Insights

```bash
# View logs
az monitor app-insights query \
  --resource-group knowledge-assistant-rg \
  --app your-app-insights-name \
  --analytics-query "traces | where timestamp > ago(1h)"
```

### Power Platform Analytics

1. Go to Power Platform Admin Center
2. Navigate to Analytics > Power Apps
3. View usage metrics and performance data

## 🔍 Troubleshooting

### Check Backend Health

```bash
curl http://localhost:3000/health
# Should return: {"status":"healthy","timestamp":"..."}
```

### View Azure Logs

```bash
# Function App logs
az functionapp log tail \
  --name your-function-app-name \
  --resource-group knowledge-assistant-rg

# Application Insights
az monitor app-insights component show \
  --app your-app-insights-name \
  --resource-group knowledge-assistant-rg
```

## 📚 Additional Resources

- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/cognitive-services/openai/)
- [Power Platform Documentation](https://learn.microsoft.com/en-us/power-platform/)
- [Azure Functions Documentation](https://learn.microsoft.com/en-us/azure/azure-functions/)

## 💰 Cost Estimation

Typical monthly costs for production:
- Azure OpenAI: $50-500 (usage-based)
- Azure Cognitive Search: $75-300
- Azure Functions: $0-50
- Azure Static Web Apps: $0-10
- **Total: ~$125-860/month**

## 🆘 Support

For issues with:
- Azure services: Contact Azure Support
- Power Platform: Contact Microsoft Power Platform Support
- Application bugs: Create an issue in the repository

---

**Note**: This is the full enterprise version with all Azure services and Power Platform integrations.

