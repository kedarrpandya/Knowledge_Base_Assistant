# Enterprise Knowledge Assistant - Security Best Practices

## Security Overview

The Enterprise Knowledge Assistant is designed with security as a foundational principle, implementing defense-in-depth strategies across all layers of the application.

## Authentication & Authorization

### Azure AD Integration

**Single Sign-On (SSO)**
- All users authenticate via Azure AD
- Supports Multi-Factor Authentication (MFA)
- Conditional Access policies enforced
- Session management via Azure AD

**OAuth 2.0 Flow**
```
User → Azure AD → Token → API → Verified Request
```

**Token Validation**
- Issuer validation
- Audience validation
- Signature verification
- Expiration check
- Scope verification

### Role-Based Access Control (RBAC)

**Defined Roles:**

| Role | Permissions | Use Case |
|------|-------------|----------|
| User | Query, Feedback | All employees |
| Analyst | User + Analytics | Data analysts, managers |
| KnowledgeManager | Analyst + Document Management | Content teams |
| Admin | Full access | IT administrators |

**Permission Matrix:**

| Endpoint | User | Analyst | Manager | Admin |
|----------|------|---------|---------|-------|
| POST /api/query | ✓ | ✓ | ✓ | ✓ |
| POST /api/query/feedback | ✓ | ✓ | ✓ | ✓ |
| GET /api/analytics/usage | Own | ✓ | ✓ | ✓ |
| GET /api/analytics/performance | ✗ | ✓ | ✓ | ✓ |
| POST /api/admin/reindex | ✗ | ✗ | ✓ | ✓ |
| POST /api/admin/config | ✗ | ✗ | ✗ | ✓ |

### API Key Management

**Service-to-Service Authentication**
```bash
# Store API keys in Key Vault
az keyvault secret set \
  --vault-name <kv-name> \
  --name "service-api-key" \
  --value "$(openssl rand -base64 32)"
```

**Rotation Schedule:**
- API Keys: Every 90 days
- Client Secrets: Every 180 days
- Certificates: Every 365 days

## Data Security

### Encryption

**At Rest:**
- Azure Storage: AES-256 encryption
- Azure SQL: Transparent Data Encryption (TDE)
- Cognitive Search: Platform-managed encryption
- Key Vault: FIPS 140-2 Level 2 validated HSMs

**In Transit:**
- TLS 1.2 minimum
- Perfect Forward Secrecy (PFS)
- Strong cipher suites only
- HSTS enabled

**Configuration:**
```typescript
// backend/src/index.ts
app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### Data Classification

| Classification | Description | Encryption | Access |
|----------------|-------------|------------|--------|
| Public | Publicly available | Standard | All |
| Internal | Company internal | Standard | Authenticated |
| Confidential | Sensitive business | Enhanced | Role-based |
| Restricted | Highly sensitive | Enhanced + Audit | Admin only |

**Document Tagging:**
```json
{
  "metadata": {
    "classification": "Confidential",
    "owner": "Finance",
    "retention": "7-years"
  }
}
```

### Data Loss Prevention (DLP)

**Power Platform DLP Policy:**
```json
{
  "business": [
    "Office 365",
    "SharePoint",
    "Teams",
    "Knowledge Assistant API"
  ],
  "nonBusiness": [
    "Twitter",
    "Facebook",
    "Public APIs"
  ],
  "blocked": [
    "Unknown sources"
  ]
}
```

**Enforcement:**
- Block business data sharing with non-business connectors
- Alert on policy violations
- Audit all connector usage

## Network Security

### Network Architecture

```
Internet → Azure Front Door → WAF → VNet → Private Endpoints → Services
```

**Components:**

1. **Azure Front Door**
   - DDoS protection
   - SSL/TLS termination
   - Rate limiting
   - Geographic routing

2. **Web Application Firewall (WAF)**
   - OWASP Top 10 protection
   - Bot protection
   - Custom rules

3. **Virtual Network (VNet)**
   - Network isolation
   - Service endpoints
   - Private links

4. **Network Security Groups (NSG)**
```bash
# Example NSG rule
az network nsg rule create \
  --resource-group <rg> \
  --nsg-name <nsg> \
  --name AllowHTTPS \
  --priority 100 \
  --direction Inbound \
  --access Allow \
  --protocol Tcp \
  --destination-port-ranges 443
```

### Private Endpoints

**Enable for production:**
```terraform
# infrastructure/terraform/main.tf
resource "azurerm_private_endpoint" "openai" {
  name                = "openai-private-endpoint"
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
  subnet_id           = azurerm_subnet.private_endpoints.id

  private_service_connection {
    name                           = "openai-connection"
    private_connection_resource_id = azurerm_cognitive_account.openai.id
    is_manual_connection           = false
    subresource_names              = ["account"]
  }
}
```

**Benefits:**
- No public IP exposure
- Traffic stays within Azure backbone
- Protection from internet threats

### IP Whitelisting

```bash
# Restrict access to specific IPs
az webapp config access-restriction add \
  --resource-group <rg> \
  --name <webapp> \
  --rule-name "Office" \
  --action Allow \
  --ip-address 203.0.113.0/24 \
  --priority 100
```

## Application Security

### Input Validation

**Server-Side Validation:**
```typescript
import Joi from 'joi';

const questionSchema = Joi.object({
  question: Joi.string().min(3).max(1000).required(),
  sessionId: Joi.string().optional(),
  metadata: Joi.object().optional()
});

// Validate all inputs
const { error, value } = questionSchema.validate(req.body);
if (error) {
  return res.status(400).json({
    error: 'Validation Error',
    message: error.details[0].message
  });
}
```

**Protection Against:**
- SQL Injection (not applicable, no SQL)
- XSS (Cross-Site Scripting)
- CSRF (Cross-Site Request Forgery)
- Command Injection
- Path Traversal

### Security Headers

```typescript
// Helmet configuration
app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: true,
  xssFilter: true
}));
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    error: 'Too Many Requests',
    message: 'Rate limit exceeded'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    trackEvent('rate_limit_exceeded', {
      userId: req.user?.oid,
      ip: req.ip
    });
    res.status(429).json({
      error: 'Too Many Requests'
    });
  }
});

app.use('/api/query', limiter);
```

### Dependency Management

**Automated Scanning:**
```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Check specific severity
npm audit --audit-level=high
```

**GitHub Dependabot:**
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/backend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

## Secrets Management

### Azure Key Vault

**Store All Secrets:**
```bash
# OpenAI API Key
az keyvault secret set \
  --vault-name <kv> \
  --name openai-api-key \
  --value "<secret>"

# Search API Key
az keyvault secret set \
  --vault-name <kv> \
  --name search-api-key \
  --value "<secret>"
```

**Access Policies:**
```bash
# Grant API access
az keyvault set-policy \
  --name <kv> \
  --object-id <api-identity> \
  --secret-permissions get list
```

**Managed Identity:**
```typescript
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

const credential = new DefaultAzureCredential();
const client = new SecretClient(process.env.KEY_VAULT_URI!, credential);

const secret = await client.getSecret('openai-api-key');
```

### Never Commit Secrets

**.gitignore:**
```
.env
.env.*
*.pem
*.key
secrets/
config/secrets.json
```

**Pre-commit Hook:**
```bash
#!/bin/bash
# .git/hooks/pre-commit

if git grep -E '(password|secret|key|token).*=.*["\']' -- ':(exclude).env.example'; then
  echo "Error: Potential secret detected in commit"
  exit 1
fi
```

## Logging & Monitoring

### Security Logging

**Log Security Events:**
```typescript
// Authentication attempts
logger.info('Authentication attempt', {
  userId: user.oid,
  success: true,
  ip: req.ip,
  userAgent: req.headers['user-agent']
});

// Authorization failures
logger.warn('Authorization failed', {
  userId: user.oid,
  requiredRole: 'Admin',
  userRoles: user.roles,
  endpoint: req.path
});

// Suspicious activity
logger.error('Suspicious activity detected', {
  userId: user.oid,
  activity: 'Multiple failed auth attempts',
  count: 10,
  ip: req.ip
});
```

**Audit Trail:**
- All admin actions
- Configuration changes
- Document uploads/deletions
- User access
- Permission changes

### Security Alerts

**Configure Alerts:**
```bash
# Multiple failed authentications
az monitor metrics alert create \
  --name "Multiple Auth Failures" \
  --resource-group <rg> \
  --scopes <resource-id> \
  --condition "count failed_auth > 10" \
  --window-size 5m \
  --evaluation-frequency 1m

# Unusual API usage
az monitor metrics alert create \
  --name "Unusual API Usage" \
  --resource-group <rg> \
  --scopes <resource-id> \
  --condition "count requests > 1000" \
  --window-size 15m
```

## Compliance

### Standards Compliance

**SOC 2 Type II:**
- Access controls
- Encryption
- Monitoring
- Incident response
- Business continuity

**GDPR:**
- Data minimization
- Purpose limitation
- User consent
- Right to erasure
- Data portability
- Privacy by design

**Implementation:**
```typescript
// GDPR: Right to erasure
app.delete('/api/user/data', authMiddleware, async (req, res) => {
  const userId = req.user!.oid;
  
  // Delete user data
  await deleteUserQueries(userId);
  await deleteUserFeedback(userId);
  await anonymizeUserLogs(userId);
  
  logger.info('User data deleted', { userId });
  res.json({ message: 'Data deleted successfully' });
});
```

### Data Retention

**Policies:**
- Query logs: 90 days
- Feedback: 1 year
- Analytics: 2 years
- Audit logs: 7 years
- Documents: Per document policy

**Automated Cleanup:**
```typescript
// Azure Function - runs daily
export async function cleanupOldData(timer: Timer) {
  const retentionDays = 90;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  await deleteLogsOlderThan(cutoffDate);
  logger.info('Old data cleaned up', { cutoffDate });
}
```

## Incident Response

### Security Incident Process

1. **Detection**
   - Automated alerts
   - Manual reporting
   - Security scans

2. **Assessment**
   - Severity classification
   - Impact analysis
   - Scope determination

3. **Containment**
   - Isolate affected systems
   - Revoke compromised credentials
   - Block malicious IPs

4. **Eradication**
   - Remove threat
   - Patch vulnerabilities
   - Update security controls

5. **Recovery**
   - Restore services
   - Verify security
   - Monitor for recurrence

6. **Post-Incident**
   - Document lessons learned
   - Update procedures
   - Implement improvements

### Incident Response Team

- **Incident Commander**: Platform lead
- **Technical Lead**: Senior engineer
- **Communications**: PR team
- **Legal**: Legal counsel
- **Security**: Security team

### Reporting Security Issues

**Internal:**
- Email: security@company.com
- Slack: #security-incidents
- Phone: Security hotline

**External Researchers:**
- Email: security-research@company.com
- Bug bounty program
- Responsible disclosure policy

## Security Checklist

### Development

- [ ] All dependencies up to date
- [ ] No hardcoded secrets
- [ ] Input validation implemented
- [ ] Error handling doesn't leak info
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Logging configured

### Deployment

- [ ] Secrets in Key Vault
- [ ] HTTPS enforced
- [ ] Private endpoints enabled
- [ ] NSG rules configured
- [ ] RBAC roles assigned
- [ ] Monitoring alerts configured
- [ ] Backup configured

### Operations

- [ ] Regular security scans
- [ ] Patch management
- [ ] Access reviews
- [ ] Audit log reviews
- [ ] Incident response drills
- [ ] Security training

## Security Testing

### Automated Scanning

```bash
# OWASP ZAP scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://your-api.azurewebsites.net \
  -r security-report.html

# npm audit
npm audit --audit-level=moderate

# Snyk scan
snyk test --all-projects
```

### Penetration Testing

**Schedule:** Annually
- External penetration test
- Internal vulnerability assessment
- Social engineering test
- Physical security review

## Additional Resources

- [Azure Security Best Practices](https://docs.microsoft.com/azure/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

## Contact

For security questions or concerns:
- Security Team: security@company.com
- CISO Office: ciso@company.com
- Emergency: Security hotline

