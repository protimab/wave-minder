import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFish, FaArrowLeft, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers, FaFileAlt } from 'react-icons/fa';
import { sightingsAPI } from '../../services/api';
import { SPECIES_TYPES } from '../../utils/constants';

const SightingForm = () => {
  const [formData, setFormData] = useState({
    species_name: '',
    species_type: '',
    location_name: '',
    latitude: '',
    longitude: '',
    date_spotted: new Date().toISOString().split('T')[0],
    time_spotted: '',
    group_size: 1,
    behavior: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        group_size: parseInt(formData.group_size) || 1,
      };

      await sightingsAPI.create(submitData);
      navigate('/sightings');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create sighting');
    } finally {
      setLoading(false);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-100">
      {/* header */}
      <motion.header
        className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 shadow-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaFish className="text-white text-3xl" />
              <h1 className="text-2xl md:text-3xl font-bold text-white">Log Marine Sighting</h1>
            </div>
            <motion.button
              onClick={() => navigate('/sightings')}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm border border-white/30 font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaArrowLeft />
              <span className="hidden sm:inline">Cancel</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* form */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {error && (
            <motion.div
              className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-2 border-blue-100 space-y-6">
            {/* species info */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                    <FaFish className="text-blue-500" />
                    Species Name *
                  </label>
                  <input
                    type="text"
                    name="species_name"
                    value={formData.species_name}
                    onChange={handleChange}
                    placeholder="e.g., Humpback Whale"
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors bg-blue-50/50"
                    required
                  />
                </div>

                <div>
                  <label className="text-blue-700 font-semibold mb-2 block">Species Type *</label>
                  <select
                    name="species_type"
                    value={formData.species_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors bg-blue-50/50"
                    required
                  >
                    <option value="">Select type...</option>
                    {SPECIES_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* location */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <label className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                <FaMapMarkerAlt className="text-blue-500" />
                Location Name
              </label>
              <input
                type="text"
                name="location_name"
                value={formData.location_name}
                onChange={handleChange}
                placeholder="e.g., La Jolla Cove"
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors bg-blue-50/50"
              />
            </motion.div>

            {/* coordinates */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <label className="text-blue-700 font-semibold mb-2 block">Location Coordinates</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  step="0.000001"
                  placeholder="Latitude (e.g., 32.8509)"
                  className="px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors bg-blue-50/50"
                />
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  step="0.000001"
                  placeholder="Longitude (e.g., -117.2713)"
                  className="px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors bg-blue-50/50"
                />
              </div>
            </motion.div>

            {/* date and time */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                    <FaCalendarAlt className="text-blue-500" />
                    Date Spotted *
                  </label>
                  <input
                    type="date"
                    name="date_spotted"
                    value={formData.date_spotted}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors bg-blue-50/50"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                    <FaClock className="text-cyan-500" />
                    Time
                  </label>
                  <input
                    type="time"
                    name="time_spotted"
                    value={formData.time_spotted}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors bg-blue-50/50"
                  />
                </div>
              </div>
            </motion.div>

            {/* group size */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
              <label className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                <FaUsers className="text-teal-500" />
                Group Size
              </label>
              <input
                type="number"
                name="group_size"
                value={formData.group_size}
                onChange={handleChange}
                min="1"
                max="1000"
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors bg-blue-50/50"
              />
            </motion.div>

            {/* behavior */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }}>
              <label className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                <FaFileAlt className="text-blue-500" />
                Behavior
              </label>
              <input
                type="text"
                name="behavior"
                value={formData.behavior}
                onChange={handleChange}
                placeholder="e.g., Breaching, feeding, traveling"
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors bg-blue-50/50"
              />
            </motion.div>

            {/* notes */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }}>
              <label className="text-blue-700 font-semibold mb-2 block">Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                placeholder="Any additional observations about the sighting..."
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors bg-blue-50/50 resize-none"
              />
            </motion.div>

            {/* submit button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {loading ? 'Logging Sighting...' : 'Log Marine Sighting'}
            </motion.button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default SightingForm;