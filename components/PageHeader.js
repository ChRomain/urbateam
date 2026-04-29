'use client';

import { motion } from 'framer-motion';

export default function PageHeader({ title, subtitle }) {
  return (
    <motion.div 
      className="text-center mb-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', marginBottom: '1rem' }}>{title}</h1>
      {subtitle && (
        <p style={{ color: 'var(--text-light)', maxWidth: '700px', margin: '0 auto', fontSize: '1.2rem' }}>
          {subtitle}
        </p>
      )}
      <motion.div 
        style={{ width: '60px', height: '4px', background: 'var(--accent-color)', margin: '2rem auto', borderRadius: '2px' }}
        initial={{ width: 0 }}
        animate={{ width: '60px' }}
        transition={{ delay: 0.5, duration: 0.8 }}
      />
    </motion.div>
  );
}
