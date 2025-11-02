import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFish, FaArrowLeft, FaPlus, FaWater } from 'react-icons/fa';
import { GiWhaleTail, GiDolphin, GiShrimp, GiSeaTurtle } from 'react-icons/gi';
import { MdWaves } from 'react-icons/md';
import { sightingsAPI } from '../../services/api';
import SightingCard from './SightingCard';

const SightingsList = () => {
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSightings();
  }, []);

  const fetchSightings = async () => {
    try {
      const response = await sightingsAPI.getAll({ limit: 100 });
      setSightings(response.data);
    } catch (error) {
      console.error('Error fetching sightings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sighting?')) {
      try {
        await sightingsAPI.delete(id);
        setSightings(sightings.filter(s => s.id !== id));
      } catch (error) {
        alert('Error deleting sighting: ' + error.response?.data?.detail);
      }
    }
  };

  const filteredSightings = filter === 'all' 
    ? sightings 
    : sightings.filter(s => s.species_type.toLowerCase() === filter.toLowerCase());

  const speciesTypes = [...new Set(sightings.map(s => s.species_type))];

  const floatVariants = {
    animate: {
      y: [0, -15, 0],
      x: [0, 10, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-100">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" } }}
          className="text-blue-500 text-6xl"
        >
          <FaFish />
        </motion.div>
        <span className="ml-4 text-blue-700 text-xl font-semibold">Loading marine sightings...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-100 relative overflow-hidden">
      {/* background decor */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <motion.div variants={floatVariants} animate="animate" className="absolute top-20 left-20">
          <GiWhaleTail className="text-blue-500 text-8xl" />
        </motion.div>
        <motion.div variants={floatVariants} animate="animate" style={{ animationDelay: '1s' }} className="absolute top-40 right-32">
          <GiDolphin className="text-cyan-400 text-7xl" />
        </motion.div>
        <motion.div variants={floatVariants} animate="animate" style={{ animationDelay: '2s' }} className="absolute bottom-32 left-1/4">
          <MdWaves className="text-teal-500 text-9xl" />
        </motion.div>
        <motion.div variants={floatVariants} animate="animate" style={{ animationDelay: '1.5s' }} className="absolute bottom-20 right-1/4">
          <GiSeaTurtle className="text-blue-400 text-7xl" />
        </motion.div>
        <motion.div variants={floatVariants} animate="animate" style={{ animationDelay: '2.5s' }} className="absolute top-1/2 left-1/3">
          <FaFish className="text-cyan-500 text-6xl" />
        </motion.div>
        <motion.div variants={floatVariants} animate="animate" style={{ animationDelay: '3s' }} className="absolute top-1/3 right-1/3">
          <GiShrimp className="text-blue-300 text-5xl" />
        </motion.div>
      </div>

      {/* header */}
      <motion.header
        className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 shadow-lg relative z-10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <FaFish className="text-white text-4xl" />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Marine Sightings</h1>
                <p className="text-blue-100 text-sm">Community marine life observations</p>
              </div>
            </motion.div>
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm border border-white/30 font-semibold"
                whileHover={{ scale: 1.05, x: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaArrowLeft />
                <span className="hidden sm:inline">Back</span>
              </motion.button>
              <motion.button
                onClick={() => navigate('/sightings/new')}
                className="flex items-center gap-2 px-5 py-2 bg-white text-blue-600 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPlus />
                <span>New Sighting</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* stats card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border-2 border-blue-200">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🐋</div>
              <div>
                <p className="text-blue-800 font-semibold">Total Sightings</p>
                <p className="text-2xl font-bold text-blue-600">{sightings.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6 flex flex-wrap gap-3"
        >
          <motion.button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${
              filter === 'all'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                : 'bg-white/60 text-blue-700 hover:bg-white/80 border-2 border-blue-200'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            All ({sightings.length})
          </motion.button>
          {speciesTypes.map(type => (
            <motion.button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                filter === type
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-white/60 text-blue-700 hover:bg-white/80 border-2 border-blue-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {type} ({sightings.filter(s => s.species_type === type).length})
            </motion.button>
          ))}
        </motion.div>

        {filteredSightings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-blue-200"
          >
            <div className="text-7xl mb-4">🐋</div>
            <h3 className="text-2xl font-bold text-blue-700 mb-2">No Sightings Yet</h3>
            <p className="text-blue-600 mb-6">Be the first to log a marine life encounter!</p>
            <motion.button
              onClick={() => navigate('/sightings/new')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Log First Sighting
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredSightings.map((sighting) => (
              <motion.div key={sighting.id} variants={cardVariants}>
                <SightingCard sighting={sighting} onDelete={handleDelete} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default SightingsList;