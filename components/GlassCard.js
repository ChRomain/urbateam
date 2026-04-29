'use client';

import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';

export default function GlassCard({ children, variants, className = "", style = {} }) {
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  function onMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      className={`glass-card ${className}`}
      variants={variants}
      onMouseMove={onMouseMove}
      initial={variants?.hidden ? "hidden" : { opacity: 0, y: 20 }}
      whileInView={variants?.visible ? "visible" : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          inset: -2,
          zIndex: 0,
          background: useMotionTemplate`
            radial-gradient(
              300px circle at ${mouseX}px ${mouseY}px,
              rgba(16, 185, 129, 0.1),
              transparent 80%
            )
          `,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </motion.div>
  );
}
