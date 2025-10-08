# Deploy Backend to Railway.app (FREE)

## 🚀 Why Railway?
- **$5 FREE credit monthly** (enough for this app)
- **Auto-detects Node.js** - no config needed
- **Easy GitHub integration**
- **Built-in environment variables UI**
- **Faster than Render**

---

## 📋 Step-by-Step Deployment

### 1. Sign Up
1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Sign in with GitHub

### 2. Deploy from GitHub
1. Click **"Deploy from GitHub repo"**
2. Select `Knowledge_Base_Assistant` repository
3. Railway will auto-detect it's a Node.js app

### 3. Configure Build & Start Commands

Railway should auto-detect, but if needed, set:

**Root Directory:** `backend`

**Build Command:**
```bash
npm install && npm install --prefix ../local/backend express helmet cors compression morgan dotenv multer groq-sdk ollama @qdrant/js-client-rest && npm install --prefix ../local/backend --save-dev @types/express @types/cors @types/compression @types/morgan @types/multer @types/node typescript
```

**Start Command:**
```bash
npx ts-node ../local/backend/index-local.ts
```

### 4. Add Environment Variables

In Railway dashboard → Your service → **Variables** tab:

```env
NODE_ENV=production
API_PORT=3000
QDRANT_URL=https://your-cluster.cloud.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key
GROQ_API_KEY=your-groq-api-key
```

### 5. Deploy!

Railway will automatically deploy. You'll get a URL like:
```
https://knowledge-assistant-backend-production.up.railway.app
```

### 6. Use This URL in Vercel

In your Vercel dashboard, set:
```
VITE_API_URL=https://your-railway-app.up.railway.app
```

---

## ✅ Verify Deployment

Test your Railway backend:
```bash
curl https://your-railway-app.up.railway.app/health
```

Should return:
```json
{
  "status": "healthy",
  "mode": "groq-fast-mode",
  "services": {
    "groq": "enabled",
    "qdrant": "https://...",
    "documentUpload": "enabled"
  }
}
```

---

## 💰 Pricing

- **$5 FREE monthly credit**
- This app uses ~$2-3/month
- **No credit card required for free tier**

---

## 🔧 Troubleshooting

**If build fails:**
1. Go to **Settings** → **Build Command**
2. Paste the build command above
3. Set **Start Command** to the start command above
4. Redeploy

**If app crashes:**
1. Check **Logs** tab in Railway dashboard
2. Make sure all environment variables are set
3. Verify Qdrant and Groq API keys are correct

---

## 📊 Monitor Usage

Railway dashboard shows:
- CPU usage
- Memory usage
- Network usage
- Monthly credit remaining

**Your app should use < $3/month** = FREE! 🎉

