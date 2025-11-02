import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRecycle, FaArrowLeft, FaMapMarkerAlt, FaUsers, FaWeightHanging, FaRuler, FaCalendarAlt, FaFileAlt } from 'react-icons/fa';
import { actionsAPI } from '../../services/api';
import { ACTION_TYPES } from '../../utils/constants';

const ActionForm = () => {
  const [formData, setFormData] = useState({
    action_type: '',
    title: '',
    description: '',
    location_name: '',
    latitude: '',
    longitude: '',
    participants: 1,
    waste_collected: 0,
    area_covered: 0,
    date_completed: new Date().toISOString().split('T')[0],
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
        participants: parseInt(formData.participants) || 1,
        waste_collected: parseFloat(formData.waste_collected) || 0,
        area_covered: parseFloat(formData.area_covered) || 0,
      };

      await actionsAPI.create(submitData);
      navigate('/actions');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create action');
    } finally {
      setLoading(false);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100">
      {/* header */}
      <motion.header
        className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 shadow-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaRecycle className="text-white text-3xl" />
              <h1 className="text-2xl md:text-3xl font-bold text-white">Log Conservation Action</h1>
            </div>
            <motion.button
              onClick={() => navigate('/actions')}
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

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-2 border-green-100 space-y-6">
            {/* action type */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <label className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                <FaRecycle className="text-green-500" />
                Action Type *
              </label>
              <select
                name="action_type"
                value={formData.action_type}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-400 focus:outline-none transition-colors bg-green-50/50"
                required
              >
                <option value="">Select type...</option>
                {ACTION_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* title */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <label className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                <FaFileAlt className="text-green-500" />
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Pacific Beach Cleanup"
                className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-400 focus:outline-none transition-colors bg-green-50/50"
                required
              />
            </motion.div>

            {/* description */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <label className="text-green-700 font-semibold mb-2 block">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Brief description of the conservation action..."
                className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-400 focus:outline-none transition-colors bg-green-50/50 resize-none"
              />
            </motion.div>

            {/* location */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
              <label className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                <FaMapMarkerAlt className="text-green-500" />
                Location Name
              </label>
              <input
                type="text"
                name="location_name"
                value={formData.location_name}
                onChange={handleChange}
                placeholder="e.g., Pacific Beach"
                className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-400 focus:outline-none transition-colors bg-green-50/50"
              />
            </motion.div>

            {/* coordinates */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
              <label className="text-green-700 font-semibold mb-2 block">Location Coordinates</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  step="0.000001"
                  placeholder="Latitude (e.g., 32.8509)"
                  className="px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-400 focus:outline-none transition-colors bg-green-50/50"
                />
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  step="0.000001"
                  placeholder="Longitude (e.g., -117.2713)"
                  className="px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-400 focus:outline-none transition-colors bg-green-50/50"
                />
              </div>
            </motion.div>

            {/* metrics */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                    <FaUsers className="text-emerald-500" />
                    Participants *
                  </label>
                  <input
                    type="number"
                    name="participants"
                    value={formData.participants}
                    onChange={handleChange}
                    min="1"
                    max="10000"
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-400 focus:outline-none transition-colors bg-green-50/50"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                    <FaWeightHanging className="text-blue-500" />
                    Waste (kg)
                  </label>
                  <input
                    type="number"
                    name="waste_collected"
                    value={formData.waste_collected}
                    onChange={handleChange}
                    min="0"
                    max="10000"
                    step="0.1"
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-400 focus:outline-none transition-colors bg-green-50/50"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                    <FaRuler className="text-teal-500" />
                    Area (m²)
                  </label>
                  <input
                    type="number"
                    name="area_covered"
                    value={formData.area_covered}
                    onChange={handleChange}
                    min="0"
                    max="1000000"
                    step="0.1"
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-400 focus:outline-none transition-colors bg-green-50/50"
                  />
                </div>
              </div>
            </motion.div>

            {/* date */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }}>
              <label className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                <FaCalendarAlt className="text-green-500" />
                Date Completed *
              </label>
              <input
                type="date"
                name="date_completed"
                value={formData.date_completed}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-400 focus:outline-none transition-colors bg-green-50/50"
                required
              />
            </motion.div>

            {/* submit button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {loading ? 'Logging Action...' : 'Log Conservation Action'}
            </motion.button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default ActionForm;