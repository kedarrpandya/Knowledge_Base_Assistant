import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain } from 'lucide-react';

// Ancient script variants for each letter (visually similar)
const ancientVariants: Record<string, string[]> = {
  'K': ['Κ', 'ᚲ', 'К', '𐎋', 'ક'],  // Greek Kappa, Rune, Cyrillic, Cuneiform, Gujarati
  'n': ['η', 'ո', 'ח', 'ñ', 'ń'],  // Greek eta, Armenian, Hebrew, Spanish, Polish
  'o': ['ο', 'օ', 'ס', 'σ', 'ο'],  // Greek omicron, Armenian, Hebrew, Greek sigma, Greek
  'w': ['ω', 'ש', 'ψ', 'ш', 'ẃ'],  // Greek omega, Hebrew, Greek psi, Cyrillic, Welsh
  'l': ['ι', 'ı', 'ל', 'ļ', 'ł'],  // Greek iota, Turkish, Hebrew, Latvian, Polish
  'e': ['ε', 'є', 'ე', 'ē', 'ė'],  // Greek epsilon, Cyrillic, Georgian, Macron, Lithuanian
  'd': ['δ', 'ծ', 'द', 'ď', 'đ'],  // Greek delta, Armenian, Devanagari, Czech, Croatian
  'g': ['ϱ', 'ց', 'ग', 'ğ', 'ģ'],  // Greek rho, Armenian, Devanagari, Turkish, Latvian
  'A': ['Α', 'А', 'Ա', 'अ', 'Λ'],  // Greek Alpha, Cyrillic, Armenian, Devanagari, Lambda
  's': ['ς', 'ֆ', 'ś', 'š', 'ş'],  // Greek sigma, Armenian, Polish, Czech, Turkish
  'i': ['ι', 'і', 'ı', 'ï', 'į'],  // Greek iota, Cyrillic, Turkish, Diaeresis, Lithuanian
  't': ['τ', 'т', 'ե', 'ť', 'ţ'],  // Greek tau, Cyrillic, Armenian, Czech, Romanian
  'a': ['α', 'а', 'ա', 'ä', 'å'],  // Greek alpha, Cyrillic, Armenian, Umlaut, Ring
  ' ': [' ', ' ', ' ', ' ', ' '],  // Space remains space
};

const logoText = 'Knowledge Assistant';

export default function AnimatedLogo() {
  const [textAnimationStarted, setTextAnimationStarted] = useState(false);
  const [activeCharIndex, setActiveCharIndex] = useState(-1);
  const [scriptCycleIndex, setScriptCycleIndex] = useState(0);
  const [revealedChars, setRevealedChars] = useState<Set<number>>(new Set());
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before starting animation
  useEffect(() => {
    setMounted(true);
    // Start text animation immediately (no brain animation delay)
    setTimeout(() => {
      setTextAnimationStarted(true);
      setActiveCharIndex(0);
    }, 100);
  }, []);

  // Text character animation (4 seconds total for all characters with overlap)
  useEffect(() => {
    if (!textAnimationStarted || activeCharIndex < 0) return;

    if (activeCharIndex < logoText.length) {
      const char = logoText[activeCharIndex];
      
      // Handle spaces immediately
      if (char === ' ') {
        setRevealedChars(prev => new Set([...prev, activeCharIndex]));
        setTimeout(() => {
          setScriptCycleIndex(0);
          setActiveCharIndex(activeCharIndex + 1);
        }, 80);
        return;
      }

      // Cycle through 3 ancient scripts (80ms each = 240ms)
      if (scriptCycleIndex < 3) {
        const timer = setTimeout(() => {
          setScriptCycleIndex(scriptCycleIndex + 1);
        }, 80);
        return () => clearTimeout(timer);
      } else {
        // Reveal the actual character
        setRevealedChars(prev => new Set([...prev, activeCharIndex]));
        
        // Start next character BEFORE this one fully completes (overlap for speed)
        setTimeout(() => {
          setScriptCycleIndex(0);
          setActiveCharIndex(activeCharIndex + 1);
        }, 80); // Start next after 80ms instead of waiting
      }
    }
  }, [textAnimationStarted, activeCharIndex, scriptCycleIndex]);

  // Get ancient scripts for cycling animation
  const ancientScripts = [
    '𓂀', '𓃭', '𓄿', '𓅓', // Egyptian Hieroglyphs
    'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', // Norse Runes
    '𐎀', '𐎁', '𐎂', '𐎃', // Cuneiform
    'ॐ', 'अ', 'क', 'ग', // Sanskrit
    '文', '字', '書', '知', // Chinese
    'א', 'ב', 'ג', 'ד', // Hebrew
    'Ω', 'Φ', 'Ψ', 'Σ', // Greek
  ];

  // Always show static logo immediately, then animate
  if (!mounted) {
    return (
      <div className="flex items-center gap-2 sm:gap-3 relative z-30">
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
          {/* Solid placeholder - always visible */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-purple-600/60 to-blue-600/60 p-2.5 sm:p-3 rounded-full backdrop-blur-xl border-2 border-white/50 shadow-2xl shadow-purple-500/50" style={{ minWidth: '40px', minHeight: '40px' }}>
              <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-2xl" strokeWidth={3} />
            </div>
          </div>
        </div>
        <div className="overflow-hidden flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white drop-shadow-lg">
            Knowledge Assistant
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3 relative z-30">
      {/* STATIC Brain Icon - No animation, always visible */}
      <div className="relative flex-shrink-0">
        <div className="relative">
          {/* Static glow effect */}
          <motion.div
            animate={{ 
              opacity: [0.6, 1, 0.6],
              scale: [1, 1.15, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-gradient-to-br from-purple-400/40 to-blue-400/40 rounded-full blur-md"
          />
          
          {/* Brain Icon - Static, always visible, enhanced for mobile */}
          <div 
            className="relative bg-gradient-to-br from-purple-600/60 to-blue-600/60 p-2.5 sm:p-3 rounded-full backdrop-blur-xl border-2 border-white/50 shadow-2xl shadow-purple-500/50"
            style={{ minWidth: '40px', minHeight: '40px' }}
          >
            <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-2xl" strokeWidth={3} />
          </div>

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
      </div>

      {/* Animated Text - Each character cycles through ancient scripts */}
      <div className="overflow-hidden flex-1 min-w-0">
        <div className="flex flex-wrap sm:flex-nowrap">
          {logoText.split('').map((char, index) => {
            const variants = ancientVariants[char] || ['?'];
            const isRevealed = revealedChars.has(index);
            const isActive = activeCharIndex === index;
            const isPending = index > activeCharIndex;

            return (
              <div key={index} className="inline-block relative" style={{ minWidth: char === ' ' ? '0.5rem' : 'auto' }}>
                <AnimatePresence mode="wait">
                  {isPending ? (
                    // Not started yet - invisible
                    <motion.span
                      key="pending"
                      className="text-lg sm:text-xl md:text-2xl font-bold text-transparent select-none"
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                  ) : isActive && !isRevealed ? (
                    // Currently cycling through ancient scripts - FULLY VISIBLE
                    <motion.span
                      key={`script-${scriptCycleIndex}`}
                      initial={{ scale: 0.8, rotateY: -90 }}
                      animate={{ scale: 1, rotateY: 0 }}
                      exit={{ scale: 0.8, rotateY: 90 }}
                      transition={{ duration: 0.1, ease: "easeOut" }}
                      className="text-lg sm:text-xl md:text-2xl font-bold text-white inline-block"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {variants[scriptCycleIndex % variants.length]}
                    </motion.span>
                  ) : isRevealed ? (
                    // Final revealed character with epic animation
                    <motion.span
                      key="revealed"
                      initial={{ opacity: 0, scale: 0.5, rotateY: -180, y: -20 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0, y: 0 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        duration: 0.4
                      }}
                      className="text-lg sm:text-xl md:text-2xl font-bold text-white inline-block"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
