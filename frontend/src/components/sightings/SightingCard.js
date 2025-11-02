import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { FaMapMarkerAlt, FaCalendarAlt, FaTrash, FaUsers, FaClock, FaMap } from 'react-icons/fa';

const SightingCard = ({ sighting, onDelete }) => {
  const { user } = useAuth();
  const isOwner = user && sighting.user_name === user.name;

  const getSpeciesColor = (type) => {
    const colors = {
      Whale: 'from-blue-500 to-indigo-600',
      Dolphin: 'from-cyan-400 to-blue-500',
      Seal: 'from-gray-400 to-slate-600',
      'Sea Lion': 'from-amber-400 to-orange-500',
      'Sea Turtle': 'from-green-400 to-emerald-600',
      Shark: 'from-slate-500 to-gray-700',
      Ray: 'from-purple-400 to-pink-500',
      Fish: 'from-teal-400 to-cyan-500',
      Seabird: 'from-sky-400 to-blue-500',
      Other: 'from-blue-400 to-cyan-500'
    };
    return colors[type] || 'from-blue-400 to-cyan-500';
  };

  const getSpeciesBadgeColor = (type) => {
    const colors = {
      Whale: 'bg-blue-100 text-blue-700 border-blue-300',
      Dolphin: 'bg-cyan-100 text-cyan-700 border-cyan-300',
      Seal: 'bg-gray-100 text-gray-700 border-gray-300',
      'Sea Lion': 'bg-amber-100 text-amber-700 border-amber-300',
      'Sea Turtle': 'bg-green-100 text-green-700 border-green-300',
      Shark: 'bg-slate-100 text-slate-700 border-slate-300',
      Ray: 'bg-purple-100 text-purple-700 border-purple-300',
      Fish: 'bg-teal-100 text-teal-700 border-teal-300',
      Seabird: 'bg-sky-100 text-sky-700 border-sky-300',
      Other: 'bg-blue-100 text-blue-700 border-blue-300'
    };
    return colors[type] || 'bg-blue-100 text-blue-700 border-blue-300';
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 border-blue-100 relative"
      whileHover={{ y: -4, scale: 1.02 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* colored top bar */}
      <div className={`h-2 bg-gradient-to-r ${getSpeciesColor(sighting.species_type)}`} />

      <div className="p-6">
        {/* header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-blue-800 mb-2">{sighting.species_name}</h3>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border-2 ${getSpeciesBadgeColor(sighting.species_type)}`}>
              <span>{sighting.species_type}</span>
            </div>
          </div>
          {isOwner && (
            <motion.button
              onClick={() => onDelete(sighting.id)}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              title="Delete sighting"
            >
              <FaTrash size={18} />
            </motion.button>
          )}
        </div>

        {/* location info */}
        <div className="space-y-2 mb-4">
          {sighting.location_name && (
            <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
              <FaMapMarkerAlt className="text-blue-500" />
              <span className="font-semibold">{sighting.location_name}</span>
            </div>
          )}

          {(sighting.latitude && sighting.longitude) && (
            <div className="flex items-center gap-2 text-sm text-cyan-700 bg-cyan-50 px-3 py-2 rounded-lg">
              <FaMap className="text-cyan-500" />
              <span className="font-mono text-xs">
                {sighting.latitude.toFixed(4)}, {sighting.longitude.toFixed(4)}
              </span>
            </div>
          )}
        </div>

        {/* date and time */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <FaCalendarAlt className="text-blue-500" />
              <span className="text-xs font-medium text-blue-700">Date</span>
            </div>
            <p className="text-sm font-bold text-blue-900">
              {new Date(sighting.date_spotted).toLocaleDateString()}
            </p>
          </div>

          {sighting.time_spotted && (
            <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-lg p-3 border border-cyan-200">
              <div className="flex items-center gap-2 mb-1">
                <FaClock className="text-cyan-500" />
                <span className="text-xs font-medium text-cyan-700">Time</span>
              </div>
              <p className="text-sm font-bold text-cyan-900">{sighting.time_spotted}</p>
            </div>
          )}
        </div>

        {/* group size */}
        {sighting.group_size > 1 && (
          <div className="flex items-center gap-2 text-sm text-teal-700 bg-teal-50 px-3 py-2 rounded-lg mb-3">
            <FaUsers className="text-teal-500" />
            <span>Group of <span className="font-semibold">{sighting.group_size}</span></span>
          </div>
        )}

        {/* behavior */}
        {sighting.behavior && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg mb-4">
            <p className="text-xs text-blue-600 font-semibold mb-1">Behavior Observed</p>
            <p className="text-sm text-blue-800">{sighting.behavior}</p>
          </div>
        )}

        {/* notes */}
        {sighting.notes && (
          <div className="bg-cyan-50 border-l-4 border-cyan-400 p-3 rounded-r-lg mb-4">
            <p className="text-xs text-cyan-600 font-semibold mb-1">Additional Notes</p>
            <p className="text-sm text-cyan-800 italic">{sighting.notes}</p>
          </div>
        )}

        {/* footer */}
        <div className="pt-3 border-t border-blue-100 text-xs text-blue-600">
          <span className="font-medium">Reported by {sighting.user_name}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SightingCard;