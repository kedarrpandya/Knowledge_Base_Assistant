# Enterprise Knowledge Assistant - Deployment Guide

## Prerequisites

Before deploying the Knowledge Assistant, ensure you have:

### Required Access
- Azure subscription with Owner or Contributor role
- Azure AD admin access
- Power Platform environment admin access
- GitHub or Azure DevOps account

### Required Tools
- Azure CLI 2.50+
- Terraform 1.5+
- Node.js 18+
- npm 9+
- Git
- PowerShell 7+ (for Azure AD setup)

### Azure Services Quota
Verify you have quota for:
- Azure OpenAI Service (GPT-4 access)
- Cognitive Search (Standard tier)
- App Service (P1v3 tier)
- Azure Functions

## Deployment Steps

### Phase 1: Azure Infrastructure

#### 1.1 Clone Repository
```bash
git clone <repository-url>
cd Knowledge_Assistant
```

#### 1.2 Configure Environment Variables
```bash
cp .env.example .env
# Edit .env with your values
```

Required variables:
```bash
AZURE_SUBSCRIPTION_ID=<your-subscription-id>
AZURE_TENANT_ID=<your-tenant-id>
AZURE_LOCATION=eastus
AZURE_RESOURCE_GROUP=knowledge-assistant-rg
```

#### 1.3 Azure Login
```bash
az login
az account set --subscription <your-subscription-id>
```

#### 1.4 Create Terraform Backend Storage
```bash
# Create storage account for Terraform state
az group create --name terraform-state-rg --location eastus

az storage account create \
  --name tfstateknowledgeassist \
  --resource-group terraform-state-rg \
  --location eastus \
  --sku Standard_LRS

az storage container create \
  --name tfstate \
  --account-name tfstateknowledgeassist
```

#### 1.5 Deploy Infrastructure with Terraform
```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Copy and edit variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# Plan deployment
terraform plan -out=tfplan

# Review plan, then apply
terraform apply tfplan
```

Expected deployment time: 15-20 minutes

#### 1.6 Capture Outputs
```bash
# Save important outputs
terraform output > outputs.txt
terraform output -json > outputs.json

# Display configuration
terraform output configuration_yaml
```

#### 1.7 Request Azure OpenAI GPT-4 Access
If you don't have GPT-4 access:
1. Go to Azure portal
2. Navigate to your OpenAI resource
3. Request GPT-4 access
4. Wait for approval (can take 1-2 days)

### Phase 2: Azure AD Configuration

#### 2.1 Create App Registration
```bash
cd security/aad-config

# Run setup script
pwsh setup-aad.ps1 \
  -TenantId <your-tenant-id> \
  -SubscriptionId <your-subscription-id> \
  -AppName "Enterprise Knowledge Assistant API"
```

#### 2.2 Save Client Credentials
The script outputs:
- Application (Client) ID
- Client Secret
- Tenant ID

**IMPORTANT**: Save the client secret immediately - it cannot be retrieved later!

#### 2.3 Add to Key Vault
```bash
# Get Key Vault name from Terraform outputs
KV_NAME=$(terraform output -raw key_vault_uri | cut -d'/' -f3 | cut -d'.' -f1)

# Store AAD credentials
az keyvault secret set \
  --vault-name $KV_NAME \
  --name "aad-client-id" \
  --value "<client-id>"

az keyvault secret set \
  --vault-name $KV_NAME \
  --name "aad-client-secret" \
  --value "<client-secret>"
```

### Phase 3: Initialize Search Index

#### 3.1 Create Search Index
```bash
cd data-ingestion/scripts

# Install dependencies
npm install

# Set environment variables
export AZURE_SEARCH_ENDPOINT=<from-terraform-output>
export AZURE_SEARCH_API_KEY=<from-key-vault>
export AZURE_SEARCH_INDEX_NAME=enterprise-knowledge-index

# Run initialization
npm run init-index
```

#### 3.2 Upload Sample Data
```bash
# Set OpenAI credentials
export AZURE_OPENAI_ENDPOINT=<from-terraform-output>
export AZURE_OPENAI_API_KEY=<from-key-vault>

# Upload sample documents
npm run upload-sample-data
```

Verify in Azure portal:
1. Navigate to Cognitive Search resource
2. Go to Indexes
3. Check `enterprise-knowledge-index` has documents

### Phase 4: Backend API Deployment

#### 4.1 Build Backend
```bash
cd backend

# Install dependencies
npm ci

# Run tests
npm test

# Build
npm run build
```

#### 4.2 Configure App Settings
```bash
# Get Web App name from Terraform outputs
WEBAPP_NAME=$(terraform output -raw api_url | cut -d'/' -f3 | cut -d'.' -f1)
RESOURCE_GROUP=$(terraform output -raw resource_group_name)

# Get secrets from Key Vault
OPENAI_KEY=$(az keyvault secret show \
  --vault-name $KV_NAME \
  --name openai-api-key \
  --query value -o tsv)

SEARCH_KEY=$(az keyvault secret show \
  --vault-name $KV_NAME \
  --name search-api-key \
  --query value -o tsv)

# Set app settings
az webapp config appsettings set \
  --name $WEBAPP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    AZURE_OPENAI_API_KEY="$OPENAI_KEY" \
    AZURE_SEARCH_API_KEY="$SEARCH_KEY" \
    AZURE_AD_CLIENT_ID="<from-step-2.2>" \
    AZURE_AD_CLIENT_SECRET="<from-step-2.2>" \
    NODE_ENV="production"
```

#### 4.3 Deploy to Azure
```bash
# Create deployment package
zip -r deploy.zip dist node_modules package.json

# Deploy
az webapp deployment source config-zip \
  --resource-group $RESOURCE_GROUP \
  --name $WEBAPP_NAME \
  --src deploy.zip
```

#### 4.4 Verify Deployment
```bash
# Health check
curl https://$WEBAPP_NAME.azurewebsites.net/health

# Expected response:
# {"status":"healthy","timestamp":"...","version":"1.0.0"}
```

### Phase 5: Data Ingestion Functions

#### 5.1 Deploy Azure Functions
```bash
cd data-ingestion/azure-functions

# Install dependencies
npm install

# Build
npm run build

# Create deployment package
func azure functionapp publish <function-app-name>
```

#### 5.2 Configure Function App Settings
```bash
FUNC_APP_NAME=$(terraform output -raw function_app_name)

az functionapp config appsettings set \
  --name $FUNC_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    AZURE_OPENAI_API_KEY="$OPENAI_KEY" \
    AZURE_SEARCH_API_KEY="$SEARCH_KEY" \
    STORAGE_CONNECTION_STRING="<from-key-vault>"
```

#### 5.3 Test Functions
```bash
# Trigger document processor manually
func azure functionapp invoke $FUNC_APP_NAME \
  --function-name documentProcessorHttp \
  --method POST \
  --data '{"fileName":"test-document.pdf"}'
```

### Phase 6: Power Platform Setup

#### 6.1 Create Custom Connector
1. Go to [Power Automate](https://make.powerautomate.com)
2. Select your environment
3. Go to Data > Custom connectors > New custom connector
4. Import from OpenAPI
5. Configure:
   - Host: `<your-webapp>.azurewebsites.net`
   - Base URL: `/api`
6. Configure OAuth 2.0 security with Azure AD
7. Test connector

#### 6.2 Deploy Power Virtual Agent
1. Go to [Power Virtual Agents](https://make.powerva.microsoft.com)
2. Create new bot: "Enterprise Knowledge Assistant"
3. Import topics from `power-platform/bot-export/bot-schema.json`
4. Connect to custom connector
5. Test bot in Test Bot panel
6. Publish bot

#### 6.3 Configure Bot Channels
**Microsoft Teams:**
1. In bot settings, go to Channels
2. Enable Microsoft Teams
3. Copy bot App ID
4. Add to your Teams tenant

**Web Chat:**
1. Enable Web Chat channel
2. Copy embed code
3. Add to internal portal

#### 6.4 Deploy Power Automate Flow
1. Import `power-platform/flows/ServiceNowTicketCreation.json`
2. Configure connections:
   - Office 365 Users
   - ServiceNow (if available)
   - Teams
3. Configure parameters
4. Test flow
5. Turn on flow

#### 6.5 Deploy Power App Dashboard
1. Go to [Power Apps](https://make.powerapps.com)
2. Create new canvas app (Tablet format)
3. Follow instructions in `power-platform/canvas-app/README.md`
4. Connect to custom connector
5. Test app
6. Share with admin group
7. Publish app

### Phase 7: Security Configuration

#### 7.1 Configure DLP Policies
1. Go to [Power Platform Admin Center](https://admin.powerplatform.microsoft.com)
2. Navigate to Data Policies
3. Create new policy: "Knowledge Assistant DLP"
4. Add connectors to appropriate groups (Business/Non-Business/Blocked)
5. Apply to environments

#### 7.2 Assign App Roles
```bash
# Get service principal object ID
SP_OBJECT_ID=$(az ad sp list \
  --display-name "Enterprise Knowledge Assistant API" \
  --query [0].id -o tsv)

# Assign users to roles
az ad app user add \
  --id <app-registration-id> \
  --user-id <user-object-id> \
  --role-id <admin-role-id>
```

#### 7.3 Enable Private Endpoints (Optional)
```bash
# For production, enable private endpoints
terraform apply \
  -var="enable_private_endpoints=true" \
  -var="allowed_ip_addresses=[]"
```

### Phase 8: Monitoring & Alerting

#### 8.1 Configure Application Insights Alerts
```bash
# Create alert for high error rate
az monitor metrics alert create \
  --name "High Error Rate" \
  --resource-group $RESOURCE_GROUP \
  --scopes $(terraform output -raw application_insights_id) \
  --condition "avg requests/failed > 5" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action $(terraform output -raw action_group_id)
```

#### 8.2 Import KQL Queries
1. Go to Application Insights in Azure portal
2. Navigate to Logs
3. Import queries from `monitoring/app-insights/queries.kql`
4. Pin important queries to dashboard

#### 8.3 Create Azure Dashboard
1. Create new dashboard: "Knowledge Assistant Monitoring"
2. Add tiles:
   - Request volume
   - Error rate
   - Response time
   - Token usage
   - Active users
3. Share with operations team

### Phase 9: CI/CD Setup

#### Option A: GitHub Actions

1. Add repository secrets:
   ```
   AZURE_CREDENTIALS
   ARM_CLIENT_ID
   ARM_CLIENT_SECRET
   ARM_SUBSCRIPTION_ID
   ARM_TENANT_ID
   AZURE_WEBAPP_NAME
   TEST_AUTH_TOKEN
   ```

2. Workflows are in `.github/workflows/` (if using GitHub)
   Copy from `ci-cd/github-actions/` to `.github/workflows/`

3. Push to main branch to trigger deployment

#### Option B: Azure DevOps

1. Create new project in Azure DevOps
2. Import repository
3. Create variable group: `knowledge-assistant-vars`
4. Add pipeline: `ci-cd/azure-pipelines/azure-pipelines.yml`
5. Configure service connections
6. Run pipeline

### Phase 10: Verification & Testing

#### 10.1 End-to-End Testing
```bash
# Test query endpoint
curl -X POST https://$WEBAPP_NAME.azurewebsites.net/api/query \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"question":"How do I submit expenses?"}'
```

#### 10.2 Load Testing
```bash
cd tests/load-tests

# Install k6
brew install k6  # macOS

# Run load test
k6 run --vus 10 --duration 2m load-test.js
```

#### 10.3 Security Testing
- Run Azure Security Center scan
- Review RBAC assignments
- Test authentication flows
- Verify API key rotation works

#### 10.4 User Acceptance Testing
1. Invite pilot users
2. Provide training
3. Collect feedback
4. Iterate on bot topics

## Post-Deployment Tasks

### 1. Documentation
- Document all credentials (in secure location)
- Create runbook for operations team
- Document escalation procedures

### 2. Training
- Train administrators
- Train support team
- Create user documentation

### 3. Communication
- Announce to organization
- Provide onboarding materials
- Set up support channels

### 4. Monitoring
- Set up monitoring dashboard
- Configure alerts
- Establish SLAs

## Rollback Procedure

If deployment fails:

```bash
# Infrastructure rollback
cd infrastructure/terraform
terraform destroy -auto-approve

# API rollback (if using slot deployment)
az webapp deployment slot swap \
  --name $WEBAPP_NAME \
  --resource-group $RESOURCE_GROUP \
  --slot production \
  --target-slot staging \
  --action revert
```

## Troubleshooting

### Common Issues

**Issue: Terraform apply fails**
- Check Azure quotas
- Verify service principal permissions
- Review error messages

**Issue: API deployment fails**
- Check build logs
- Verify all secrets are set
- Test locally first

**Issue: Bot not responding**
- Verify custom connector is working
- Check API logs
- Test connector connection

**Issue: No search results**
- Verify index was created
- Check sample data was uploaded
- Test search API directly

**Issue: High costs**
- Review token usage
- Check OpenAI pricing tier
- Optimize queries

## Maintenance Schedule

**Daily:**
- Monitor dashboards
- Review error logs

**Weekly:**
- Review usage metrics
- Check for updates

**Monthly:**
- Rotate API keys
- Review costs
- Update documentation

**Quarterly:**
- Security review
- Performance optimization
- Feature updates

## Support

For deployment issues:
- Check logs in Application Insights
- Review Azure Monitor
- Contact platform team
- Submit support ticket

## Next Steps

After successful deployment:
1. Review [Admin Guide](admin-guide/ADMIN_GUIDE.md)
2. Set up [Security Best Practices](SECURITY.md)
3. Train users with [User Guide](user-guide/USER_GUIDE.md)
4. Monitor performance using [API Reference](API_REFERENCE.md)

