# Enterprise Knowledge Assistant - Administrator Guide

## Table of Contents
1. [Overview](#overview)
2. [Daily Operations](#daily-operations)
3. [User Management](#user-management)
4. [Document Management](#document-management)
5. [System Configuration](#system-configuration)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance](#maintenance)

## Overview

As an administrator of the Enterprise Knowledge Assistant, you are responsible for:
- Managing user access and permissions
- Maintaining the knowledge base
- Monitoring system health and performance
- Configuring system settings
- Responding to incidents
- Ensuring security and compliance

### Administrator Roles

**System Administrator**
- Full system access
- Infrastructure management
- Security configuration
- User management

**Knowledge Manager**
- Document management
- Content curation
- Index maintenance
- Quality assurance

**Analyst**
- Analytics and reporting
- Usage monitoring
- Performance analysis
- Insights generation

## Daily Operations

### Morning Routine

1. **Check System Health**
   - Open Power App Dashboard
   - Review overall system status
   - Check for any alerts

2. **Review Overnight Activity**
   - Check Application Insights dashboard
   - Review error logs
   - Verify automated jobs ran successfully

3. **Monitor Key Metrics**
   - Query volume
   - Response times
   - Error rates
   - User satisfaction scores

### Health Check Dashboard

Access: `https://your-webapp.azurewebsites.net/api/admin/health`

**Indicators:**
- Green: All systems operational
- Yellow: Degraded performance
- Red: Service down

**Services to Monitor:**
- Azure OpenAI: Operational
- Cognitive Search: Operational
- Backend API: Operational
- Azure Functions: Operational

### Responding to Alerts

When you receive an alert:

1. **Assess Severity**
   - Critical: Immediate action required
   - High: Action within 1 hour
   - Medium: Action within 4 hours
   - Low: Action within 24 hours

2. **Check Application Insights**
   ```
   Portal > Application Insights > Failures
   ```

3. **Review Recent Changes**
   - Check deployment history
   - Review configuration changes

4. **Take Action**
   - Critical: Page on-call engineer
   - High: Investigate immediately
   - Medium: Create ticket
   - Low: Add to backlog

## User Management

### Adding Users

#### Assign Basic Access
```bash
# Get user object ID
USER_ID=$(az ad user show \
  --id user@company.com \
  --query id -o tsv)

# Assign User role
az ad app user add \
  --id <app-registration-id> \
  --user-id $USER_ID \
  --role-id <user-role-id>
```

#### Assign Administrator Access
```bash
# Assign Admin role
az ad app user add \
  --id <app-registration-id> \
  --user-id $USER_ID \
  --role-id <admin-role-id>
```

### Managing Permissions

**User Role**: Can query knowledge base
- POST /api/query
- POST /api/query/feedback
- GET /api/analytics/usage (own data)

**Analyst Role**: Can view analytics
- All User permissions
- GET /api/analytics/*

**Knowledge Manager Role**: Can manage content
- All Analyst permissions
- POST /api/admin/reindex
- GET /api/admin/documents

**Admin Role**: Full system access
- All permissions
- POST /api/admin/config
- GET /api/admin/health
- System configuration

### Revoking Access

```bash
# Remove user from role
az ad app user remove \
  --id <app-registration-id> \
  --user-id $USER_ID
```

### Bulk User Management

Use Power App Dashboard:
1. Go to User Management tab
2. Upload CSV with user emails and roles
3. Review and confirm
4. System assigns roles automatically

## Document Management

### Uploading Documents

#### Manual Upload (Azure Portal)
1. Go to Storage Account
2. Navigate to `knowledge-documents` container
3. Click Upload
4. Select files (PDF, DOCX, TXT, HTML)
5. Upload
6. Wait for automatic processing (15 min timer)

#### Programmatic Upload
```bash
# Upload single file
az storage blob upload \
  --account-name <storage-account> \
  --container-name knowledge-documents \
  --name "policies/expense-policy.pdf" \
  --file "./expense-policy.pdf"

# Trigger immediate processing
curl -X POST \
  "https://<function-app>.azurewebsites.net/api/documentProcessorHttp?fileName=policies/expense-policy.pdf" \
  -H "x-functions-key: <function-key>"
```

### Document Lifecycle

```
Upload → Extraction → Chunking → Embedding → Indexing → Searchable
```

**Timeline:**
- Upload to processing: 1-15 minutes (depends on timer)
- Processing duration: 1-5 minutes per document
- Total time: 2-20 minutes

### Managing the Index

#### View Index Statistics
```bash
# Using Power App Dashboard
Dashboard > Documents > Index Statistics

# Using API
curl -X GET \
  "https://<api>.azurewebsites.net/api/admin/stats" \
  -H "Authorization: Bearer <token>"
```

#### Reindex Documents
When to reindex:
- After changing search configuration
- After bulk document updates
- If search quality degrades

```bash
# Trigger reindex
curl -X POST \
  "https://<api>.azurewebsites.net/api/admin/reindex" \
  -H "Authorization: Bearer <token>"
```

**Warning**: Reindexing can take 30+ minutes for large datasets.

#### Delete Documents
```bash
# Delete from storage
az storage blob delete \
  --account-name <storage-account> \
  --container-name knowledge-documents \
  --name "<filename>"

# Remove from index
# Use Power App Dashboard > Documents > Delete
```

### Document Quality Guidelines

**Good Documents:**
- Well-structured with headings
- Clear, concise language
- Up-to-date information
- Properly formatted

**Avoid:**
- Scanned images without OCR
- Documents with poor formatting
- Outdated content
- Duplicate information

## System Configuration

### Accessing Configuration

**Power App Dashboard:**
Configuration tab (Admin access required)

**API:**
```bash
GET /api/admin/config
```

### RAG Configuration

**Parameters:**

| Parameter | Description | Default | Range |
|-----------|-------------|---------|-------|
| topK | Number of documents to retrieve | 5 | 1-20 |
| maxTokens | Max tokens in response | 1500 | 100-4000 |
| temperature | Creativity (0=focused, 1=creative) | 0.3 | 0-1 |
| minRelevanceScore | Minimum relevance threshold | 0.7 | 0-1 |

**Adjusting Parameters:**

```bash
# Update configuration (requires Admin role)
curl -X POST \
  "https://<api>.azurewebsites.net/api/admin/config" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "topK": 7,
    "temperature": 0.2
  }'
```

**Best Practices:**
- Start with defaults
- Adjust based on feedback
- Test changes in staging first
- Monitor impact on quality

### Rate Limiting

**Default Limits:**
- 100 requests per minute per user
- 1000 requests per hour per user

**Adjusting Limits:**
Edit environment variables in App Service:
```
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=150
```

### API Keys Rotation

**Schedule**: Rotate every 90 days

```bash
# Generate new OpenAI key
az cognitiveservices account keys regenerate \
  --name <openai-account> \
  --resource-group <rg> \
  --key-name key2

# Update Key Vault
az keyvault secret set \
  --vault-name <kv> \
  --name openai-api-key \
  --value "<new-key>"

# Restart API
az webapp restart \
  --name <webapp> \
  --resource-group <rg>
```

## Monitoring

### Key Performance Indicators (KPIs)

**Usage Metrics:**
- Daily active users
- Total queries per day
- Average queries per user

**Performance Metrics:**
- Average response time
- P95 response time
- Error rate
- Availability

**Quality Metrics:**
- User satisfaction score (from feedback)
- Percentage of queries with sources
- Average confidence score

### Application Insights Dashboards

**Create Custom Dashboard:**
1. Go to Azure Portal
2. Application Insights > Dashboards
3. New Dashboard
4. Add tiles for:
   - Request volume
   - Response time
   - Error rate
   - Custom metrics

**Pre-built Queries:**
Located in `monitoring/app-insights/queries.kql`

**Important Queries:**
- Query performance over time
- Top users by query count
- Error rate by endpoint
- Token usage and costs

### Setting Up Alerts

**Recommended Alerts:**

1. **High Error Rate**
   - Condition: Error rate > 5% for 5 minutes
   - Action: Email + Slack notification

2. **Slow Response Time**
   - Condition: P95 > 10 seconds for 10 minutes
   - Action: Email notification

3. **Service Down**
   - Condition: Availability < 99% for 5 minutes
   - Action: Page on-call + Email

4. **High Cost**
   - Condition: Daily cost > budget threshold
   - Action: Email to billing team

### Cost Management

**Monitor Costs:**
```
Azure Portal > Cost Management > Cost Analysis
```

**Filter by:**
- Resource group
- Service (OpenAI, Search, API, etc.)
- Time range

**Cost Breakdown:**
- Azure OpenAI: ~50-70% (varies with usage)
- Cognitive Search: ~15-20%
- App Service: ~10-15%
- Functions: ~5%
- Storage: ~1-2%

**Optimization Tips:**
- Monitor token usage
- Adjust OpenAI capacity
- Use cool storage for old documents
- Enable auto-scaling during low usage

## Troubleshooting

### Common Issues

#### Issue: Users Can't Query
**Symptoms:** 401 Unauthorized errors

**Check:**
1. User has correct role assigned
2. Azure AD authentication is working
3. App registration is configured correctly

**Resolution:**
```bash
# Verify user role
az ad app user list --id <app-id> --query "[?userPrincipalName=='user@company.com']"

# If missing, add role
az ad app user add --id <app-id> --user-id <user-id> --role-id <role-id>
```

#### Issue: No Search Results
**Symptoms:** Empty results for all queries

**Check:**
1. Index exists and has documents
2. Search service is running
3. API has correct credentials

**Resolution:**
```bash
# Check index document count
az search index show \
  --service-name <search-service> \
  --index-name enterprise-knowledge-index \
  --query documentCount

# If 0, reupload sample data or trigger ingestion
```

#### Issue: Slow Responses
**Symptoms:** Response time > 10 seconds

**Check:**
1. Application Insights for bottlenecks
2. OpenAI rate limiting
3. Search service performance

**Resolution:**
- Scale up App Service Plan
- Increase OpenAI capacity
- Check network latency
- Review query complexity

#### Issue: High Error Rate
**Symptoms:** Many 500 errors

**Check:**
1. Application Insights > Failures
2. API logs
3. Dependency health

**Resolution:**
- Check OpenAI quota
- Verify all secrets are valid
- Restart App Service
- Check Azure service health

### Diagnostic Tools

**API Health Check:**
```bash
curl https://<api>.azurewebsites.net/health
```

**Detailed Health Check:**
```bash
curl https://<api>.azurewebsites.net/api/admin/health \
  -H "Authorization: Bearer <token>"
```

**View Logs:**
```bash
# Stream logs
az webapp log tail \
  --name <webapp> \
  --resource-group <rg>

# Download logs
az webapp log download \
  --name <webapp> \
  --resource-group <rg> \
  --log-file logs.zip
```

## Maintenance

### Daily Tasks
- [ ] Review system health dashboard
- [ ] Check for alerts
- [ ] Monitor query volume
- [ ] Review error logs

### Weekly Tasks
- [ ] Review usage analytics
- [ ] Check user feedback
- [ ] Update knowledge base as needed
- [ ] Review top queries

### Monthly Tasks
- [ ] Rotate API keys
- [ ] Review and optimize costs
- [ ] Update documentation
- [ ] Security review
- [ ] Performance tuning

### Quarterly Tasks
- [ ] Major system updates
- [ ] Comprehensive security audit
- [ ] Disaster recovery test
- [ ] User satisfaction survey
- [ ] Budget review

### Backup and Recovery

**Automated Backups:**
- Search index: Daily snapshots
- Blob storage: Geo-redundant
- Configuration: Terraform state

**Manual Backup:**
```bash
# Export index data
az search index show \
  --service-name <search> \
  --index-name <index> \
  > index-backup.json
```

**Recovery Process:**
1. Restore Terraform state
2. Run `terraform apply`
3. Restore index from snapshot
4. Re-upload documents if needed
5. Verify functionality

## Best Practices

### Security
- Use managed identities where possible
- Rotate secrets regularly
- Follow principle of least privilege
- Enable audit logging
- Review access logs weekly

### Performance
- Monitor response times
- Optimize queries
- Use caching where appropriate
- Scale proactively

### Operations
- Document all changes
- Test in staging first
- Have rollback plan
- Communicate downtime
- Keep runbook updated

## Emergency Contacts

**Priority 1 (Critical)**
- On-call Engineer: <phone>
- Backup: <phone>

**Priority 2 (High)**
- Platform Team Lead: <email>
- DevOps Team: <email>

**Support Channels:**
- Slack: #knowledge-assistant-support
- Email: platform-team@company.com
- Ticket System: <url>

## Additional Resources

- [Architecture Documentation](../architecture/ARCHITECTURE.md)
- [API Reference](../API_REFERENCE.md)
- [Security Guide](../SECURITY.md)
- [User Guide](../user-guide/USER_GUIDE.md)
- [Deployment Guide](../DEPLOYMENT.md)

