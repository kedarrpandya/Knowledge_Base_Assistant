import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain } from 'lucide-react';

// Ancient script characters from various civilizations
const ancientScripts = [
  '𓂀', '𓃭', '𓄿', '𓅓', // Egyptian Hieroglyphs
  'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', // Norse Runes
  '𐎀', '𐎁', '𐎂', '𐎃', // Cuneiform
  'ॐ', 'अ', 'क', 'ग', // Sanskrit
  '文', '字', '書', '知', // Chinese
  'א', 'ב', 'ג', 'ד', // Hebrew
  'Ω', 'Φ', 'Ψ', 'Σ', // Greek
];

export default function AnimatedLogo() {
  const [isAnimating, setIsAnimating] = useState(true);
  const [currentChar, setCurrentChar] = useState(0);

  useEffect(() => {
    if (isAnimating && currentChar < 20) {
      const timer = setTimeout(() => {
        setCurrentChar(currentChar + 1);
      }, 80);
      return () => clearTimeout(timer);
    } else if (currentChar >= 20) {
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [currentChar, isAnimating]);

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <AnimatePresence mode="wait">
          {isAnimating ? (
            <motion.div
              key={currentChar}
              initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.5, rotate: 180 }}
              transition={{ duration: 0.15 }}
              className="w-12 h-12 flex items-center justify-center text-2xl text-white/80"
            >
              {ancientScripts[currentChar % ancientScripts.length]}
            </motion.div>
          ) : (
            <motion.div
              key="final-logo"
              initial={{ opacity: 0, scale: 0, rotate: -360 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15,
                duration: 0.8
              }}
            >
              <div className="relative">
                {/* Glow effect */}
                <motion.div
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-white/60 rounded-full blur-sm"
                />
                
                {/* Brain Icon */}
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
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full" />
                </motion.div>
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <div className="absolute bottom-0 right-0 w-1 h-1 bg-white/60 rounded-full" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Text with character-by-character animation */}
      <div className="overflow-hidden">
        <div className="flex">
          {'Knowledge Assistant'.split('').map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isAnimating ? 0 : 1, 
                y: isAnimating ? 20 : 0 
              }}
              transition={{ 
                delay: isAnimating ? 0 : index * 0.05 + 0.3,
                duration: 0.3 
              }}
              className="text-2xl font-bold text-white"
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}

