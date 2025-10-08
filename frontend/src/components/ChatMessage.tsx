import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  sources?: Array<{
    title: string;
    content: string;
    score: number;
  }>;
  confidence?: number;
  processingTime?: number;
}

export default function ChatMessage({ 
  message, 
  isBot, 
  sources, 
  confidence, 
  processingTime 
}: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex gap-3 mb-6 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 360 }}
        transition={{ duration: 0.5 }}
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isBot
            ? 'bg-white/10'
            : 'bg-white/15'
        } shadow-lg backdrop-blur-xl`}
      >
        {isBot ? (
          <Bot className="w-6 h-6 text-white" />
        ) : (
          <User className="w-6 h-6 text-white" />
        )}
      </motion.div>

      {/* Message Content */}
      <div className={`flex-1 ${isBot ? 'text-left' : 'text-right'}`}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`inline-block max-w-3xl liquid-glass rounded-2xl p-4 shadow-xl ${
            isBot ? 'rounded-tl-none' : 'rounded-tr-none'
          }`}
        >
          <p className="text-gray-100 leading-relaxed whitespace-pre-wrap">{message}</p>
          
          {/* Bot metadata */}
          {isBot && (confidence !== undefined || processingTime !== undefined) && (
            <div className="mt-3 pt-3 border-t border-white/10 flex gap-4 text-xs text-gray-400">
              {confidence !== undefined && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-white/40 animate-pulse" />
                  Confidence: {confidence}%
                </span>
              )}
              {processingTime !== undefined && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-smoke/40 animate-pulse" />
                  {processingTime}ms
                </span>
              )}
            </div>
          )}

          {/* Sources */}
          {sources && sources.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.3 }}
              className="mt-4 space-y-2"
            >
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                Sources:
              </p>
              {sources.map((source, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 5 }}
                  className="glass rounded-lg p-3 text-sm"
                >
                  <p className="font-semibold text-white mb-1">{source.title}</p>
                  <p className="text-gray-400 text-xs line-clamp-2">{source.content}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-white/10 rounded-full h-1 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${source.score * 100}%` }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="h-full bg-white/60"
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round(source.score * 100)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

