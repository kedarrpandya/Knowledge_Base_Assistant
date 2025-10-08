# 🚀 Deploy Local Version to Production

The "local" version can be deployed to production! Here are your options.

---

## Option 1: Deploy to VPS (DigitalOcean, Linode, AWS EC2)

**Cost:** $5-20/month  
**Best for:** Full control, custom domains

### Steps:

#### 1. **Setup Server**

```bash
# SSH into your server
ssh root@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh
```

#### 2. **Clone Your Project**

```bash
cd /var/www
git clone your-repo-url knowledge-assistant
cd knowledge-assistant
```

#### 3. **Setup Environment**

```bash
# Create .env.local
cat > .env.local << 'EOF'
GROQ_API_KEY=your_groq_key
QDRANT_URL=http://localhost:6333
OLLAMA_URL=http://localhost:11434
PORT=3000
NODE_ENV=production
EOF
```

#### 4. **Start Services**

```bash
# Start Docker services
docker compose -f local/docker-compose.local.yml up -d

# Install backend dependencies
cd backend
npm install --production

# Start backend with PM2 (keeps it running)
npm install -g pm2
pm2 start npx --name "knowledge-backend" -- ts-node ../local/backend/index-local.ts
pm2 save
pm2 startup
```

#### 5. **Build & Serve Frontend**

```bash
cd frontend
npm install
npm run build

# Serve with nginx
apt-get install -y nginx

# Create nginx config
cat > /etc/nginx/sites-available/knowledge-assistant << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/knowledge-assistant/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/knowledge-assistant /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 6. **Add SSL (Optional but Recommended)**

```bash
# Install certbot
apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d your-domain.com
```

**Done!** Your app is now at `https://your-domain.com`

---

## Option 2: Deploy to Railway.app

**Cost:** $5/month (includes $5 credit)  
**Best for:** Easy deployment, no DevOps needed

### Steps:

#### 1. **Prepare Your Repo**

Create `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && npx ts-node ../local/backend/index-local.ts",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Create `Procfile`:

```
web: cd backend && npx ts-node ../local/backend/index-local.ts
```

#### 2. **Deploy**

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Add services:
   - Add Qdrant (from template)
   - Add your app
7. Set environment variables:
   - `GROQ_API_KEY`
   - `QDRANT_URL` (from Qdrant service)
   - `PORT=3000`
8. Deploy!

**Frontend:** Deploy to Vercel or Netlify (free)

---

## Option 3: Deploy to Render.com

**Cost:** Free tier available  
**Best for:** Free hosting, simple setup

### Steps:

#### 1. **Create Web Service**

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect your GitHub repo
4. Configure:
   - **Name:** knowledge-assistant-backend
   - **Environment:** Node
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npx ts-node ../local/backend/index-local.ts`
   - **Instance Type:** Free or Starter ($7/month)

#### 2. **Add Qdrant**

Option A: Use Qdrant Cloud (free tier)
```bash
# Sign up at cloud.qdrant.io
# Get your cluster URL and API key
```

Option B: Deploy Qdrant to Render
- Add another web service
- Use Docker image: `qdrant/qdrant`

#### 3. **Environment Variables**

Add to Render dashboard:
```
GROQ_API_KEY=your_key
QDRANT_URL=your_qdrant_url
PORT=3000
NODE_ENV=production
```

#### 4. **Deploy Frontend**

Use Render Static Sites (free):
- Build Command: `cd frontend && npm install && npm run build`
- Publish Directory: `frontend/dist`

---

## Option 4: Docker Compose Production

**Cost:** Works on any Docker host  
**Best for:** Containerized deployment

### Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  # Qdrant vector database
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage
    restart: unless-stopped

  # Backend API
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3000:3000"
    environment:
      - GROQ_API_KEY=${GROQ_API_KEY}
      - QDRANT_URL=http://qdrant:6333
      - OLLAMA_URL=http://host.docker.internal:11434
      - PORT=3000
    depends_on:
      - qdrant
    restart: unless-stopped

  # Frontend (nginx)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  qdrant_data:
```

### Create `Dockerfile.backend`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./backend/
COPY local/backend ./local/backend

# Install dependencies
WORKDIR /app/backend
RUN npm install --production

# Expose port
EXPOSE 3000

# Start backend
CMD ["npx", "ts-node", "../local/backend/index-local.ts"]
```

### Create `frontend/Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Deploy:

```bash
docker compose -f docker-compose.prod.yml up -d
```

---

## Option 5: Kubernetes (Advanced)

**Cost:** Varies  
**Best for:** Enterprise scale, high availability

See `k8s/` folder for Kubernetes manifests (coming soon).

---

## 📊 Deployment Comparison

| Platform | Cost/Month | Difficulty | Best For |
|----------|-----------|------------|----------|
| **VPS (DigitalOcean)** | $5-20 | Medium | Full control |
| **Railway** | $5 | Easy | Quick deploy |
| **Render** | Free-$7 | Easy | Free tier |
| **Docker Compose** | Varies | Medium | Any Docker host |
| **Kubernetes** | Varies | Hard | Enterprise scale |

---

## 🔐 Production Security Checklist

Before deploying to production:

- [ ] Change default passwords
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Use a reverse proxy (nginx/Caddy)
- [ ] Enable CORS properly
- [ ] Set up logging
- [ ] Use PM2 or systemd for process management
- [ ] Configure health checks

---

## 🆚 Local vs Enterprise Deployment

### When to Use Local Deployment:
- ✅ Small team (<50 users)
- ✅ Budget conscious ($5-20/month)
- ✅ Simple deployment needs
- ✅ Don't need Azure/Power Platform
- ✅ Want full control

### When to Use Enterprise (Azure):
- ✅ Large organization
- ✅ Need Power Platform integration
- ✅ Require enterprise SLAs
- ✅ Need advanced compliance
- ✅ Global scale required
- ✅ Already using Azure

---

## 🚀 Quick Production Deploy

The fastest way to deploy:

```bash
# 1. Sign up for Railway.app
# 2. Push your code to GitHub
# 3. Connect Railway to your repo
# 4. Add environment variables
# 5. Deploy!

# Total time: 5 minutes
```

---

## 💡 Cost Optimization

### Cheapest Option (~$5/month):
- Railway backend ($5 includes credit)
- Vercel/Netlify frontend (free)
- Qdrant Cloud free tier
- Groq API free tier (15 RPM)

**Total: ~$5/month**

### Best Value (~$12/month):
- DigitalOcean Droplet ($6)
- Domain name ($1/month)
- Groq API free tier
- Self-hosted Qdrant

**Total: ~$7/month**

---

## 📚 Next Steps

1. Choose your deployment platform
2. Follow the guide above
3. Set up monitoring
4. Configure backups
5. Add custom domain
6. Enable SSL
7. Set up CI/CD (optional)

---

**Questions?** Check the troubleshooting section or create an issue!

