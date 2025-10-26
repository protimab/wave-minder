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
        <h2 className="text-2xl font-bold text-ocean-700 mb-4">Recent Community Sightings</h2>
        <div className="bg-white rounded-xl shadow-md p-12 text-center border-2 border-ocean-100">
          <div className="text-6xl mb-4">🐠</div>
          <p className="text-ocean-600 text-lg">No sightings yet. Be the first to log one!</p>
          <motion.button
            onClick={() => navigate('/sightings/new')}
            className="mt-4 px-6 py-3 bg-ocean-gradient text-white rounded-lg font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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
      className="mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-ocean-700">Recent Community Sightings</h2>
        <motion.button
          onClick={() => navigate('/sightings')}
          className="text-ocean-500 hover:text-ocean-700 font-semibold text-sm flex items-center gap-2"
          whileHover={{ scale: 1.05, x: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          View All <span>→</span>
        </motion.button>
      </div>

      <motion.div 
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {sightings.map((sighting) => (
          <motion.div
            key={sighting.id}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-ocean-100 hover:border-ocean-300"
            variants={itemVariants}
            whileHover={{ scale: 1.01, x: 4 }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <FaFish className="text-ocean-400 text-xl" />
                  <h4 className="text-xl font-bold text-ocean-700">{sighting.species_name}</h4>
                  <span className="px-3 py-1 bg-ocean-100 text-ocean-600 rounded-full text-xs font-semibold">
                    {sighting.species_type}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-ocean-600">
                  {sighting.location_name && (
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-ocean-400" />
                      <span>{sighting.location_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <FaUser className="text-ocean-400" />
                    <span>{sighting.user_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-ocean-400" />
                    <span>{new Date(sighting.date_spotted).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-3">
                  {sighting.group_size > 1 && (
                    <div className="flex items-center gap-2 text-sm text-ocean-600 bg-ocean-50 px-3 py-1 rounded-lg">
                      <FaUsers className="text-ocean-400" />
                      <span>Group of {sighting.group_size}</span>
                    </div>
                  )}
                  {sighting.behavior && (
                    <div className="text-sm text-ocean-600 bg-ocean-50 px-3 py-1 rounded-lg">
                      <span className="font-medium">Behavior:</span> {sighting.behavior}
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