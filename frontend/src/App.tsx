import { useState, useRef, useEffect } from 'react';
import { Brain } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

// Components
import StarConstellation from './components/StarConstellation';
import Scene3D from './components/Scene3D';
import NetworkBackground from './components/NetworkBackground';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import DocumentUpload from './components/DocumentUpload';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  sources?: Array<{
    title: string;
    content: string;
    score: number;
  }>;
  confidence?: number;
  processingTime?: number;
}

const API_URL = 'http://localhost:3000';

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI Knowledge Assistant. I can answer questions about your knowledge base in under 2 seconds. Try asking me something!",
      isBot: true,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call API
      const response = await axios.post(`${API_URL}/api/query`, {
        question: text,
      });

      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.answer,
        isBot: true,
        sources: response.data.sources,
        confidence: response.data.confidence,
        processingTime: response.data.processingTimeMs,
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error querying API:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error processing your question. Please make sure the backend server is running.",
        isBot: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Layered Interactive Backgrounds */}
      <NetworkBackground />
      <StarConstellation />
      <Scene3D />

      {/* Main Content */}
      <div className="relative z-10 h-screen flex flex-col">
        {/* Header - Cool space animation on load */}
        <motion.header 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 100,
            damping: 20,
            duration: 1.2
          }}
          className="py-6"
        >
          <div className="max-w-6xl mx-auto px-4">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2
              }}
            >
              {/* Brain Icon with orbit effect */}
              <div className="relative">
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="absolute inset-0 bg-white/60 rounded-full blur-sm"
                />
                <motion.div 
                  className="relative bg-white/10 p-3 rounded-full backdrop-blur-xl"
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Brain className="w-6 h-6 text-white" />
                </motion.div>
                
                {/* Orbiting particles */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-white rounded-full" />
                </motion.div>
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <div className="absolute bottom-0 right-0 w-1 h-1 bg-white/60 rounded-full" />
                </motion.div>
              </div>
              
              {/* Text with typewriter effect */}
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-2xl font-bold text-white"
              >
                Knowledge Assistant
              </motion.h1>
            </motion.div>
          </div>
        </motion.header>

        {/* Chat Messages - Scrollable area between header and input */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8 max-w-5xl">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message.text}
                isBot={message.isBot}
                sources={message.sources}
                confidence={message.confidence}
                processingTime={message.processingTime}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input Area - Fixed at bottom */}
        <footer className="py-6 flex-shrink-0">
          <ChatInput 
            onSend={handleSendMessage} 
            isLoading={isLoading}
            onUploadClick={() => setIsUploadOpen(true)}
          />
        </footer>

        {/* Document Upload Modal */}
        <DocumentUpload 
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
        />
      </div>
    </div>
  );
}

export default App;
