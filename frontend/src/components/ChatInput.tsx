import { useState } from 'react';
import { Send, Sparkles, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  onUploadClick: () => void;
}

const sampleQuestions = [
  'What is the vacation policy?',
  'How do I request time off?',
  'What are the company benefits?',
];

export default function ChatInput({ onSend, isLoading, onUploadClick }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Sample Questions */}
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {sampleQuestions.map((question, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={() => !isLoading && onSend(question)}
            className="liquid-glass px-4 py-2 rounded-full text-sm text-gray-300 hover:text-white transition-all"
          >
            <Sparkles className="w-3 h-3 inline mr-1" />
            {question}
          </motion.button>
        ))}
      </div>

      {/* Input Form - Only this has background */}
      <form onSubmit={handleSubmit} className="liquid-glass rounded-2xl p-4 shadow-xl">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
          />
          
          {/* Upload Button */}
          <motion.button
            type="button"
            onClick={onUploadClick}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85, rotate: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="liquid-glass p-3 rounded-xl text-white hover:bg-white/20 transition-all"
          >
            <Upload className="w-5 h-5" />
          </motion.button>

          {/* Send Button */}
          <motion.button
            type="submit"
            disabled={!input.trim() || isLoading}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85, rotate: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="liquid-glass disabled:opacity-50 text-white p-3 rounded-xl disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
