import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUmbrellaBeach, FaArrowLeft, FaMapMarkerAlt, FaTint, FaSmog, FaTemperatureHigh, FaSun, FaFish, FaCalendarAlt } from 'react-icons/fa';
import { reportsAPI } from '../../services/api';
import { QUALITY_SCALE, WILDLIFE_ACTIVITY_LEVELS } from '../../utils/constants';

const BeachReportForm = () => {
  const [formData, setFormData] = useState({
    beach_name: '',
    latitude: '',
    longitude: '',
    water_quality: 3,
    pollution_level: 3,
    water_temp: '',
    wildlife_activity: '',
    weather_conditions: '',
    notes: '',
    report_date: new Date().toISOString().split('T')[0],
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
        water_quality: parseInt(formData.water_quality),
        pollution_level: parseInt(formData.pollution_level),
        water_temp: formData.water_temp ? parseFloat(formData.water_temp) : null,
      };

      await reportsAPI.create(submitData);
      navigate('/reports');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create report');
    } finally {
      setLoading(false);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* header */}
      <motion.header
        className="bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500 shadow-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaUmbrellaBeach className="text-white text-3xl" />
              <h1 className="text-2xl md:text-3xl font-bold text-white">Create Beach Report</h1>
            </div>
            <motion.button
              onClick={() => navigate('/reports')}
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

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-2 border-orange-100 space-y-6">
            {/* beach's name */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <label className="flex items-center gap-2 text-orange-700 font-semibold mb-2">
                <FaMapMarkerAlt className="text-orange-500" />
                Beach Name *
              </label>
              <input
                type="text"
                name="beach_name"
                value={formData.beach_name}
                onChange={handleChange}
                placeholder="e.g., La Jolla Shores"
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors bg-orange-50/50"
                required
              />
            </motion.div>

            {/* coordinates */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <label className="text-orange-700 font-semibold mb-2 block">Location Coordinates</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  step="0.000001"
                  placeholder="Latitude (e.g., 32.8509)"
                  className="px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors bg-orange-50/50"
                />
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  step="0.000001"
                  placeholder="Longitude (e.g., -117.2713)"
                  className="px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors bg-orange-50/50"
                />
              </div>
            </motion.div>

            {/* quality ratings */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-orange-700 font-semibold mb-2">
                    <FaTint className="text-blue-500" />
                    Water Quality (1-5) *
                  </label>
                  <select
                    name="water_quality"
                    value={formData.water_quality}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors bg-orange-50/50"
                    required
                  >
                    {QUALITY_SCALE.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-orange-700 font-semibold mb-2">
                    <FaSmog className="text-gray-500" />
                    Pollution Level (1-5) *
                  </label>
                  <select
                    name="pollution_level"
                    value={formData.pollution_level}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors bg-orange-50/50"
                    required
                  >
                    {QUALITY_SCALE.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* enviro conditions */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-orange-700 font-semibold mb-2">
                    <FaTemperatureHigh className="text-red-500" />
                    Water Temperature (°C)
                  </label>
                  <input
                    type="number"
                    name="water_temp"
                    value={formData.water_temp}
                    onChange={handleChange}
                    step="0.1"
                    placeholder="20.5"
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors bg-orange-50/50"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-orange-700 font-semibold mb-2">
                    <FaFish className="text-teal-500" />
                    Wildlife Activity
                  </label>
                  <select
                    name="wildlife_activity"
                    value={formData.wildlife_activity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors bg-orange-50/50"
                  >
                    <option value="">Select level...</option>
                    {WILDLIFE_ACTIVITY_LEVELS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* weather */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
              <label className="flex items-center gap-2 text-orange-700 font-semibold mb-2">
                <FaSun className="text-yellow-500" />
                Weather Conditions
              </label>
              <input
                type="text"
                name="weather_conditions"
                value={formData.weather_conditions}
                onChange={handleChange}
                placeholder="e.g., Sunny, calm winds"
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors bg-orange-50/50"
              />
            </motion.div>

            {/* date */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }}>
              <label className="flex items-center gap-2 text-orange-700 font-semibold mb-2">
                <FaCalendarAlt className="text-orange-500" />
                Report Date *
              </label>
              <input
                type="date"
                name="report_date"
                value={formData.report_date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors bg-orange-50/50"
                required
              />
            </motion.div>

            {/* notes */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }}>
              <label className="text-orange-700 font-semibold mb-2 block">Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                placeholder="Any additional observations about the beach conditions..."
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors bg-orange-50/50 resize-none"
              />
            </motion.div>

            {/* submit button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {loading ? 'Submitting Report...' : 'Submit Beach Report'}
            </motion.button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default BeachReportForm;