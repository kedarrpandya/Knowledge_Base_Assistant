# Vercel Deployment Setup Guide

## Current Issues Fixed

### 1. THREE.js Buffer Errors - FIXED
The `THREE.BufferGeometry: Buffer size too small for points data` errors have been fixed by:
- Pre-allocating fixed-size buffers
- Removing dynamic viewport dependencies
- Using proper buffer update methods

### 2. Mobile Header Visibility - FIXED
The brain logo now shows properly on mobile with:
- Semi-transparent background for visibility
- Backdrop blur for frosted glass effect
- Higher z-index to stay above 3D elements

## Critical: Fix the 500 API Error

Your `/api/query` endpoint is returning **500 Internal Server Error** because environment variables are missing.

### Steps to Fix:

#### 1. Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Click on your project: `Knowledge_Base_Assistant`
3. Go to **Settings** → **Environment Variables**

#### 2. Add These Environment Variables

Add the following 4 environment variables (click "Add" for each):

| Variable Name | Value | Where to Get It |
|--------------|-------|-----------------|
| `GROQ_API_KEY` | `gsk_...` | https://console.groq.com/keys |
| `QDRANT_URL` | `https://xyz.aws.cloud.qdrant.io` | https://cloud.qdrant.io/ (Your cluster URL) |
| `QDRANT_API_KEY` | Your Qdrant API key | Qdrant Cloud → API Keys |
| `QDRANT_COLLECTION` | `knowledge_base` | Just type this exactly |

**Important:** After adding environment variables, click **"Redeploy"** to apply them!

#### 3. Get Your API Keys (if you don't have them)

**GROQ API Key (FREE):**
1. Go to https://console.groq.com/
2. Sign up/login
3. Click "API Keys" → "Create API Key"
4. Copy the key (starts with `gsk_`)

**Qdrant Cloud (FREE):**
1. Go to https://cloud.qdrant.io/
2. Sign up/login
3. Create a cluster (free tier)
4. Copy the **Cluster URL** (e.g., `https://xyz-abc.us-east.aws.cloud.qdrant.io`)
5. Go to "API Keys" → Create key → Copy it

#### 4. Verify It's Working

After redeploying with environment variables:

1. Wait ~60 seconds for deployment
2. Open your site
3. Try asking a question
4. Check browser console - the 500 error should be gone!

## Current Deployment Status

- **Frontend:** Deployed on Vercel
- **API Functions:** Deployed on Vercel (serverless)
- **Vector DB:** Qdrant Cloud (free tier)
- **LLM:** Groq API (free tier)

## Total Cost: $0/month

Your entire production deployment is running on free tiers!

## What Was Just Fixed

1. **THREE.js errors** - Fixed buffer allocation issues
2. **Mobile header** - Made logo visible on all screen sizes
3. **Brain logo first load** - Fixed hydration issue (from previous commit)

## Next Step

**ADD THE ENVIRONMENT VARIABLES IN VERCEL** and redeploy. That's the only thing blocking your app from working perfectly!

## Need Help?

If you still see errors after adding environment variables:
1. Open browser console (F12)
2. Check the Network tab
3. Look at the `/api/query` request
4. Share the error details

