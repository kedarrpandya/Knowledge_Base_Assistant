# ⚡ Fast Setup - Get 1-2 Second Responses (FREE!)

Ollama is slow on CPU. Here are **FREE** alternatives that give you **1-2 second responses**:

## 🚀 Option 1: Groq (RECOMMENDED - Lightning Fast & Free)

Groq is **100x faster** than local Ollama and completely **FREE**!

### Setup (2 minutes):

1. **Get Free API Key**
   ```bash
   # Visit: https://console.groq.com
   # Sign up (free, no credit card)
   # Get your API key
   ```

2. **Install Groq SDK**
   ```bash
   cd backend
   npm install groq-sdk
   ```

3. **Update .env.local**
   ```bash
   # Add to backend/.env.local
   GROQ_API_KEY=your-groq-api-key-here
   USE_GROQ=true
   ```

4. **Update backend to use Groq**
   ```bash
   # Edit backend/src/index-local.ts
   # Change line 23 from:
   const ragService = new LocalRAGService();
   # To:
   const ragService = new GroqRAGService();
   
   # And add import at top:
   import { GroqRAGService } from './services/groqRagService';
   ```

5. **Restart backend**
   ```bash
   # Stop the current server (Ctrl+C)
   cd backend
   npx ts-node src/index-local.ts
   ```

**Result**: Responses in **1-2 seconds**! 🚀

### Groq Models Available (all free):
- `llama-3.1-8b-instant` - Super fast, great quality
- `mixtral-8x7b-32768` - Even better quality
- `gemma-7b-it` - Google's model

---

## 💚 Option 2: OpenAI Free Tier ($5 Free Credits)

No credit card required for trial!

### Setup:

1. **Get Free Credits**
   ```bash
   # Visit: https://platform.openai.com/signup
   # Sign up - get $5 free credits (no credit card)
   ```

2. **Install OpenAI SDK**
   ```bash
   cd backend
   npm install openai
   ```

3. **Update .env.local**
   ```bash
   OPENAI_API_KEY=sk-your-key-here
   USE_OPENAI=true
   ```

4. **Create OpenAI Service** (I can help with this)

**Speed**: 2-4 seconds per query
**Quality**: Best quality (GPT-3.5/GPT-4)

---

## 🎯 Option 3: Use a Faster Ollama Model

Keep it 100% local but use a smaller, faster model:

```bash
# Pull Phi model (3B parameters - much faster)
ollama pull phi

# Update .env.local
OLLAMA_MODEL=phi

# Restart backend
```

**Speed**: 5-15 seconds (better than Llama 2's 2+ minutes)

---

## 📊 Speed Comparison

| Option | Speed | Quality | Cost | Setup |
|--------|-------|---------|------|-------|
| **Groq** | ⚡ 1-2s | ⭐⭐⭐⭐ | FREE | 2 min |
| OpenAI Free | ⚡ 2-4s | ⭐⭐⭐⭐⭐ | $5 free | 3 min |
| Ollama Phi | 🐢 5-15s | ⭐⭐⭐ | FREE | 1 min |
| Ollama Llama2 | 🐌 2-3min | ⭐⭐⭐⭐ | FREE | Current |

---

## 🎬 Quick Start with Groq (Fastest)

Run this to switch to Groq in 30 seconds:

```bash
# 1. Get API key from https://console.groq.com (free signup)

# 2. Install SDK
cd backend && npm install groq-sdk

# 3. Add to .env.local
echo "GROQ_API_KEY=your-key-here" >> .env.local

# 4. Files already created for you! Just update the import.
```

Then edit `backend/src/index-local.ts` line 23:

```typescript
// Change from:
import { LocalRAGService } from './services/localRagService';
const ragService = new LocalRAGService();

// To:
import { GroqRAGService } from './services/groqRagService';
const ragService = new GroqRAGService();
```

**Done!** Restart and enjoy 1-2 second responses! 🎉

---

## Need Help?

I can update the code for you right now! Just tell me which option you prefer:

1. **Groq** (fastest, recommended)
2. **OpenAI** (best quality)
3. **Faster Ollama model** (keep it 100% local)

What would you like? 😊

