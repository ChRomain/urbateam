'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function Magnetic({ children, strength = 0.5 }) {
    const ref = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const { width, height, left, top } = ref.current.getBoundingClientRect();
        
        // Calcul du centre de l'élément
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        
        // Calcul de la distance par rapport au centre
        const x = (clientX - centerX) * strength;
        const y = (clientY - centerY) * strength;
        
        setPosition({ x, y });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    const { x, y } = position;

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x, y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            style={{ display: 'inline-block' }}
        >
            {children}
        </motion.div>
    );
}
