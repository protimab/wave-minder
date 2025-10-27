import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { FaMapMarkerAlt, FaCalendarAlt, FaTrash, FaTemperatureHigh, FaSun, FaFish, FaTint, FaSmog } from 'react-icons/fa';

const BeachReportCard = ({ report, onDelete }) => {
  const { user } = useAuth();
  const isOwner = user && report.user_name === user.name;

  const getQualityColor = (score) => {
    if (score >= 4) return 'from-green-400 to-emerald-500';
    if (score >= 3) return 'from-yellow-400 to-orange-400';
    return 'from-red-400 to-rose-500';
  };

  const getQualityBadgeColor = (score) => {
    if (score >= 4) return 'bg-green-100 text-green-700 border-green-300';
    if (score >= 3) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-red-100 text-red-700 border-red-300';
  };

  const getQualityLabel = (value) => {
    const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    return labels[value - 1] || 'N/A';
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 border-orange-100 relative"
      whileHover={{ y: -4, scale: 1.02 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* colored top bar based on quality :) */}
      {report.quality_score && (
        <div className={`h-2 bg-gradient-to-r ${getQualityColor(report.quality_score)}`} />
      )}

      <div className="p-6">
        {/* header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FaMapMarkerAlt className="text-orange-500" />
              <h3 className="text-xl font-bold text-orange-800">{report.beach_name}</h3>
            </div>
            {report.quality_score && (
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border-2 ${getQualityBadgeColor(report.quality_score)}`}>
                <span>Overall: {report.quality_score}/5</span>
              </div>
            )}
          </div>
          {isOwner && (
            <motion.button
              onClick={() => onDelete(report.id)}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              title="Delete report"
            >
              <FaTrash size={18} />
            </motion.button>
          )}
        </div>

        {/* metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <FaTint className="text-blue-500" />
              <span className="text-xs font-medium text-blue-700">Water Quality</span>
            </div>
            <p className="text-sm font-bold text-blue-900">{getQualityLabel(report.water_quality)}</p>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <FaSmog className="text-gray-500" />
              <span className="text-xs font-medium text-gray-700">Pollution</span>
            </div>
            <p className="text-sm font-bold text-gray-900">{getQualityLabel(report.pollution_level)}</p>
          </div>
        </div>

        {/* additional details */}
        <div className="space-y-2 mb-4">
          {report.water_temp && (
            <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 px-3 py-2 rounded-lg">
              <FaTemperatureHigh className="text-orange-500" />
              <span>Water Temp: <span className="font-semibold">{report.water_temp}°C</span></span>
            </div>
          )}

          {report.wildlife_activity && (
            <div className="flex items-center gap-2 text-sm text-teal-700 bg-teal-50 px-3 py-2 rounded-lg">
              <FaFish className="text-teal-500" />
              <span>Wildlife: <span className="font-semibold capitalize">{report.wildlife_activity}</span></span>
            </div>
          )}

          {report.weather_conditions && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
              <FaSun className="text-amber-500" />
              <span className="font-semibold">{report.weather_conditions}</span>
            </div>
          )}
        </div>

        {/* notes */}
        {report.notes && (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-lg mb-4">
            <p className="text-sm text-orange-800 italic">{report.notes}</p>
          </div>
        )}

        {/* footer */}
        <div className="pt-3 border-t border-orange-100 flex justify-between items-center text-xs text-orange-600">
          <span className="font-medium">By {report.user_name}</span>
          <div className="flex items-center gap-1">
            <FaCalendarAlt />
            <span>{new Date(report.report_date).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BeachReportCard;