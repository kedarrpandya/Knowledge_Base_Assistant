# 🚀 Quick Deploy to Vercel (5 Minutes)

Your Knowledge Assistant is ready to deploy to Vercel with BOTH frontend and backend in ONE project!

---

## ✨ What's Been Created

```
Knowledge_Assistant/
├── api/                          ✅ NEW - Vercel Serverless Backend
│   ├── _lib/
│   │   ├── groqRagService.ts     # AI + RAG logic
│   │   └── documentUploadService.ts  # Document handling
│   ├── documents/
│   │   ├── index.ts              # GET/POST/DELETE documents
│   │   └── upload.ts             # File upload
│   ├── health.ts                 # Health check
│   ├── query.ts                  # AI queries
│   ├── stats.ts                  # System stats
│   └── package.json              # API dependencies
├── frontend/                     ✅ UPDATED - React frontend
│   └── src/
│       ├── App.tsx               # Uses relative URLs
│       └── components/
│           └── DocumentUpload.tsx
└── vercel.json                   ✅ NEW - Vercel config
```

---

## 🎯 Deploy Now (3 Steps)

### Step 1: Go to Vercel Dashboard

1. Visit: https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. **Import** your `Knowledge_Base_Assistant` repo from GitHub

### Step 2: Configure Project

Vercel will auto-detect settings, but verify:

- **Framework Preset:** Vite ✅ (auto-detected)
- **Root Directory:** `./` ✅ (default)
- **Build Command:**
  ```bash
  cd frontend && npm install && npm run build
  ```
- **Output Directory:** `frontend/dist`

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add:

| Variable | Value | Where to Get |
|----------|-------|--------------|
| `GROQ_API_KEY` | `gsk_...` | https://console.groq.com |
| `QDRANT_URL` | `https://...cloud.qdrant.io` | https://cloud.qdrant.io |
| `QDRANT_API_KEY` | `your-key` | Qdrant dashboard |
| `QDRANT_COLLECTION` | `knowledge_base` | Type this |
| `NODE_ENV` | `production` | Type this |

### Step 4: Deploy!

Click **"Deploy"** and wait 2-3 minutes.

---

## ✅ Done!

Your app will be live at:
```
https://knowledge-assistant.vercel.app
```

API endpoints:
```
https://knowledge-assistant.vercel.app/api/health
https://knowledge-assistant.vercel.app/api/query
https://knowledge-assistant.vercel.app/api/stats
https://knowledge-assistant.vercel.app/api/documents
```

---

## 🧪 Test It

### 1. Health Check
```bash
curl https://knowledge-assistant.vercel.app/api/health
```

### 2. Ask a Question
```bash
curl -X POST https://knowledge-assistant.vercel.app/api/query \
  -H "Content-Type: application/json" \
  -d '{"question":"What is the vacation policy?"}'
```

### 3. Open in Browser

Visit `https://knowledge-assistant.vercel.app` and try:
- Asking questions
- Uploading documents
- Viewing the beautiful 3D UI!

---

## 🔄 Auto-Deploy

Every time you push to GitHub, Vercel automatically redeploys:

```bash
git add .
git commit -m "Update feature"
git push
```

Vercel will build and deploy in 2-3 minutes!

---

## 💡 Tips

### Local Development

For local development, create `.env.local` in `frontend/`:
```env
VITE_API_URL=http://localhost:3000
```

Then run:
```bash
# Terminal 1 - Backend
cd local/backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Vercel Deployment

On Vercel, leave `VITE_API_URL` unset (or empty). Frontend will use relative URLs (`/api/*`) which work on the same domain!

---

## 📊 What You Get

### FREE Features:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Global CDN (fast worldwide)
- ✅ Automatic HTTPS
- ✅ Auto-deploy on git push
- ✅ Preview deployments for PRs
- ✅ Analytics dashboard

### No More Worrying About:
- ❌ Server management
- ❌ SSL certificates
- ❌ Scaling
- ❌ CORS issues
- ❌ Multiple deployments

---

## 🆘 Troubleshooting

### Build Fails?

Check environment variables are set correctly in Vercel dashboard.

### API Returns 404?

Vercel needs a few minutes after first deploy to activate serverless functions. Wait 2-3 minutes and try again.

### CORS Errors?

Make sure frontend is NOT setting `VITE_API_URL` - let it use relative URLs!

---

## 📚 Full Guide

For detailed instructions, see: **[VERCEL_FULL_DEPLOY_GUIDE.md](./VERCEL_FULL_DEPLOY_GUIDE.md)**

---

## 🎉 That's It!

Your enterprise-grade Knowledge Assistant is now:
- ✅ Deployed to Vercel
- ✅ 100% FREE
- ✅ Production-ready
- ✅ Auto-scaling
- ✅ Globally distributed

**Start using it now!** 🚀

