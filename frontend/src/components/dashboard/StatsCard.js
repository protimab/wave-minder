import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon, onClick }) => {
  return (
    <motion.div
      className={`relative overflow-hidden backdrop-blur-xl bg-white/20 p-6 border border-white/30 shadow-2xl ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={onClick ? { scale: 1.05, y: -8, rotate: 1 } : { scale: 1.02 }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      style={{
        borderRadius: '40px 20px 40px 20px',
      }}
    >
      {/* gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      <div className="relative flex items-center gap-4">
        <motion.div 
          className="text-5xl"
          whileHover={{ scale: 1.3, rotate: 15 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
        >
          {icon}
        </motion.div>
        <div className="flex-1">
          <h3 
            className="text-xs font-medium text-white/80 mb-1 uppercase tracking-widest" 
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {title}
          </h3>
          <p 
            className="text-4xl font-bold text-white drop-shadow-lg" 
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {value}
          </p>
        </div>
      </div>
      {onClick && (
        <motion.div 
          className="mt-4 text-right"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-xs text-white/70 font-medium tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>
            View Details →
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StatsCard;