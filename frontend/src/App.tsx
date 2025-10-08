import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

// Components
import StarConstellation from './components/StarConstellation';
import Scene3D from './components/Scene3D';
import NetworkBackground from './components/NetworkBackground';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import DocumentUpload from './components/DocumentUpload';
import AnimatedLogo from './components/AnimatedLogo';

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

      {/* Main Content - Fixed layout */}
      <div className="relative z-10 h-screen flex flex-col">
        {/* Header - No border, leftmost alignment */}
        <header className="py-6 flex-shrink-0">
          <div className="max-w-6xl mx-auto px-4">
            <AnimatedLogo />
          </div>
        </header>

        {/* Chat Messages - Scrollable flex area between header and input */}
        <main className="flex-1 overflow-y-auto min-h-0">
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

        {/* Input Area - Fixed at bottom, no full footer background */}
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
