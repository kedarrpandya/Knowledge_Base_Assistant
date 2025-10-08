# Power Virtual Agent Bot Configuration

This directory contains the configuration and export files for the Enterprise Knowledge Assistant Power Virtual Agent bot.

## Bot Overview

The Knowledge Assistant bot provides conversational access to the enterprise knowledge base through a natural language interface integrated with Azure OpenAI RAG.

## Features

- Natural language query processing
- Integration with backend RAG API
- Escalation to human agents
- Feedback collection
- Multi-channel support (Teams, Web, Email)

## Setup Instructions

### 1. Create Power Virtual Agent

1. Navigate to [Power Virtual Agents](https://make.powerva.microsoft.com/)
2. Create a new bot:
   - Name: "Enterprise Knowledge Assistant"
   - Language: English
   - Environment: Select your Power Platform environment

### 2. Configure Topics

Import the following topics (defined below):

#### Greeting Topic
- **Trigger phrases**: "hello", "hi", "help", "start"
- **Response**: "Hello! I'm your Enterprise Knowledge Assistant. I can help you find information from our company knowledge base. What would you like to know?"

#### Knowledge Query Topic
- **Trigger phrases**: "I have a question", "help me find", "tell me about", "what is", "how do I"
- **Actions**:
  1. Capture user question in variable `UserQuestion`
  2. Call custom connector to RAG API
  3. Display answer with sources
  4. Ask if the answer was helpful

#### Escalation Topic
- **Trigger phrases**: "talk to agent", "speak to human", "escalate"
- **Actions**:
  1. Confirm escalation need
  2. Trigger Power Automate flow to create support ticket
  3. Notify user that an agent will contact them

#### Feedback Topic
- **Trigger phrases**: "provide feedback", "rate answer", "not helpful"
- **Actions**:
  1. Collect rating (1-5)
  2. Optional comment field
  3. Submit to analytics API
  4. Thank user

### 3. Custom Connector Configuration

Create a custom connector to the RAG API:

**Connector Settings:**
- Name: "Knowledge Assistant RAG API"
- Host: Your API endpoint (e.g., `your-api.azurewebsites.net`)
- Base URL: `/api`

**Security:**
- Authentication type: OAuth 2.0
- Identity Provider: Azure Active Directory
- Client ID: Your Azure AD app registration client ID
- Client Secret: From Azure AD app registration
- Resource URL: Your API App ID URI

**Actions:**

1. **Query Knowledge Base**
   - Method: POST
   - Path: `/query`
   - Request body:
     ```json
     {
       "question": "string",
       "sessionId": "string"
     }
     ```
   - Response schema:
     ```json
     {
       "answer": "string",
       "sources": [],
       "confidence": "number",
       "processingTimeMs": "number"
     }
     ```

2. **Submit Feedback**
   - Method: POST
   - Path: `/query/feedback`
   - Request body:
     ```json
     {
       "questionId": "string",
       "rating": "number",
       "comment": "string",
       "helpful": "boolean"
     }
     ```

### 4. Configure Channels

#### Microsoft Teams
1. Go to Manage > Channels
2. Enable Microsoft Teams channel
3. Copy the bot App ID
4. Add bot to your Teams tenant

#### Web Chat
1. Enable Web Chat channel
2. Copy embed code
3. Add to your internal portal or website

### 5. Analytics Configuration

Enable bot analytics:
- Application Insights connection
- Custom event tracking
- User satisfaction metrics

## Bot Conversation Flow

```
User: "How do I submit expense reimbursements?"
  ↓
Bot: [Calls RAG API]
  ↓
Bot: "To submit expense reimbursements, use the Finance Portal within 30 days..."
Bot: [Shows sources]
Bot: "Was this helpful? (Yes/No)"
  ↓
User: "Yes"
  ↓
Bot: "Great! Is there anything else I can help you with?"
```

## Testing

1. Use the Test Bot panel in Power Virtual Agents
2. Test queries:
   - "Tell me about the onboarding process"
   - "What are IT security best practices?"
   - "How do I submit expenses?"
   - "I need to talk to a human"

## Deployment

1. Publish the bot from Power Virtual Agents
2. Deploy to production environment
3. Monitor analytics and user feedback
4. Iterate on topics based on usage patterns

## Maintenance

- Review conversation transcripts weekly
- Update topics based on common queries
- Add new trigger phrases as needed
- Monitor API performance and errors

## Support

For issues with bot configuration, contact the Power Platform team.

