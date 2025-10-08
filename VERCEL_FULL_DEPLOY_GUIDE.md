# Deploy Full-Stack Knowledge Assistant to Vercel (100% FREE)

This guide deploys BOTH frontend and backend to a SINGLE Vercel project.

---

## ✅ Benefits

- **100% FREE** - No credit card required
- **Everything in one place** - Single URL, single dashboard
- **No CORS issues** - Same domain for frontend & API
- **Auto-deploy** - Connected to GitHub
- **Global CDN** - Super fast worldwide
- **Automatic HTTPS** - SSL certificate included

---

## 📋 Prerequisites

1. **Vercel account** (free) - https://vercel.com
2. **GitHub account** - Your repo is already there!
3. **Qdrant Cloud account** (free) - https://cloud.qdrant.io
4. **Groq API key** (free) - https://console.groq.com

---

## 🚀 Step-by-Step Deployment

### Step 1: Install Vercel CLI (Optional but Recommended)

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### Step 3: Deploy from GitHub (EASIEST)

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. **Import Git Repository:**
   - Select `Knowledge_Base_Assistant` from your GitHub repos
4. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (keep default)
   - **Build Command:** 
     ```bash
     cd frontend && npm install && npm run build
     ```
   - **Output Directory:** `frontend/dist`
   - **Install Command:**
     ```bash
     cd frontend && npm install && cd ../api && npm install
     ```

5. **Environment Variables** - Add these:
   ```env
   NODE_ENV=production
   QDRANT_URL=https://your-cluster-url.cloud.qdrant.io
   QDRANT_API_KEY=your-qdrant-api-key
   GROQ_API_KEY=your-groq-api-key
   QDRANT_COLLECTION=knowledge_base
   ```

6. Click **"Deploy"**

**Option B: Via CLI**

```bash
cd /Users/kedarpandya/Desktop/Academics/WEB-DEVELOPMENT/Knowledge_Assistant

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name: knowledge-assistant
# - Directory: ./ (press enter)
# - Override settings? Yes
# - Build Command: cd frontend && npm install && npm run build
# - Output Directory: frontend/dist
# - Development Command: (leave default)
```

Then set environment variables:

```bash
vercel env add QDRANT_URL
# Paste your Qdrant URL

vercel env add QDRANT_API_KEY
# Paste your Qdrant API key

vercel env add GROQ_API_KEY
# Paste your Groq API key

vercel env add QDRANT_COLLECTION
# Type: knowledge_base

vercel env add NODE_ENV
# Type: production
```

Redeploy:
```bash
vercel --prod
```

---

## 🎯 Your Deployment URLs

After deployment, you'll get:

**Frontend:**
```
https://knowledge-assistant.vercel.app
```

**API Endpoints:**
```
https://knowledge-assistant.vercel.app/api/health
https://knowledge-assistant.vercel.app/api/query
https://knowledge-assistant.vercel.app/api/stats
https://knowledge-assistant.vercel.app/api/documents
https://knowledge-assistant.vercel.app/api/documents/upload
```

**Note:** Frontend automatically uses `/api` path - no need to set `VITE_API_URL`!

---

## ✅ Test Your Deployment

### 1. Test Health Endpoint

```bash
curl https://knowledge-assistant.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "mode": "groq-fast-mode",
  "timestamp": "2025-10-08T...",
  "services": {
    "groq": "enabled",
    "qdrant": "https://...",
    "documentUpload": "enabled"
  }
}
```

### 2. Test Query Endpoint

```bash
curl -X POST https://knowledge-assistant.vercel.app/api/query \
  -H "Content-Type: application/json" \
  -d '{"question":"What is the vacation policy?"}'
```

### 3. Open Frontend

Visit: `https://knowledge-assistant.vercel.app`

Try asking questions and uploading documents!

---

## 📊 Project Structure

```
Knowledge_Assistant/
├── api/                      # Vercel Serverless Functions
│   ├── _lib/                 # Shared services
│   │   ├── groqRagService.ts
│   │   └── documentUploadService.ts
│   ├── documents/
│   │   ├── index.ts          # GET/POST/DELETE /api/documents
│   │   └── upload.ts         # POST /api/documents/upload
│   ├── health.ts             # GET /api/health
│   ├── query.ts              # POST /api/query
│   ├── stats.ts              # GET /api/stats
│   └── package.json
├── frontend/                 # React + Vite frontend
│   ├── src/
│   ├── dist/                 # Build output
│   └── package.json
└── vercel.json               # Vercel configuration
```

---

## 🔧 Update Frontend to Use Relative API URLs

The frontend should automatically use relative URLs (`/api/*`) which work on the same domain.

**In `frontend/src/App.tsx` and `frontend/src/components/DocumentUpload.tsx`:**

```typescript
// ✅ Good (relative URL - works on Vercel)
const API_URL = import.meta.env.VITE_API_URL || '';

// Then use:
axios.post(`${API_URL}/api/query`, { question: text })
```

No need to set `VITE_API_URL` environment variable in Vercel - it defaults to empty string, making URLs relative!

---

## 🔄 Auto-Deploy on Git Push

Vercel automatically redeploys when you push to GitHub!

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercel will:
1. Detect the push
2. Build your project
3. Deploy automatically
4. Notify you via email

---

## 📱 Environment Variables Management

### View all environment variables:
```bash
vercel env ls
```

### Add a new variable:
```bash
vercel env add VARIABLE_NAME
```

### Remove a variable:
```bash
vercel env rm VARIABLE_NAME
```

### Update via Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add/Edit/Delete variables
5. Redeploy if needed

---

## 🎨 Custom Domain (Optional)

### Add Your Own Domain

1. Go to **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `assistant.yourcompany.com`)
4. Follow DNS configuration instructions
5. Vercel automatically provisions SSL certificate

---

## 🚨 Troubleshooting

### Build Fails

**Check build logs:**
```bash
vercel logs
```

**Common issues:**
- Missing environment variables
- Wrong build command
- Dependency installation failed

**Solution:** Verify all environment variables are set in Vercel dashboard.

### API Returns 500 Error

**Check function logs:**
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Deployments** → Select latest deployment
4. Click **Functions** → Select the failing function
5. View logs

**Common issues:**
- Missing `GROQ_API_KEY`
- Invalid `QDRANT_URL`
- Qdrant cluster is paused

### CORS Errors

Shouldn't happen since frontend and API are on the same domain!

If you see CORS errors:
- Make sure you're using relative URLs (`/api/*`)
- Check browser console for actual error

---

## 📈 Monitor Performance

### Vercel Analytics (FREE)

1. Go to **Analytics** tab in Vercel dashboard
2. View:
   - Page load times
   - Core Web Vitals
   - Visitor stats
   - Geographic distribution

### Function Logs

Real-time logs in Vercel dashboard:
- Go to **Deployments**
- Select deployment
- Click **Functions**
- View logs for each API endpoint

---

## 💰 Cost

**100% FREE for:**
- Unlimited deployments
- 100GB bandwidth/month
- Serverless function executions
- Automatic HTTPS
- Global CDN

**You're well within the free tier!** 🎉

---

## 🎯 Next Steps

### 1. Load Sample Data into Qdrant

```bash
# Run locally first
cd /Users/kedarpandya/Desktop/Academics/WEB-DEVELOPMENT/Knowledge_Assistant
npm run load-data --prefix local/backend
```

This populates your Qdrant cluster with sample documents.

### 2. Test Document Upload

1. Visit your deployed app
2. Click the **Upload** button
3. Upload a `.txt` or `.md` file
4. Ask a question about it!

### 3. Share with Your Team

Send them the URL:
```
https://knowledge-assistant.vercel.app
```

---

## 🔐 Security Best Practices

1. **Never commit API keys** to GitHub
2. **Use environment variables** in Vercel dashboard
3. **Enable Vercel Authentication** (optional):
   - Go to **Settings** → **General**
   - Enable **Password Protection**
4. **Monitor usage** in Vercel dashboard

---

## 🆘 Need Help?

### Vercel Issues
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

### Qdrant Issues
- Docs: https://qdrant.tech/documentation/
- Discord: https://qdrant.to/discord

### Groq Issues
- Docs: https://console.groq.com/docs
- Support: https://console.groq.com/support

---

## ✨ You're All Set!

Your Knowledge Assistant is now:
- ✅ Deployed to Vercel
- ✅ 100% FREE
- ✅ Auto-deploys on GitHub push
- ✅ Global CDN for fast access
- ✅ Automatic HTTPS
- ✅ Professional & scalable

**Enjoy your AI-powered knowledge assistant!** 🎉

