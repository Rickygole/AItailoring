import React from 'react';
import { motion, animate } from 'framer-motion';

export default function AtsScore({ score }) {
  // Clamp score between 0 and 1
  const pct = Math.round(Math.max(0, Math.min(1, score)) * 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="45"
            className="stroke-zinc-700"
            strokeWidth="10" fill="none"
          />
          <motion.circle
            cx="50" cy="50" r="45"
            stroke="#c084fc"
            strokeWidth="10"
            fill="none"
            strokeDasharray={2 * Math.PI * 45}
            strokeDashoffset={2 * Math.PI * 45 * (1 - pct / 100)}
            initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - pct / 100) }}
            transition={{ duration: 1 }}
            style={{ filter: 'drop-shadow(0 0 8px #c084fc88)' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-4xl font-bold text-accent drop-shadow"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {pct}%
          </motion.span>
        </div>
      </div>
      <span className="mt-2 text-zinc-400 text-sm tracking-wide uppercase">ATS Match</span>
    </div>
  );
}
