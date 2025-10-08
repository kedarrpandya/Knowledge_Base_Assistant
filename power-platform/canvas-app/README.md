# Knowledge Assistant Admin Dashboard

A Power Apps canvas app providing administrative controls and analytics for the Enterprise Knowledge Assistant.

## Features

### 1. Dashboard Overview
- Total queries processed
- Active users
- Average response time
- User satisfaction score
- Query volume trends (daily, weekly, monthly)

### 2. Analytics
- Most common queries
- Query success rate
- Response time distribution
- User engagement metrics
- Source document usage

### 3. Document Management
- View indexed documents
- Upload new documents
- Trigger manual reindexing
- View document statistics
- Search document metadata

### 4. User Management
- View active users
- User query history
- User feedback submissions
- Usage patterns by department

### 5. System Health
- API status monitoring
- Azure service health
- Error rate tracking
- Performance metrics
- Alert configuration

### 6. Configuration
- Adjust RAG parameters (topK, temperature, etc.)
- Manage API keys (view only, rotate)
- Configure rate limits
- Set up notifications

## Setup Instructions

### 1. Create Power App

1. Go to [Power Apps](https://make.powerapps.com/)
2. Click "Create" → "Canvas app from blank"
3. Name: "Knowledge Assistant Admin Dashboard"
4. Format: Tablet

### 2. Add Data Sources

**Connections needed:**
- Custom Connector: Knowledge Assistant RAG API
  - Add connection to your backend API
  - Configure OAuth 2.0 authentication

- Office 365 Users
  - For user information and authentication

- Power BI (optional)
  - For advanced analytics visualizations

### 3. App Structure

#### Screen 1: Dashboard
**Controls:**
- `lblTitle`: "Knowledge Assistant Admin Dashboard"
- `galMetrics`: Gallery showing key metrics
  - Total Queries
  - Active Users
  - Avg Response Time
  - Satisfaction Score
- `chartQueryVolume`: Line chart showing query trends
- `chartTopQueries`: Bar chart showing most common queries

**OnVisible:**
```powerapp
Set(
    varMetrics,
    KnowledgeAssistantAPI.GetAnalytics().metrics
);
Set(
    varQueryVolume,
    KnowledgeAssistantAPI.GetAnalytics().timeSeries
);
```

#### Screen 2: Analytics
**Controls:**
- `drpTimeRange`: Dropdown for date range
  - Last 7 days
  - Last 30 days
  - Last 90 days
  - Custom range
- `galPerformanceMetrics`: Performance statistics
- `galFeedback`: User feedback summary
- `chartResponseTime`: Response time distribution
- `btnExport`: Export analytics data

**OnSelect (btnExport):**
```powerapp
Export(
    colAnalyticsData,
    "knowledge-assistant-analytics.csv"
);
```

#### Screen 3: Document Management
**Controls:**
- `galDocuments`: Gallery of indexed documents
  - Document title
  - Last updated
  - Source type
  - Reference count
- `btnUpload`: Upload new documents
- `btnReindex`: Trigger reindexing
- `txtSearch`: Search documents
- `lblDocCount`: Total document count

**OnSelect (btnReindex):**
```powerapp
KnowledgeAssistantAPI.TriggerReindex();
Notify("Reindexing started", NotificationType.Success);
```

#### Screen 4: System Health
**Controls:**
- `galServiceHealth`: Status of Azure services
  - Azure OpenAI: Operational/Down
  - Cognitive Search: Operational/Down
  - Backend API: Operational/Down
- `galErrors`: Recent errors
- `chartErrorRate`: Error rate over time
- `btnRefresh`: Refresh health status

**OnVisible:**
```powerapp
Set(
    varHealth,
    KnowledgeAssistantAPI.GetSystemHealth()
);
```

#### Screen 5: Configuration
**Controls:**
- `lblWarning`: "⚠️ Changes require admin approval"
- `sliderTopK`: Slider for top K documents
- `sliderTemperature`: Slider for temperature
- `txtMinRelevance`: Input for min relevance score
- `btnSaveConfig`: Save configuration
- `btnResetDefaults`: Reset to defaults

**OnSelect (btnSaveConfig):**
```powerapp
If(
    IsBlank(txtAdminPassword.Text),
    Notify("Admin password required", NotificationType.Error),
    KnowledgeAssistantAPI.UpdateConfig({
        topK: sliderTopK.Value,
        temperature: sliderTemperature.Value,
        minRelevance: Value(txtMinRelevance.Text)
    });
    Notify("Configuration updated", NotificationType.Success)
);
```

### 4. Navigation

Add a side navigation menu with icons:
```powerapp
// Component: cmpNavigation
Items: Table(
    {Icon: Icon.Home, Screen: scrDashboard, Name: "Dashboard"},
    {Icon: Icon.BarChart, Screen: scrAnalytics, Name: "Analytics"},
    {Icon: Icon.Document, Screen: scrDocuments, Name: "Documents"},
    {Icon: Icon.Health, Screen: scrHealth, Name: "System Health"},
    {Icon: Icon.Settings, Screen: scrConfig, Name: "Configuration"}
)

OnSelect:
Navigate(ThisItem.Screen, ScreenTransition.Fade)
```

### 5. Styling

**Theme:**
- Primary Color: #0078D4 (Microsoft Blue)
- Secondary Color: #50E6FF (Light Blue)
- Success: #107C10 (Green)
- Warning: #FFB900 (Amber)
- Error: #D83B01 (Red)
- Background: #F3F2F1 (Light Gray)
- Text: #201F1E (Dark Gray)

**Fonts:**
- Headings: Segoe UI Bold, 20px
- Body: Segoe UI, 14px
- Small: Segoe UI, 11px

### 6. Security

**Role-Based Access:**
```powerapp
If(
    User().Email in colAdmins.Email,
    Set(varIsAdmin, true),
    Navigate(scrAccessDenied)
);
```

**Data Row Level Security:**
- Filter data by department if not admin
- Mask sensitive information
- Audit all configuration changes

### 7. Deployment

1. **Test in Development**
   - Test all screens and functionality
   - Verify API connections
   - Check responsive design

2. **Publish to Production**
   - Click "Publish"
   - Add description of changes
   - Notify users of new version

3. **Share with Users**
   - Share app with Admin security group
   - Set appropriate permissions
   - Provide training materials

### 8. Maintenance

**Weekly:**
- Review analytics data
- Check for errors
- Monitor usage patterns

**Monthly:**
- Update app based on feedback
- Optimize performance
- Update documentation

## Sample Formulas

### Get Analytics Data
```powerapp
ClearCollect(
    colAnalytics,
    KnowledgeAssistantAPI.GetAnalytics({
        startDate: DateAdd(Today(), -30),
        endDate: Today(),
        granularity: "day"
    }).data
);
```

### Filter Documents
```powerapp
Filter(
    colDocuments,
    StartsWith(title, txtSearch.Text) Or
    category = drpCategory.Selected.Value
)
```

### Check System Health
```powerapp
Set(varIsHealthy, 
    And(
        varHealth.openai = true,
        varHealth.search = true,
        varHealth.api = true
    )
);
```

## Support

For issues or questions about the Power App, contact the Power Platform team.

