# Vercel Dashboard Settings

## ⚠️ IMPORTANT: Manual Configuration Required

Vercel dashboard settings override `vercel.json`. You need to manually configure these in the dashboard.

---

## 🔧 Build & Development Settings

Go to: **Project Settings** → **General** → **Build & Development Settings**

### Framework Preset
```
Vite
```

### Root Directory
```
frontend
```
*✅ Check "Include source files outside of the Root Directory in the Build Step"*

### Build Command
**Override:** `npm run build`

### Output Directory
**Override:** `dist`

### Install Command
**Override:** `npm install`

---

## 🌍 Environment Variables

Go to: **Project Settings** → **Environment Variables**

Add these for **Production**, **Preview**, and **Development**:

| Variable | Value | Required |
|----------|-------|----------|
| `GROQ_API_KEY` | `gsk_...` | ✅ Yes |
| `QDRANT_URL` | `https://xxx.cloud.qdrant.io` | ✅ Yes |
| `QDRANT_API_KEY` | `your-key` | ✅ Yes |
| `QDRANT_COLLECTION` | `knowledge_base` | ✅ Yes |
| `NODE_ENV` | `production` | ✅ Yes |

---

## 📁 Functions

The `/api` directory will automatically be detected as serverless functions since it's in the root.

---

## 🔄 After Configuring

1. Save all settings
2. Go to **Deployments**
3. Click the **three dots** on the latest deployment
4. Click **Redeploy**
5. Select **"Use existing Build Cache"** → **NO**
6. Click **Redeploy**

---

## ✅ Expected Build Flow

```
1. Detecting Project Settings...
   ✓ Framework: Vite
   ✓ Root Directory: frontend

2. Installing dependencies...
   ✓ npm install (in frontend/)
   ✓ Installs all dependencies including @types/node, vite

3. Building...
   ✓ npm run build
   ✓ tsc -b && vite build
   ✓ Build successful

4. Uploading...
   ✓ frontend/dist → CDN
   ✓ /api → Serverless Functions

5. Deployment Ready!
   ✓ https://your-app.vercel.app
```

---

## 🎯 Key Points

1. **Root Directory = `frontend`**
   - This makes Vercel treat frontend as the main app
   - All dependencies will be installed correctly
   
2. **Include source files outside Root Directory**
   - This allows `/api` to be included as serverless functions
   
3. **No custom install/build commands needed**
   - Let Vercel auto-detect for Vite projects

---

## 🚨 Troubleshooting

### If build still fails:

1. **Clear all build caches**
2. **Remove custom commands** - let Vercel auto-detect
3. **Ensure Root Directory = `frontend`**
4. **Make sure all env vars are set**
5. **Redeploy without cache**

### If API doesn't work:

1. Check `/api` folder is at repository root (not inside frontend)
2. Verify environment variables are set
3. Check function logs in Vercel dashboard

