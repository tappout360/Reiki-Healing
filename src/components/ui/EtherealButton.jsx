import React from 'react';
import { motion } from 'framer-motion';

export const EtherealButton = ({ children, onClick, variant = 'primary', style = {}, ...props }) => {
  const isPrimary = variant === 'primary';
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={isPrimary ? 'btn btn-primary' : 'btn'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        borderRadius: '24px',
        padding: '0.6rem 1.5rem',
        letterSpacing: '0.5px',
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default EtherealButton;
