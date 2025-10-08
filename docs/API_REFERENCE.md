# Enterprise Knowledge Assistant - API Reference

## Base URL

```
Production: https://your-api.azurewebsites.net
Staging: https://your-api-staging.azurewebsites.net
```

## Authentication

All API requests require authentication using OAuth 2.0 Bearer tokens.

### Obtaining a Token

```bash
# Using Azure AD client credentials flow
curl -X POST https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id={client-id}" \
  -d "client_secret={client-secret}" \
  -d "scope=api://knowledge-assistant/.default" \
  -d "grant_type=client_credentials"
```

### Using the Token

Include the token in the Authorization header:

```bash
Authorization: Bearer {access-token}
```

## Rate Limiting

- **Limit**: 100 requests per minute per user
- **Headers**: Rate limit info included in response headers
  - `X-RateLimit-Limit`: Max requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

## Error Handling

### Error Response Format

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/query",
  "statusCode": 400
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

## Health Endpoints

### GET /health

Health check endpoint (no authentication required).

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

### GET /ready

Readiness check endpoint.

**Response:**
```json
{
  "status": "ready",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Query Endpoints

### POST /api/query

Submit a question to the knowledge base.

**Request:**
```json
{
  "question": "How do I submit expense reimbursements?",
  "sessionId": "optional-session-id",
  "metadata": {
    "department": "Engineering",
    "custom": "value"
  }
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| question | string | Yes | User question (3-1000 chars) |
| sessionId | string | No | Session identifier for context |
| metadata | object | No | Additional context metadata |

**Response:**
```json
{
  "answer": "To submit expense reimbursements, follow these steps...",
  "sources": [
    {
      "id": "doc-123",
      "title": "Expense Reimbursement Policy",
      "excerpt": "Submit expense reports within 30 days...",
      "relevanceScore": 0.95,
      "metadata": {
        "category": "Finance",
        "lastUpdated": "2024-01-10"
      }
    }
  ],
  "confidence": 94.5,
  "processingTimeMs": 1850,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Example:**
```bash
curl -X POST https://your-api.azurewebsites.net/api/query \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the vacation policy?"
  }'
```

### POST /api/query/batch

Submit multiple questions in a single request.

**Request:**
```json
{
  "questions": [
    "What is the vacation policy?",
    "How do I submit expenses?",
    "What are IT security best practices?"
  ]
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| questions | array | Yes | Array of questions (1-10) |

**Response:**
```json
{
  "results": [
    {
      "answer": "...",
      "sources": [...],
      "confidence": 92.0,
      "processingTimeMs": 1500
    },
    {
      "answer": "...",
      "sources": [...],
      "confidence": 88.5,
      "processingTimeMs": 1650
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### POST /api/query/feedback

Submit user feedback on an answer.

**Request:**
```json
{
  "questionId": "query-123",
  "rating": 5,
  "comment": "Very helpful!",
  "helpful": true
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| questionId | string | Yes | ID of the query |
| rating | integer | Yes | Rating (1-5) |
| comment | string | No | Optional comment (max 500 chars) |
| helpful | boolean | Yes | Whether answer was helpful |

**Response:**
```json
{
  "message": "Feedback received successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Admin Endpoints

All admin endpoints require the `Admin` role.

### GET /api/admin/health

Check health of backend dependencies.

**Response:**
```json
{
  "status": "healthy",
  "services": {
    "openai": {
      "status": "operational"
    },
    "cognitiveSearch": {
      "status": "operational"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### GET /api/admin/config

Get current system configuration.

**Response:**
```json
{
  "rag": {
    "topK": 5,
    "maxTokens": 1500,
    "temperature": 0.3,
    "minRelevanceScore": 0.7
  },
  "rateLimit": {
    "windowMs": 60000,
    "maxRequests": 100
  },
  "environment": "production",
  "version": "1.0.0"
}
```

### POST /api/admin/reindex

Trigger reindexing of the knowledge base.

**Response:**
```json
{
  "message": "Reindex job initiated",
  "jobId": "reindex-1234567890",
  "status": "queued",
  "estimatedDurationMinutes": 30,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### GET /api/admin/stats

Get system statistics.

**Response:**
```json
{
  "queries": {
    "total": 15420,
    "last24Hours": 342,
    "averageResponseTimeMs": 1850
  },
  "users": {
    "totalActive": 245,
    "last24Hours": 58
  },
  "documents": {
    "totalIndexed": 1250,
    "lastUpdated": "2024-01-15T08:00:00Z"
  },
  "system": {
    "uptime": 2592000,
    "memoryUsage": {
      "rss": 125829120,
      "heapTotal": 67108864,
      "heapUsed": 45678901
    },
    "nodeVersion": "v18.17.0"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Analytics Endpoints

### GET /api/analytics/usage

Get usage analytics.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | No | Start date (ISO 8601) |
| endDate | string | No | End date (ISO 8601) |
| granularity | string | No | day, week, month (default: day) |

**Response:**
```json
{
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-15T00:00:00Z",
    "granularity": "day"
  },
  "metrics": {
    "totalQueries": 5420,
    "uniqueUsers": 245,
    "averageResponseTime": 1850,
    "successRate": 98.5
  },
  "timeSeries": [
    {
      "date": "2024-01-01",
      "queries": 342,
      "users": 58
    }
  ],
  "topQuestions": [
    {
      "question": "How do I submit expenses?",
      "count": 125
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### GET /api/analytics/performance

Get performance metrics (requires `Admin` or `Analyst` role).

**Response:**
```json
{
  "responseTime": {
    "p50": 1200,
    "p95": 3500,
    "p99": 5800,
    "average": 1850
  },
  "throughput": {
    "requestsPerMinute": 15.5,
    "requestsPerHour": 932
  },
  "errors": {
    "total": 45,
    "rate": 1.5,
    "byType": {
      "ValidationError": 20,
      "AuthenticationError": 15,
      "ServiceError": 10
    }
  },
  "resources": {
    "cpuUsage": 35.2,
    "memoryUsage": 68.5
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### GET /api/analytics/feedback

Get user feedback analytics.

**Response:**
```json
{
  "summary": {
    "totalFeedback": 1250,
    "averageRating": 4.3,
    "helpfulPercentage": 87.5
  },
  "ratingDistribution": {
    "1": 25,
    "2": 50,
    "3": 175,
    "4": 400,
    "5": 600
  },
  "recentComments": [
    {
      "rating": 5,
      "comment": "Very helpful!",
      "timestamp": "2024-01-15T09:45:00Z"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Code Examples

### Python

```python
import requests

# Configuration
API_BASE_URL = "https://your-api.azurewebsites.net"
ACCESS_TOKEN = "your-access-token"

# Headers
headers = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json"
}

# Submit query
def query_knowledge_base(question):
    response = requests.post(
        f"{API_BASE_URL}/api/query",
        headers=headers,
        json={"question": question}
    )
    return response.json()

# Example usage
result = query_knowledge_base("How do I reset my password?")
print(f"Answer: {result['answer']}")
print(f"Confidence: {result['confidence']}%")
```

### Node.js

```javascript
const axios = require('axios');

const API_BASE_URL = 'https://your-api.azurewebsites.net';
const ACCESS_TOKEN = 'your-access-token';

async function queryKnowledgeBase(question) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/query`,
      { question },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Example usage
queryKnowledgeBase('What is the vacation policy?')
  .then(result => {
    console.log(`Answer: ${result.answer}`);
    console.log(`Confidence: ${result.confidence}%`);
  });
```

### C# (.NET)

```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class KnowledgeAssistantClient
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl;

    public KnowledgeAssistantClient(string baseUrl, string accessToken)
    {
        _baseUrl = baseUrl;
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
    }

    public async Task<QueryResponse> QueryAsync(string question)
    {
        var request = new { question };
        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync($"{_baseUrl}/api/query", content);
        response.EnsureSuccessStatusCode();

        var responseJson = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<QueryResponse>(responseJson);
    }
}
```

## Webhooks (Coming Soon)

Subscribe to events:
- New document indexed
- Query completed
- Feedback received
- System alerts

## SDK Libraries

Official SDKs:
- Python: `pip install knowledge-assistant-sdk`
- Node.js: `npm install @company/knowledge-assistant`
- .NET: `dotnet add package Company.KnowledgeAssistant`

## Support

- API Documentation: https://api-docs.company.com
- Developer Portal: https://developers.company.com
- Support Email: api-support@company.com
- GitHub Issues: https://github.com/company/knowledge-assistant

## Changelog

### v1.0.0 (2024-01-15)
- Initial release
- Query and feedback endpoints
- Admin and analytics endpoints
- OAuth 2.0 authentication

### Upcoming
- Streaming responses
- Webhooks
- Advanced filtering
- Multi-language support

