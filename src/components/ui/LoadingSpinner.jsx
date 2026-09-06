import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <Sparkles size={24} color="var(--accent-gold)" />
    </motion.div>
  </div>
);

export default LoadingSpinner;
