import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
    }
  };

  const sampleQuestions = [
    "What is the vacation policy?",
    "How do I submit expenses?",
    "What are IT security best practices?",
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Sample Questions */}
      {input.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex flex-wrap gap-2 justify-center"
        >
          {sampleQuestions.map((question, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setInput(question)}
              className="glass rounded-full px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-smoke" />
              {question}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <motion.div
          whileFocus={{ scale: 1.02 }}
          className="liquid-glass rounded-2xl shadow-2xl overflow-hidden"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask me anything about your knowledge base..."
            disabled={isLoading}
            rows={1}
            className="w-full bg-transparent border-none outline-none p-4 pr-14 text-white placeholder-gray-500 resize-none"
            style={{ maxHeight: '200px' }}
          />
          
          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`absolute right-3 bottom-3 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              input.trim() && !isLoading
                ? 'bg-white/20 text-white shadow-lg backdrop-blur-xl hover:bg-white/30'
                : 'bg-white/5 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </motion.div>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -top-8 left-4 text-sm text-gray-400 flex items-center gap-2"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-white/60"
            />
            AI is thinking...
          </motion.div>
        )}
      </form>
    </div>
  );
}

