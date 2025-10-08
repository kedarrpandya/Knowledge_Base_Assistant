# 🆓 **FREE Deployment Guide**

Deploy your Knowledge Assistant for **$0/month** using free tiers!

---

## 🌐 **Architecture**

```
Frontend (Vercel FREE)
    ↓
Backend (Render.com FREE)
    ↓
Vector DB (Qdrant Cloud FREE)
    ↓
LLM (Groq API FREE)
```

**Total Monthly Cost: $0** ✨

---

## 📊 **Free Tier Limits**

| Service | Free Tier |
|---------|-----------|
| **Vercel** | Unlimited deployments, 100GB bandwidth |
| **Render.com** | 750 hours/month, sleeps after 15 min inactivity |
| **Qdrant Cloud** | 1GB storage, 1 cluster |
| **Groq API** | 15 requests/minute, 6000 tokens/minute |

---

## 🚀 **Step-by-Step Deployment**

### **1. Deploy Frontend to Vercel**

#### A. Install Vercel CLI
```bash
npm install -g vercel
```

#### B. Login to Vercel
```bash
vercel login
```

#### C. Deploy Frontend
```bash
cd frontend
vercel
```

Follow prompts:
- Project name: `knowledge-assistant`
- Framework: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

#### D. Set Environment Variable
After deployment, update `frontend/src/App.tsx` and `frontend/src/components/DocumentUpload.tsx`:

```typescript
// Change from
const API_URL = 'http://localhost:3000';

// To
const API_URL = 'https://your-backend.onrender.com';
```

Then redeploy:
```bash
vercel --prod
```

**Your frontend will be live at:** `https://knowledge-assistant.vercel.app`

---

### **2. Set Up Qdrant Cloud**

#### A. Sign Up
1. Go to https://cloud.qdrant.io
2. Create account (GitHub or Email)
3. Click "Create Cluster"
4. Choose "Free Tier" (1GB)
5. Select region closest to you

#### B. Get API Credentials
1. Go to "API Keys" section
2. Copy:
   - **Cluster URL**: `https://xxxxx-xxxxx.aws.cloud.qdrant.io`
   - **API Key**: `your-api-key-here`

---

### **3. Get Groq API Key**

#### A. Sign Up for Groq
1. Go to https://console.groq.com
2. Sign up (Google/GitHub)
3. Go to "API Keys"
4. Click "Create API Key"
5. Copy the key

**Free Tier**: 15 requests/min, 6000 tokens/min

---

### **4. Deploy Backend to Render.com**

#### A. Create `render.yaml`
Create this file in your project root:

```yaml
services:
  - type: web
    name: knowledge-assistant-backend
    env: node
    buildCommand: "cd backend && npm install && cd ../local/backend && npm install"
    startCommand: "cd backend && npx ts-node ../local/backend/index-local.ts"
    envVars:
      - key: NODE_ENV
        value: production
      - key: QDRANT_URL
        sync: false
      - key: QDRANT_API_KEY
        sync: false
      - key: GROQ_API_KEY
        sync: false
      - key: API_PORT
        value: 10000
```

#### B. Push to GitHub
```bash
git add .
git commit -m "Add render.yaml for deployment"
git push
```

#### C. Deploy on Render
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repo: `Knowledge_Base_Assistant`
5. Click "Connect"
6. Render will auto-detect `render.yaml`
7. Click "Apply"

#### D. Set Environment Variables
In Render dashboard:
1. Go to your service → "Environment"
2. Add these variables:
   ```
   QDRANT_URL=https://your-cluster.aws.cloud.qdrant.io
   QDRANT_API_KEY=your-qdrant-api-key
   GROQ_API_KEY=your-groq-api-key
   API_PORT=10000
   ```
3. Click "Save Changes"

**Your backend will be live at:** `https://knowledge-assistant-backend.onrender.com`

---

### **5. Update Frontend API URL**

Update in both files:
- `frontend/src/App.tsx`
- `frontend/src/components/DocumentUpload.tsx`

```typescript
const API_URL = 'https://knowledge-assistant-backend.onrender.com';
```

Redeploy frontend:
```bash
cd frontend
vercel --prod
```

---

### **6. Load Initial Data**

From your local machine:

```bash
# Set environment variables
export QDRANT_URL="https://your-cluster.aws.cloud.qdrant.io"
export QDRANT_API_KEY="your-qdrant-api-key"

# Load sample data
cd backend
npx ts-node ../local/scripts/load-local-data.ts
```

---

## ✅ **Test Your Deployment**

### Test Backend
```bash
curl https://knowledge-assistant-backend.onrender.com/health
```

Expected:
```json
{
  "status": "healthy",
  "mode": "groq-fast-mode",
  "services": {
    "groq": "enabled",
    "qdrant": "https://..."
  }
}
```

### Test Query
```bash
curl -X POST https://knowledge-assistant-backend.onrender.com/api/query \
  -H "Content-Type: application/json" \
  -d '{"question":"What is the vacation policy?"}'
```

### Visit Frontend
Open: `https://knowledge-assistant.vercel.app`

---

## 🔄 **Continuous Deployment**

### Auto-deploy on Git Push

**Vercel** (Frontend):
- Automatically deploys on every `git push` to `main`

**Render** (Backend):
- Automatically deploys on every `git push` to `main`

Just push your code:
```bash
git add .
git commit -m "Update feature"
git push
```

Both will redeploy automatically! 🎉

---

## ⚠️ **Important Notes**

### Render Free Tier Limitations
- **Sleep after 15 min inactivity**
- First request after sleep takes ~30-60 seconds
- Solution: Use a cron job to ping every 14 minutes (external service like cron-job.org)

### Keep Backend Awake (Optional)
1. Go to https://cron-job.org (free)
2. Create account
3. Add job:
   - URL: `https://knowledge-assistant-backend.onrender.com/health`
   - Schedule: Every 14 minutes

---

## 📦 **Alternative FREE Options**

### Option 2: Railway.app
- Better performance than Render
- 500 hours/month free
- No sleep timeout
- Deploy: https://railway.app

### Option 3: Fly.io
- 3 VMs free
- Better global performance
- More complex setup
- Deploy: https://fly.io

### Option 4: DigitalOcean App Platform
- $0 for first 30 days
- Then $5/month for basic app
- Best performance
- Deploy: https://cloud.digitalocean.com

---

## 🎉 **You're Live!**

Your Knowledge Assistant is now:
- ✅ Deployed globally
- ✅ Costing $0/month
- ✅ Auto-deploying on every push
- ✅ Scalable to thousands of users
- ✅ With document upload capability

---

## 🆘 **Troubleshooting**

### Frontend can't reach backend
- Check CORS is enabled (already set in backend)
- Verify API_URL in frontend matches backend URL
- Check Render logs for errors

### Slow first response
- Expected on Render free tier (cold start)
- Use cron job to keep awake

### Qdrant connection error
- Verify QDRANT_URL and QDRANT_API_KEY are correct
- Check cluster is running in Qdrant dashboard
- Ensure API key has read/write permissions

### Groq rate limit
- Free tier: 15 req/min
- Upgrade to paid if needed ($0.27/1M tokens)
- Or switch to OpenAI

---

## 🔐 **Security Best Practices**

1. **Never commit `.env` files**
2. **Use Render environment variables** for secrets
3. **Enable CORS only for your domain** (in production):
   ```typescript
   app.use(cors({
     origin: 'https://knowledge-assistant.vercel.app'
   }));
   ```
4. **Add rate limiting** (optional):
   ```bash
   npm install express-rate-limit
   ```

---

## 📊 **Monitoring**

### Vercel Analytics (FREE)
1. Go to Vercel Dashboard
2. Enable "Analytics" for your project
3. Track: visitors, performance, errors

### Render Logs
1. Go to Render Dashboard
2. Click your service → "Logs"
3. View real-time logs

### Uptime Monitoring (FREE)
- UptimeRobot: https://uptimerobot.com
- Monitor: `https://knowledge-assistant-backend.onrender.com/health`
- Get alerts when down

---

## 🚀 **Next Steps**

1. **Custom Domain** (optional)
   - Vercel: Add custom domain in settings
   - Free SSL included

2. **Authentication** (optional)
   - Add Clerk: https://clerk.dev (free tier)
   - Protect routes

3. **Analytics** (optional)
   - Google Analytics
   - Plausible Analytics

4. **More Features**
   - Document versioning
   - User permissions
   - Search history
   - Document categories

---

## 💡 **Cost if Scaling Beyond Free Tier**

| Service | Paid Tier |
|---------|-----------|
| Vercel | $20/month (Pro) |
| Render | $7/month (Starter) |
| Qdrant Cloud | $25/month (1GB-100GB) |
| Groq | $0.27 per 1M tokens |

Still very affordable! 🎯

---

## ✨ **You Did It!**

Your enterprise-grade Knowledge Assistant is now:
- Running in production
- Handling real users
- Costing nothing
- Looking beautiful

**Share your deployment!** 🎉

Need help? Check the main README or open an issue on GitHub.

