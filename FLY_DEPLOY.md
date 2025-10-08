# Deploy Backend to Fly.io (FREE)

## 🚀 Why Fly.io?
- **Generous FREE tier** (3 VMs, 160GB bandwidth/month)
- **Global edge network** - super fast
- **Docker-based** - reliable
- **No credit card required for free tier**

---

## 📋 Step-by-Step Deployment

### 1. Install Fly CLI

**macOS:**
```bash
brew install flyctl
```

**Windows:**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

### 2. Sign Up & Login
```bash
fly auth signup
# OR if you already have an account:
fly auth login
```

### 3. Create Dockerfile

I'll create this for you in the next step.

### 4. Initialize Fly App

```bash
cd /Users/kedarpandya/Desktop/Academics/WEB-DEVELOPMENT/Knowledge_Assistant
fly launch --no-deploy
```

Answer the prompts:
- **App name:** knowledge-assistant-backend (or choose your own)
- **Region:** Choose closest to you
- **PostgreSQL:** No
- **Redis:** No

### 5. Set Environment Variables

```bash
fly secrets set NODE_ENV=production
fly secrets set QDRANT_URL=https://your-cluster.cloud.qdrant.io
fly secrets set QDRANT_API_KEY=your-qdrant-api-key
fly secrets set GROQ_API_KEY=your-groq-api-key
```

### 6. Deploy!

```bash
fly deploy
```

Your app will be live at:
```
https://knowledge-assistant-backend.fly.dev
```

---

## ✅ Verify Deployment

```bash
curl https://knowledge-assistant-backend.fly.dev/health
```

---

## 🔧 Useful Commands

**View logs:**
```bash
fly logs
```

**Check status:**
```bash
fly status
```

**SSH into app:**
```bash
fly ssh console
```

**Scale down to save resources:**
```bash
fly scale count 1
```

---

## 💰 Pricing

**FREE Tier includes:**
- 3 shared-cpu-1x VMs
- 160GB bandwidth/month
- Automatic HTTPS

**Your app uses 1 VM = FREE!** 🎉

---

## 📊 Monitor

View dashboard:
```bash
fly dashboard
```

Or visit: https://fly.io/dashboard

