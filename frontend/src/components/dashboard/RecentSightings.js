import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaUser, FaCalendarAlt, FaUsers, FaFish } from 'react-icons/fa';

const RecentSightings = ({ sightings }) => {
  const navigate = useNavigate();

  if (!sightings || sightings.length === 0) {
    return (
      <motion.section 
        className="mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 
          className="text-4xl md:text-5xl font-bold text-white mb-8 text-center drop-shadow-lg" 
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Recent Community Sightings
        </h2>
        <div 
          className="backdrop-blur-xl bg-white/20 p-12 text-center border border-white/30 shadow-2xl"
          style={{ borderRadius: '60px 30px 60px 30px' }}
        >
          <div className="text-8xl mb-6">🐠</div>
          <p className="text-white text-xl mb-6 font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
            No sightings yet. Be the first to log one!
          </p>
          <motion.button
            onClick={() => navigate('/sightings/new')}
            className="px-8 py-4 backdrop-blur-xl bg-white/30 text-white font-semibold border border-white/40 shadow-xl"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            style={{ 
              borderRadius: '30px 15px 30px 15px',
              fontFamily: "'Space Grotesk', sans-serif" 
            }}
          >
            Log First Sighting
          </motion.button>
        </div>
      </motion.section>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.section 
      className="mt-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex justify-between items-center mb-8">
        <h2 
          className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg" 
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Recent Community Sightings
        </h2>
        <motion.button
          onClick={() => navigate('/sightings')}
          className="text-white/90 hover:text-white font-semibold text-sm flex items-center gap-2 backdrop-blur-lg bg-white/20 px-4 py-2 border border-white/30 shadow-lg"
          whileHover={{ scale: 1.05, x: 5 }}
          whileTap={{ scale: 0.95 }}
          style={{ 
            borderRadius: '20px 10px 20px 10px',
            fontFamily: "'Inter', sans-serif" 
          }}
        >
          View All <span>→</span>
        </motion.button>
      </div>

      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {sightings.map((sighting, index) => (
          <motion.div
            key={sighting.id}
            className="backdrop-blur-xl bg-white/20 hover:bg-white/25 transition-all p-6 border border-white/30 shadow-2xl"
            variants={itemVariants}
            whileHover={{ scale: 1.02, x: 6, rotate: 0.5 }}
            style={{
              borderRadius: index % 2 === 0 
                ? '50px 20px 50px 20px' 
                : '20px 50px 20px 50px'
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                  >
                    <FaFish className="text-white text-2xl drop-shadow-lg" />
                  </motion.div>
                  <h4 
                    className="text-2xl font-bold text-white drop-shadow-lg" 
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {sighting.species_name}
                  </h4>
                  <span 
                    className="px-4 py-1.5 backdrop-blur-lg bg-white/30 text-white text-xs font-semibold border border-white/40 shadow-lg"
                    style={{ 
                      borderRadius: '20px',
                      fontFamily: "'Inter', sans-serif" 
                    }}
                  >
                    {sighting.species_type}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-white/90 mb-4">
                  {sighting.location_name && (
                    <div className="flex items-center gap-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                      <FaMapMarkerAlt className="text-white/70" />
                      <span>{sighting.location_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                    <FaUser className="text-white/70" />
                    <span>{sighting.user_name}</span>
                  </div>
                  <div className="flex items-center gap-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                    <FaCalendarAlt className="text-white/70" />
                    <span>{new Date(sighting.date_spotted).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {sighting.group_size > 1 && (
                    <div 
                      className="flex items-center gap-2 text-sm text-white backdrop-blur-lg bg-white/20 px-4 py-2 border border-white/30 shadow-lg"
                      style={{ 
                        borderRadius: '15px',
                        fontFamily: "'Inter', sans-serif" 
                      }}
                    >
                      <FaUsers className="text-white/70" />
                      <span>Group of {sighting.group_size}</span>
                    </div>
                  )}
                  {sighting.behavior && (
                    <div 
                      className="text-sm text-white backdrop-blur-lg bg-white/20 px-4 py-2 border border-white/30 shadow-lg"
                      style={{ 
                        borderRadius: '15px',
                        fontFamily: "'Inter', sans-serif" 
                      }}
                    >
                      <span className="font-semibold">Behavior:</span> {sighting.behavior}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
};

export default RecentSightings;