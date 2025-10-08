# Enterprise Knowledge Assistant - Architecture Overview

## System Architecture

The Enterprise Knowledge Assistant is a comprehensive solution that combines Azure AI services with Microsoft Power Platform to deliver intelligent, context-aware answers from your enterprise knowledge base.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        User Interfaces                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Power Virtual│  │  Power App   │  │  Web Portal  │             │
│  │    Agent     │  │  Dashboard   │  │              │             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
└─────────┼──────────────────┼──────────────────┼──────────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                    ┌────────▼─────────┐
                    │   Azure AD SSO    │
                    │  Authentication   │
                    └────────┬──────────┘
                             │
          ┌──────────────────┴──────────────────┐
          │                                      │
┌─────────▼──────────┐              ┌───────────▼──────────┐
│  Backend RAG API   │◄────────────►│  Power Automate      │
│  (Node.js/TS)      │              │  Flows               │
│                    │              └──────────────────────┘
│  ┌──────────────┐  │
│  │ Query Router │  │
│  └──────┬───────┘  │
│         │          │
│  ┌──────▼───────┐  │
│  │ RAG Service  │  │
│  └──────┬───────┘  │
└─────────┼──────────┘
          │
          ├──────────────────┬────────────────────┐
          │                  │                    │
┌─────────▼─────────┐  ┌─────▼─────────┐  ┌─────▼─────────┐
│  Azure OpenAI     │  │  Cognitive    │  │  Key Vault    │
│  GPT-4 + Embeddings│  │  Search       │  │  Secrets      │
└───────────────────┘  └────┬──────────┘  └───────────────┘
                            │
                  ┌─────────▼──────────┐
                  │  Knowledge Index   │
                  │  Vector + Keyword  │
                  └─────────┬──────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
    ┌─────────▼──────────┐    ┌──────────▼─────────┐
    │  Azure Functions   │    │  Blob Storage      │
    │  Data Ingestion    │◄───┤  Documents         │
    └────────────────────┘    └────────────────────┘
                                      ▲
                  ┌───────────────────┴────────────────┐
                  │                                    │
        ┌─────────▼──────────┐          ┌─────────────▼────────┐
        │   SharePoint       │          │   Manual Uploads     │
        │   Online           │          │   PDF/DOCX/TXT       │
        └────────────────────┘          └──────────────────────┘

              ┌─────────────────────────────────┐
              │    Monitoring & Analytics       │
              │                                 │
              │  ┌─────────────────────────┐   │
              │  │ Application Insights    │   │
              │  └─────────────────────────┘   │
              │                                 │
              │  ┌─────────────────────────┐   │
              │  │ Log Analytics Workspace │   │
              │  └─────────────────────────┘   │
              └─────────────────────────────────┘
```

## Core Components

### 1. Frontend Layer

#### Power Virtual Agent Bot
- **Purpose**: Conversational interface for users
- **Features**:
  - Natural language understanding
  - Multi-turn conversations
  - Context preservation
  - Escalation to human agents
- **Channels**: Microsoft Teams, Web Chat, Email
- **Integration**: Custom connector to RAG API

#### Power App Dashboard
- **Purpose**: Admin and analytics interface
- **Features**:
  - Real-time metrics
  - Document management
  - User analytics
  - System health monitoring
  - Configuration management
- **Access Control**: Role-based (Admin, Manager, Analyst)

#### Web Portal
- **Purpose**: Direct web access (optional)
- **Technology**: Can be integrated with existing portal
- **Authentication**: Azure AD SSO

### 2. Backend API Layer

#### RESTful API (Node.js/TypeScript)
- **Framework**: Express.js
- **Authentication**: OAuth 2.0 (Azure AD)
- **Key Endpoints**:
  - `POST /api/query` - Submit questions
  - `POST /api/query/batch` - Batch queries
  - `POST /api/query/feedback` - User feedback
  - `GET /api/admin/*` - Admin functions
  - `GET /api/analytics/*` - Analytics data

#### RAG Service
- **Functionality**:
  - Query understanding
  - Document retrieval
  - Context assembly
  - Answer generation
  - Source citation
- **Performance**: < 5s P95 response time
- **Reliability**: Automatic retry with exponential backoff

### 3. AI & Search Layer

#### Azure OpenAI Service
- **Models**:
  - GPT-4 Turbo: Answer generation
  - text-embedding-ada-002: Vector embeddings
- **Configuration**:
  - Temperature: 0.3 (focused, consistent)
  - Max Tokens: 1500
  - Top P: 0.95
- **Cost Optimization**: Token usage tracking

#### Azure Cognitive Search
- **Index Structure**:
  - Fields: id, content, title, metadata, vectors
  - Vector dimensions: 1536
  - Semantic search enabled
- **Search Types**:
  - Vector similarity search
  - Keyword search
  - Hybrid ranking
- **Performance**: Sub-second search latency

### 4. Data Ingestion Layer

#### Azure Functions
- **Trigger Types**:
  - Timer-triggered: Scheduled ingestion
  - HTTP-triggered: On-demand processing
  - Blob-triggered: Automatic on upload
- **Processing Pipeline**:
  1. Document detection
  2. Text extraction (PDF, DOCX, TXT, HTML)
  3. Chunking (2000 chars with overlap)
  4. Embedding generation
  5. Index upload
  6. Metadata tracking

#### Data Sources
- **Blob Storage**: Primary document repository
- **SharePoint Online**: Enterprise documents
- **Manual Upload**: Ad-hoc documents
- **APIs**: External data sources (future)

### 5. Security & Compliance Layer

#### Azure AD Integration
- **Features**:
  - Single Sign-On (SSO)
  - Multi-Factor Authentication (MFA)
  - Conditional Access policies
- **Roles**:
  - Admin: Full system access
  - KnowledgeManager: Document management
  - Analyst: Analytics access
  - User: Query access

#### Key Vault
- **Stored Secrets**:
  - API keys (OpenAI, Cognitive Search)
  - Connection strings
  - OAuth client secrets
- **Access**: Managed identities for Azure services

#### DLP Policies
- **Power Platform DLP**:
  - Business data connectors allowed
  - Non-business connectors blocked
  - Audit logging enabled

### 6. Monitoring & Analytics Layer

#### Application Insights
- **Metrics Tracked**:
  - Request volume and latency
  - Error rates
  - Dependency performance
  - Custom events (queries, feedback)
  - Token usage
- **Alerting**: Automated alerts for anomalies

#### Log Analytics
- **Log Sources**:
  - API logs
  - Function logs
  - Security logs
- **Retention**: 90 days
- **Queries**: Pre-built KQL queries

## Data Flow

### Query Flow
1. User asks question via Power Virtual Agent
2. Bot sends request to Backend API
3. API authenticates user via Azure AD
4. RAG Service:
   - Generates query embedding
   - Searches Cognitive Search
   - Retrieves top N documents
   - Assembles context
   - Calls Azure OpenAI
   - Formats response with sources
5. Response returned to bot
6. Bot displays answer to user
7. User provides feedback
8. Feedback logged to analytics

### Ingestion Flow
1. Document uploaded to Blob Storage
2. Azure Function triggered
3. Function:
   - Downloads document
   - Extracts text
   - Chunks content
   - Generates embeddings
   - Uploads to Cognitive Search
   - Updates metadata
4. Document available for queries

## Scaling & Performance

### Horizontal Scaling
- **API**: Azure App Service auto-scaling (2-10 instances)
- **Functions**: Consumption plan (automatic)
- **Search**: Standard tier, 3 replicas

### Caching Strategy
- **Query Results**: Optional Redis cache (5 min TTL)
- **Embeddings**: Pre-computed during ingestion
- **API Responses**: HTTP caching headers

### Performance Targets
- **Query Latency**: 
  - P50: < 2s
  - P95: < 5s
  - P99: < 10s
- **Throughput**: 100 concurrent queries
- **Availability**: 99.9% SLA

## Security Architecture

### Network Security
- **Private Endpoints**: Optional for OpenAI, Search
- **VNet Integration**: Backend API in VNet
- **NSG Rules**: Restrict traffic
- **DDoS Protection**: Azure DDoS Standard

### Data Security
- **Encryption at Rest**: All Azure services
- **Encryption in Transit**: TLS 1.2+
- **Data Classification**: Automated tagging
- **Access Control**: RBAC everywhere

### Compliance
- **Standards**: SOC 2, GDPR compliant
- **Audit Logging**: All actions logged
- **Data Residency**: US region
- **Retention Policies**: Configurable

## Disaster Recovery

### Backup Strategy
- **Search Index**: Daily snapshots
- **Blob Storage**: Geo-redundant (GRS)
- **Configuration**: Infrastructure as Code (Terraform)

### Recovery Objectives
- **RPO**: 24 hours
- **RTO**: 4 hours

### Failover Plan
1. Monitor health endpoints
2. Alert on failures
3. Automated retry logic
4. Manual failover if needed
5. Restore from backups

## Cost Optimization

### Resource Sizing
- **OpenAI**: Pay-per-token
- **Search**: Standard tier (fixed)
- **API**: P1v3 tier (reserved)
- **Storage**: Cool tier for old data

### Cost Monitoring
- **Budgets**: Azure Cost Management
- **Alerts**: Threshold alerts
- **Optimization**: Regular reviews

### Estimated Monthly Costs
- **OpenAI**: $500-1000 (depends on usage)
- **Cognitive Search**: $250 (Standard)
- **App Service**: $150 (P1v3)
- **Functions**: $50 (Consumption)
- **Storage**: $20
- **Total**: ~$1000-1500/month

## Future Enhancements

### Phase 2
- Multi-language support
- Voice interface
- Mobile app
- Advanced analytics dashboard
- Real-time collaboration

### Phase 3
- Federated search (multiple sources)
- Personalized results
- Conversation history
- Smart recommendations
- Integration with more enterprise tools

## Related Documentation

- [Deployment Guide](../DEPLOYMENT.md)
- [Security Best Practices](../SECURITY.md)
- [API Reference](../API_REFERENCE.md)
- [Admin Guide](../admin-guide/ADMIN_GUIDE.md)
- [User Guide](../user-guide/USER_GUIDE.md)

