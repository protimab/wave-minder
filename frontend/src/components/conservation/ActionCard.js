import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { FaMapMarkerAlt, FaCalendarAlt, FaTrash, FaUsers, FaWeightHanging, FaRuler } from 'react-icons/fa';

const ActionCard = ({ action, onDelete }) => {
  const { user } = useAuth();
  const isOwner = user && action.user_name === user.name;

  const getActionIcon = (type) => {
    const icons = {
      beach_cleanup: '🧹',
      citizen_science: '🔬',
      education: '📚',
      restoration: '🌱',
      monitoring: '👁️',
      policy_advocacy: '📢'
    };
    return icons[type] || '♻️';
  };

  const formatActionType = (type) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getActionColor = (type) => {
    const colors = {
      beach_cleanup: 'from-blue-400 to-cyan-500',
      citizen_science: 'from-purple-400 to-pink-500',
      education: 'from-yellow-400 to-orange-500',
      restoration: 'from-green-400 to-emerald-500',
      monitoring: 'from-teal-400 to-blue-500',
      policy_advocacy: 'from-red-400 to-rose-500'
    };
    return colors[type] || 'from-green-400 to-emerald-500';
  };

  const getActionBadgeColor = (type) => {
    const colors = {
      beach_cleanup: 'bg-blue-100 text-blue-700 border-blue-300',
      citizen_science: 'bg-purple-100 text-purple-700 border-purple-300',
      education: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      restoration: 'bg-green-100 text-green-700 border-green-300',
      monitoring: 'bg-teal-100 text-teal-700 border-teal-300',
      policy_advocacy: 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[type] || 'bg-green-100 text-green-700 border-green-300';
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 border-green-100 relative"
      whileHover={{ y: -4, scale: 1.02 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* colored top bar */}
      <div className={`h-2 bg-gradient-to-r ${getActionColor(action.action_type)}`} />

      <div className="p-6">
        {/* header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{getActionIcon(action.action_type)}</span>
              <h3 className="text-xl font-bold text-green-800">{action.title}</h3>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border-2 ${getActionBadgeColor(action.action_type)}`}>
              <span>{formatActionType(action.action_type)}</span>
            </div>
          </div>
          {isOwner && (
            <motion.button
              onClick={() => onDelete(action.id)}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              title="Delete action"
            >
              <FaTrash size={18} />
            </motion.button>
          )}
        </div>

        {/* description */}
        {action.description && (
          <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg mb-4">
            <p className="text-sm text-green-800">{action.description}</p>
          </div>
        )}

        {/* location */}
        {action.location_name && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg mb-3">
            <FaMapMarkerAlt className="text-green-500" />
            <span className="font-semibold">{action.location_name}</span>
          </div>
        )}

        {/* stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-3 border border-emerald-200">
            <div className="flex items-center gap-2 mb-1">
              <FaUsers className="text-emerald-500" />
              <span className="text-xs font-medium text-emerald-700">Participants</span>
            </div>
            <p className="text-lg font-bold text-emerald-900">{action.participants}</p>
          </div>

          {action.waste_collected > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <FaWeightHanging className="text-blue-500" />
                <span className="text-xs font-medium text-blue-700">Waste</span>
              </div>
              <p className="text-lg font-bold text-blue-900">{action.waste_collected.toFixed(1)} kg</p>
            </div>
          )}

          {action.area_covered > 0 && (
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-3 border border-teal-200">
              <div className="flex items-center gap-2 mb-1">
                <FaRuler className="text-teal-500" />
                <span className="text-xs font-medium text-teal-700">Area</span>
              </div>
              <p className="text-lg font-bold text-teal-900">{action.area_covered.toFixed(0)} m²</p>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="pt-3 border-t border-green-100 flex justify-between items-center text-xs text-green-600">
          <span className="font-medium">Led by {action.user_name}</span>
          <div className="flex items-center gap-1">
            <FaCalendarAlt />
            <span>{new Date(action.date_completed).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ActionCard;