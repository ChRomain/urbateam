'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  
  // Use a spring for smooth line growth
  const pathLength = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30
  });

  useEffect(() => {
    const toggleVisibility = () => {
      // Show when page is scrolled more than 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'white',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            color: 'var(--primary-color)'
          }}
          whileHover={{ scale: 1.1, backgroundColor: '#f8fafc' }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Progress Circle SVG */}
          <svg
            width="56"
            height="56"
            viewBox="0 0 100 100"
            style={{ 
              position: 'absolute', 
              transform: 'rotate(-90deg)',
              pointerEvents: 'none'
            }}
          >
            <motion.circle
              cx="50"
              cy="50"
              r="48"
              stroke="#e2e8f0"
              strokeWidth="4"
              fill="transparent"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="48"
              stroke="var(--accent-color)"
              strokeWidth="4"
              fill="transparent"
              style={{
                pathLength
              }}
            />
          </svg>
          <ChevronUp size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
