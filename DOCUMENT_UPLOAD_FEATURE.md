# 📄 **Document Upload Feature**

## Overview

Your Knowledge Assistant now supports **user document uploads**! Organizations can add their own proprietary data to train the AI assistant with their specific knowledge base.

---

## ✨ **Features**

### 1. **Multiple Upload Methods**
- **Text Input**: Paste content directly
- **File Upload**: Upload `.txt`, `.json`, `.md` files
- **API Integration**: Programmatic uploads via REST API

### 2. **Rich Metadata**
- Document title
- Category (general, policy, procedure, FAQ, documentation)
- Author information
- Custom tags
- Auto-timestamps

### 3. **Instant Indexing**
- Documents are vectorized immediately
- Available for AI search within seconds
- No manual reindexing needed

### 4. **Beautiful UI**
- Apple-style liquid glass modal
- Drag-and-drop file support
- Real-time upload progress
- Success/error feedback

---

## 🎯 **Use Cases**

### For Organizations
- Add company policies
- Upload procedure documents
- Index FAQs
- Store internal documentation
- Train AI on proprietary knowledge

### For Individuals
- Personal knowledge base
- Research notes
- Study materials
- Documentation library

---

## 🚀 **How to Use**

### **Via UI**

1. **Click Upload Button** (bottom-right floating button with upload icon)

2. **Choose Upload Method**:
   
   **Option A: Text Input**
   - Enter document title
   - Paste content in textarea
   - Select category
   - Add author (optional)
   - Click "Add to Knowledge Base"
   
   **Option B: File Upload**
   - Click file input
   - Select `.txt`, `.json`, or `.md` file
   - Optionally customize title
   - Select category
   - Click "Upload File"

3. **See Confirmation**
   - Green success message appears
   - Document ID is generated
   - Modal auto-closes after 3 seconds

4. **Search Immediately**
   - Ask questions about the uploaded content
   - AI will reference your document
   - See sources in responses

---

### **Via API**

#### **Upload Text Document**

```bash
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Company Vacation Policy 2025",
    "content": "Employees receive 15 days of paid vacation annually...",
    "category": "policy",
    "author": "HR Department",
    "tags": ["vacation", "HR", "policy"]
  }'
```

Response:
```json
{
  "success": true,
  "message": "✅ Document 'Company Vacation Policy 2025' has been successfully added to the knowledge base! It's now available for AI-powered search.",
  "documentId": "company-vacation-policy-2025-1704987654321"
}
```

#### **Upload File**

```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -F "file=@/path/to/document.txt" \
  -F "category=documentation" \
  -F "author=John Doe"
```

#### **List All Documents**

```bash
curl http://localhost:3000/api/documents
```

Response:
```json
{
  "success": true,
  "documents": [
    {
      "id": "company-vacation-policy-2025-1704987654321",
      "title": "Company Vacation Policy 2025",
      "category": "policy",
      "author": "HR Department",
      "uploadedAt": "2025-10-08T14:30:00.000Z"
    }
  ]
}
```

#### **Delete Document**

```bash
curl -X DELETE http://localhost:3000/api/documents/company-vacation-policy-2025-1704987654321
```

---

## 🏗️ **Architecture**

```
Frontend (DocumentUpload.tsx)
    ↓
Backend API (/api/documents)
    ↓
DocumentUploadService
    ↓
LocalRAGService
    ↓
Qdrant Vector Database
```

---

## 📁 **New Files Added**

### Backend
1. **`local/backend/documentUploadService.ts`**
   - Handles document uploads
   - Validates input
   - Generates unique IDs
   - Manages file extraction

2. **`local/backend/index-local.ts`** (updated)
   - Added upload endpoints
   - Integrated multer for file handling
   - Added list/delete routes

3. **`local/backend/localRagService.ts`** (updated)
   - Added `deleteDocument()` method
   - Added `listAllDocuments()` method

### Frontend
1. **`frontend/src/components/DocumentUpload.tsx`**
   - Beautiful upload modal
   - Form validation
   - File handling
   - Real-time feedback

2. **`frontend/src/App.tsx`** (updated)
   - Integrated DocumentUpload component

### Dependencies
1. **`backend/package-local.json`** (updated)
   - Added `multer` for file uploads
   - Added `@types/multer`

---

## 📝 **Supported File Formats**

| Format | Extension | Notes |
|--------|-----------|-------|
| Plain Text | `.txt` | UTF-8 encoded |
| Markdown | `.md` | Preserves formatting |
| JSON | `.json` | Auto-parsed |

### Coming Soon
- `.pdf` (requires pdf-parse)
- `.docx` (requires mammoth)
- `.html` (requires cheerio)
- `.csv` (requires csv-parser)

---

## 🔒 **Security Features**

### Input Validation
- Title: Required, non-empty
- Content: Minimum 10 characters
- File size: Maximum 10MB
- Content length: Maximum 1MB

### Sanitization
- Title sanitization for ID generation
- Content validation
- File type checking
- MIME type verification

### Rate Limiting (Recommended)
Add to `index-local.ts`:
```typescript
import rateLimit from 'express-rate-limit';

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per window
  message: 'Too many uploads, please try again later.'
});

app.use('/api/documents', uploadLimiter);
```

---

## 🎨 **UI Components**

### Upload Button
- Fixed position (bottom-right)
- Floating action button
- Animated on hover
- Upload icon

### Modal
- Apple liquid glass theme
- Responsive design
- Mobile-friendly
- Smooth animations

### Form Fields
- Title input
- Content textarea
- File input (drag-drop ready)
- Category dropdown
- Author input

### Feedback
- Success message (green)
- Error message (red)
- Loading spinner
- Auto-close on success

---

## 🔧 **Customization**

### Add New Categories
In `DocumentUpload.tsx`:
```typescript
<select value={category} onChange={(e) => setCategory(e.target.value)}>
  <option value="general">General</option>
  <option value="policy">Policy</option>
  <option value="procedure">Procedure</option>
  <option value="faq">FAQ</option>
  <option value="documentation">Documentation</option>
  <option value="research">Research</option>  {/* New */}
  <option value="training">Training</option>  {/* New */}
</select>
```

### Increase File Size Limit
In `index-local.ts`:
```typescript
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});
```

### Add PDF Support
```bash
npm install pdf-parse
```

In `documentUploadService.ts`:
```typescript
import pdf from 'pdf-parse';

case 'pdf':
  const pdfData = await pdf(fileBuffer);
  return {
    title: fileName,
    content: pdfData.text
  };
```

---

## 🧪 **Testing**

### Test Upload via UI
1. Start backend: `cd backend && npx ts-node ../local/backend/index-local.ts`
2. Start frontend: `cd frontend && npm run dev`
3. Click upload button
4. Paste sample text
5. Submit

### Test Upload via API
```bash
# Create test file
echo "This is a test document about company policies." > test.txt

# Upload
curl -X POST http://localhost:3000/api/documents/upload \
  -F "file=@test.txt" \
  -F "category=policy"

# List documents
curl http://localhost:3000/api/documents

# Query
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question":"What does the test document say?"}'
```

---

## 📊 **Analytics & Monitoring**

### Track Uploads
Add analytics in `documentUploadService.ts`:
```typescript
console.log(`📄 Document uploaded: ${document.title}`);
console.log(`   Category: ${document.category}`);
console.log(`   Author: ${document.author}`);
console.log(`   Size: ${document.content.length} chars`);
```

### Monitor Storage
```bash
curl http://localhost:3000/api/stats
```

---

## 🚀 **Production Deployment**

### Environment Variables
```bash
# .env.production
MAX_FILE_SIZE=10485760  # 10MB
MAX_DOCUMENTS=1000
UPLOAD_RATE_LIMIT=10
```

### Storage Considerations
- Qdrant free tier: 1GB
- Average document: ~10KB
- Capacity: ~100,000 documents

### Scaling
- Upgrade Qdrant for more storage
- Add document expiration
- Implement archiving
- Use object storage (S3) for files

---

## ✅ **What You Can Do Now**

### Immediate
- ✅ Upload documents via UI
- ✅ Upload documents via API
- ✅ Search uploaded content
- ✅ List all documents
- ✅ Delete documents

### Organizations Can
- ✅ Train AI on company data
- ✅ Add proprietary documentation
- ✅ Create custom knowledge bases
- ✅ Update content in real-time
- ✅ Manage document lifecycle

---

## 🎉 **Success Message**

When a user uploads a document, they see:

> ✅ Document "Your Document Title" has been successfully added to the knowledge base! It's now available for AI-powered search.

This confirms:
- Document was accepted
- Vectorization succeeded
- Now searchable by AI
- Ready for queries

---

## 🆘 **Troubleshooting**

### "File too large"
- Check file size limit (default 10MB)
- Compress or split large files

### "Unsupported file type"
- Currently supports: `.txt`, `.json`, `.md`
- Convert other formats first

### "Title is required"
- Provide a title when uploading
- Auto-generated from filename if blank

### "Document not appearing in search"
- Wait 1-2 seconds for indexing
- Check document was uploaded successfully
- Verify Qdrant is running

---

## 🔮 **Future Enhancements**

1. **Bulk Upload**
   - Upload multiple files at once
   - Folder upload
   - ZIP file extraction

2. **Document Management**
   - Edit existing documents
   - Version history
   - Duplicate detection

3. **Advanced Features**
   - OCR for images
   - Audio transcription
   - Video subtitles

4. **Collaboration**
   - Document sharing
   - User permissions
   - Team workspaces

---

## 📖 **Documentation**

For more details, see:
- `FREE_DEPLOYMENT_GUIDE.md` - Deploy with uploads
- `RUN_LOCAL.md` - Run locally
- `START.md` - Getting started

---

**Your Knowledge Assistant is now a fully customizable, organization-ready AI platform!** 🎉

Users can upload their own data, and the AI will learn from it instantly. Perfect for enterprises, teams, and individuals who want a personalized AI assistant.

