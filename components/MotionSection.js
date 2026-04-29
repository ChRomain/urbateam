'use client';

import { motion } from 'framer-motion';

export default function MotionSection({ children, delay = 0, className = "", style = {} }) {
  return (
    <motion.section
      className={className}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.section>
  );
}
