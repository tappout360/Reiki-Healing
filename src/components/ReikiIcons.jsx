import React from 'react';
import { motion } from 'framer-motion';

export const ChoKuRei = ({ size = 24, color = 'var(--accent-gold)', glowing = false }) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={false}
      animate={glowing ? {
        filter: `drop-shadow(0 0 8px ${color})`
      } : {
        filter: `drop-shadow(0 0 0px ${color})`
      }}
      transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
    >
      {/* Horizontal Line at top */}
      <motion.path
        d="M 20 20 L 80 20"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Vertical Line down */}
      <motion.path
        d="M 80 20 L 80 80"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Spiral */}
      <motion.path
        d="M 80 80 C 80 95, 20 95, 20 70 C 20 45, 70 45, 70 65 C 70 80, 40 80, 40 70"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </motion.svg>
  );
};

export const SeiHeKi = ({ size = 24, color = 'var(--accent-ethereal)', glowing = false }) => {
    return (
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={glowing ? {
          filter: `drop-shadow(0 0 10px ${color})`
        } : {
          filter: `drop-shadow(0 0 0px ${color})`
        }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      >
        <path
          d="M 30 20 C 10 40, 10 60, 30 80 M 30 20 L 70 20 C 90 40, 90 60, 70 80 L 30 80 M 50 20 L 50 80"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="50" cy="40" r="5" fill={color} />
        <circle cx="50" cy="60" r="5" fill={color} />
      </motion.svg>
    );
};
