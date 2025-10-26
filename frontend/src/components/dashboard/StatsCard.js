import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon, onClick }) => {
  return (
    <motion.div
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-ocean-100 ${
        onClick ? 'cursor-pointer hover:border-ocean-400' : ''
      }`}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={onClick ? { scale: 1.03, y: -4 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
    >
      <div className="flex items-center gap-4">
        <motion.div 
          className="text-5xl"
          whileHover={{ scale: 1.2, rotate: 10 }}
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-ocean-600 mb-1">{title}</h3>
          <p className="text-3xl font-bold text-ocean-700">{value}</p>
        </div>
      </div>
      {onClick && (
        <div className="mt-3 text-right">
          <span className="text-xs text-ocean-400 font-medium">View Details →</span>
        </div>
      )}
    </motion.div>
  );
};

export default StatsCard;