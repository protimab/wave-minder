import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { oceanDataAPI } from '../../services/api';
import { FaWater, FaTemperatureHigh, FaArrowUp, FaArrowDown, FaClock } from 'react-icons/fa';
import { MdWaves } from 'react-icons/md';

const OceanDataDashboard = ({ latitude, longitude, locationName }) => {
  const [oceanData, setOceanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOceanData();
  }, [latitude, longitude]);

  const fetchOceanData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await oceanDataAPI.getConditions(
        locationName, 
        latitude, 
        longitude, 
        7
      );
      setOceanData(response.data);
    } catch (err) {
      console.error('Error fetching ocean data:', err);
      setError('Unable to load ocean data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <MdWaves className="text-blue-500 text-5xl" />
        </motion.div>
        <span className="ml-4 text-blue-700 text-lg">Loading ocean data...</span>
      </div>
    );
  }

  if (error || !oceanData) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700">{error || 'No data available'}</p>
      </div>
    );
  }

  const nextTides = oceanData.data.tides?.tides
    ?.filter(t => new Date(t.time) > new Date())
    .slice(0, 4) || [];

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">{locationName}</h2>
        <p className="text-sm opacity-80">
          Last updated: {new Date(oceanData.timestamp).toLocaleString()}
        </p>
      </div>

      {/* current conditions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* wave height */}
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white">
          <p className="text-sm mb-2">Wave Height</p>
          <p className="text-4xl font-bold">
            {oceanData.data.weather?.current?.wave_height_m?.toFixed(1)}m
          </p>
        </div>

        {/* water temp */}
        <div className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl p-6 text-white">
          <p className="text-sm mb-2">Water Temperature</p>
          <p className="text-4xl font-bold">
            {oceanData.data.temperature?.temperature_data?.[0]?.temp_c?.toFixed(1)}°C
          </p>
        </div>

        {/* wave direction */}
        <div className="bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl p-6 text-white">
          <p className="text-sm mb-2">Wave Direction</p>
          <p className="text-4xl font-bold">
            {Math.round(oceanData.data.weather?.current?.wave_direction || 0)}°
          </p>
        </div>
      </div>

      {/* tide info */}
      {nextTides.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border-2 border-blue-100">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">Upcoming Tides</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {nextTides.map((tide, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl ${
                  tide.type === 'high' 
                    ? 'bg-blue-50 border-2 border-blue-300' 
                    : 'bg-orange-50 border-2 border-orange-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {tide.type === 'high' ? <FaArrowUp /> : <FaArrowDown />}
                  <span className="font-bold capitalize">{tide.type} Tide</span>
                </div>
                <p className="text-2xl font-bold">{tide.height_feet.toFixed(1)} ft</p>
                <p className="text-sm text-gray-600">
                  {new Date(tide.time).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OceanDataDashboard;