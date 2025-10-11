import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';

// Use relative URL for Vercel deployment (same domain) or env var for other deployments
const API_URL = import.meta.env.VITE_API_URL || '';

interface UploadResponse {
  success: boolean;
  message: string;
  documentId?: string;
}

interface DocumentUploadProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DocumentUpload({ isOpen, onClose }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [author, setAuthor] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      // Read file content and convert to base64
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1]; // Remove data URL prefix
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await axios.post(`${API_URL}/api/documents/upload`, {
        filename: file.name,
        fileContent,
        title: title || file.name.split('.')[0],
        category,
        author,
        tags: []
      });

      setResult(response.data);
      
      if (response.data.success) {
        setTimeout(() => {
          onClose();
          resetForm();
        }, 3000);
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleTextUpload = async () => {
    if (!title || !content) {
      setResult({ success: false, message: 'Title and content are required' });
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const response = await axios.post(`${API_URL}/api/documents`, {
        title,
        content,
        category,
        author
      });

      setResult(response.data);
      
      if (response.data.success) {
        setTimeout(() => {
          onClose();
          resetForm();
        }, 3000);
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed'
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('general');
    setAuthor('');
    setFile(null);
    setResult(null);
  };

  return (
    <>
      {/* Upload Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong p-8 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Add Document to Knowledge Base
                </h2>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>

              {/* Result Message */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${
                    result.success 
                      ? 'bg-green-500/20 border border-green-500/30' 
                      : 'bg-red-500/20 border border-red-500/30'
                  }`}
                >
                  {result.success ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  <p className={result.success ? 'text-green-200' : 'text-red-200'}>
                    {result.message}
                  </p>
                </motion.div>
              )}

              {/* Form */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter document title..."
                    className="w-full glass p-3 rounded-lg text-white placeholder-gray-400 border border-white/10 focus:border-white/30 focus:outline-none"
                  />
                </div>

                {/* Content (Text Input) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content (or upload a file below)
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your document content here..."
                    rows={6}
                    className="w-full glass p-3 rounded-lg text-white placeholder-gray-400 border border-white/10 focus:border-white/30 focus:outline-none resize-none"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Or Upload a File (TXT, JSON, MD, PDF, Images)
                  </label>
                  <div className="glass p-4 rounded-lg border-2 border-dashed border-white/20 hover:border-white/40 transition">
                    <input
                      type="file"
                      accept=".txt,.json,.md,.pdf,.png,.jpg,.jpeg,.gif,.bmp,.webp"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0];
                        if (selectedFile) {
                          setFile(selectedFile);
                          if (!title) setTitle(selectedFile.name.split('.')[0]);
                        }
                      }}
                      className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-white/10 file:text-white hover:file:bg-white/20 file:cursor-pointer"
                    />
                    {file && (
                      <p className="mt-2 text-sm text-gray-300 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>
                </div>

                {/* Category & Author */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full glass p-3 rounded-lg text-white border border-white/10 focus:border-white/30 focus:outline-none"
                    >
                      <option value="general">General</option>
                      <option value="policy">Policy</option>
                      <option value="procedure">Procedure</option>
                      <option value="faq">FAQ</option>
                      <option value="documentation">Documentation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Author (optional)
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Your name..."
                      className="w-full glass p-3 rounded-lg text-white placeholder-gray-400 border border-white/10 focus:border-white/30 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  {file ? (
                    <motion.button
                      onClick={handleFileUpload}
                      disabled={uploading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      className="flex-1 liquid-glass disabled:opacity-50 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Upload File
                        </>
                      )}
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={handleTextUpload}
                      disabled={uploading || !title || !content}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      className="flex-1 liquid-glass disabled:opacity-50 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <FileText className="w-5 h-5" />
                          Add to Knowledge Base
                        </>
                      )}
                    </motion.button>
                  )}

                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="px-6 py-3 liquid-glass text-white rounded-lg"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>

              {/* Info */}
              <p className="mt-6 text-sm text-gray-400 text-center">
                Uploaded documents will be indexed and available for AI-powered search immediately.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

