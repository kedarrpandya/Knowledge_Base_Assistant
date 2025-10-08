# Deploy Backend to Vercel as Serverless Functions (FREE)

## 🚀 Why Vercel for Backend?
- **100% FREE** for hobby projects
- **Same platform as frontend** - easy management
- **Serverless** - auto-scales
- **No credit card required**

---

## ⚠️ Important Note

Vercel has **10-second timeout** for serverless functions on free tier. Since our Groq AI is fast (1-2 seconds), this works perfectly!

---

## 📋 Step-by-Step Deployment

### 1. Create `vercel.json` Configuration

This file routes all `/api/*` requests to our backend.

### 2. Create API Route Handlers

Vercel expects functions in `api/` directory.

### 3. Deploy

Same as frontend:
```bash
cd /Users/kedarpandya/Desktop/Academics/WEB-DEVELOPMENT/Knowledge_Assistant
vercel
```

Select:
- **Scope:** Your account
- **Link to existing project:** No
- **Project name:** knowledge-assistant-backend
- **Directory:** `./`
- **Build command:** Leave default
- **Output directory:** Leave default

### 4. Set Environment Variables

In Vercel dashboard:
```env
NODE_ENV=production
QDRANT_URL=https://your-cluster.cloud.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key
GROQ_API_KEY=your-groq-api-key
```

---

## 📁 Project Structure for Vercel

```
Knowledge_Assistant/
├── api/
│   ├── query.ts         # POST /api/query
│   ├── health.ts        # GET /api/health
│   ├── stats.ts         # GET /api/stats
│   └── documents/
│       ├── upload.ts    # POST /api/documents/upload
│       └── index.ts     # GET/DELETE /api/documents
├── vercel.json
└── ...
```

---

## 🔄 Alternative: One Vercel Project for Both

You can deploy BOTH frontend and backend in a SINGLE Vercel project:

1. Keep `frontend/` as is
2. Add `api/` folder at root
3. Update `vercel.json`:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/frontend/dist/$1"
    }
  ]
}
```

---

## ✅ Benefits

- **Everything in one place**
- **No CORS issues** (same domain)
- **Easier management**
- **100% FREE**

---

## 💰 Pricing

**FREE tier includes:**
- 100GB bandwidth/month
- Unlimited API calls
- Automatic HTTPS
- Global CDN

**Your app = FREE!** 🎉

---

## 🚨 Limitations

- **10-second timeout** (but Groq is fast, so OK!)
- **Stateless** (no file system persistence - but we use Qdrant, so OK!)

---

## 🎯 Recommendation

For simplicity, I recommend **Railway.app** - it's the easiest and most straightforward for this type of app.

But if you want everything in one Vercel project, I can set that up too!

