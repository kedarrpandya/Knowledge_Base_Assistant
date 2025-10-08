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
  const [brainAnimating, setBrainAnimating] = useState(true);
  const [brainCharIndex, setBrainCharIndex] = useState(0);
  const [textAnimationStarted, setTextAnimationStarted] = useState(false);
  const [activeCharIndex, setActiveCharIndex] = useState(-1);
  const [scriptCycleIndex, setScriptCycleIndex] = useState(0);
  const [revealedChars, setRevealedChars] = useState<Set<number>>(new Set());

  // Brain icon animation (first 2 seconds)
  useEffect(() => {
    if (brainAnimating && brainCharIndex < 20) {
      const timer = setTimeout(() => {
        setBrainCharIndex(brainCharIndex + 1);
      }, 80);
      return () => clearTimeout(timer);
    } else if (brainCharIndex >= 20) {
      setTimeout(() => {
        setBrainAnimating(false);
        setTextAnimationStarted(true);
        setActiveCharIndex(0);
      }, 300);
    }
  }, [brainCharIndex, brainAnimating]);

  // Text character animation (6 seconds total for all characters)
  useEffect(() => {
    if (!textAnimationStarted || activeCharIndex < 0) return;

    if (activeCharIndex < logoText.length) {
      const char = logoText[activeCharIndex];
      const variants = ancientVariants[char] || ['?', '?', '?', '?', '?'];

      // Cycle through 4 ancient scripts (60ms each = 240ms)
      if (scriptCycleIndex < 4) {
        const timer = setTimeout(() => {
          setScriptCycleIndex(scriptCycleIndex + 1);
        }, 60);
        return () => clearTimeout(timer);
      } else {
        // Reveal the actual character and move to next
        setRevealedChars(prev => new Set([...prev, activeCharIndex]));
        setTimeout(() => {
          setScriptCycleIndex(0);
          setActiveCharIndex(activeCharIndex + 1);
        }, 60);
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

  return (
    <div className="flex items-center gap-3">
      {/* Animated Brain Icon */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {brainAnimating ? (
            <motion.div
              key={brainCharIndex}
              initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.5, rotate: 180 }}
              transition={{ duration: 0.15 }}
              className="w-12 h-12 flex items-center justify-center text-2xl text-white/80"
            >
              {ancientScripts[brainCharIndex % ancientScripts.length]}
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

      {/* Animated Text - Each character cycles through ancient scripts */}
      <div className="overflow-hidden">
        <div className="flex">
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
                      className="text-2xl font-bold text-transparent select-none"
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                  ) : isActive && !isRevealed ? (
                    // Currently cycling through ancient scripts
                    <motion.span
                      key={`script-${scriptCycleIndex}`}
                      initial={{ opacity: 0, y: -20, rotateX: -90 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      exit={{ opacity: 0, y: 20, rotateX: 90 }}
                      transition={{ duration: 0.05 }}
                      className="text-2xl font-bold text-white/70 inline-block"
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
                      className="text-2xl font-bold text-white inline-block"
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
