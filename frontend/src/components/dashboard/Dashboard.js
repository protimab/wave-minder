import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaWater, FaFish, FaSignOutAlt } from 'react-icons/fa';
import { GiShrimp, GiJellyfish } from 'react-icons/gi';
import { MdWaves } from 'react-icons/md';
import StatsCard from './StatsCard';
import RecentSightings from './RecentSightings';
import { statsAPI, sightingsAPI, reportsAPI, actionsAPI } from '../../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState({
    sightings: 0,
    reports: 0,
    actions: 0,
  });
  const [recentSightings, setRecentSightings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [communityStats, userSightings, userReports, userActions, allSightings] = await Promise.all([
        statsAPI.getCommunityStats(),
        sightingsAPI.getAll({ user_id: user.id }),
        reportsAPI.getAll({ user_id: user.id }),
        actionsAPI.getAll({ user_id: user.id }),
        sightingsAPI.getAll({ limit: 5 }),
      ]);

      setStats(communityStats.data);
      setUserStats({
        sightings: userSightings.data.length,
        reports: userReports.data.length,
        actions: userActions.data.length,
      });
      setRecentSightings(allSightings.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const floatVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const swimVariants = {
    animate: {
      x: [0, 30, 0],
      y: [0, -10, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ocean-gradient">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-ocean-200 text-6xl"
        >
          <MdWaves />
        </motion.div>
        <span className="ml-4 text-white text-xl font-semibold">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-ocean-100 relative overflow-hidden">
      {/* background elems */}
      <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
        <motion.div variants={floatVariants} animate="animate" className="absolute top-10 left-10">
          <FaFish className="text-ocean-400 text-5xl" />
        </motion.div>
        <motion.div variants={swimVariants} animate="animate" style={{ animationDelay: '1s' }} className="absolute top-20 right-20">
          <GiJellyfish className="text-ocean-300 text-6xl" />
        </motion.div>
        <motion.div variants={floatVariants} animate="animate" style={{ animationDelay: '2s' }} className="absolute bottom-20 left-1/4">
          <GiShrimp className="text-ocean-400 text-4xl" />
        </motion.div>
        <motion.div variants={swimVariants} animate="animate" style={{ animationDelay: '3s' }} className="absolute bottom-10 right-1/3">
          <FaWater className="text-ocean-300 text-5xl" />
        </motion.div>
      </div>

      {/* header */}
      <motion.header 
        className="bg-ocean-gradient shadow-lg relative z-10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <MdWaves className="text-ocean-200 text-4xl" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">WaveMinder</h1>
            </motion.div>
            <div className="flex items-center gap-4">
              <span className="text-ocean-100 text-sm md:text-base">
                Welcome, <span className="font-semibold text-white">{user?.name}</span>!
              </span>
              <motion.button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm border border-white/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* quick tab */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              onClick={() => navigate('/sightings/new')}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-2 border-ocean-200 hover:border-ocean-400 group"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl">🐋</span>
              <span className="font-semibold text-ocean-600 group-hover:text-ocean-700">Log Sighting</span>
            </motion.button>
            <motion.button
              onClick={() => navigate('/reports/new')}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-2 border-ocean-200 hover:border-ocean-400 group"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl">🏖️</span>
              <span className="font-semibold text-ocean-600 group-hover:text-ocean-700">Beach Report</span>
            </motion.button>
            <motion.button
              onClick={() => navigate('/actions/new')}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-2 border-ocean-200 hover:border-ocean-400 group"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl">♻️</span>
              <span className="font-semibold text-ocean-600 group-hover:text-ocean-700">Conservation Action</span>
            </motion.button>
          </div>
        </motion.div>

        {/* user contrbutions */}
        <motion.section 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-ocean-700 mb-4">Your Contributions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard
              title="Marine Sightings"
              value={userStats.sightings}
              icon="🐋"
              onClick={() => navigate('/sightings')}
            />
            <StatsCard
              title="Beach Reports"
              value={userStats.reports}
              icon="🏖️"
              onClick={() => navigate('/reports')}
            />
            <StatsCard
              title="Conservation Actions"
              value={userStats.actions}
              icon="♻️"
              onClick={() => navigate('/actions')}
            />
          </div>
        </motion.section>

        {/* comm impact */}
        {stats && (
          <motion.section 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-ocean-700 mb-4">Community Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Actions"
                value={stats.total_actions}
                icon="🌟"
              />
              <StatsCard
                title="Participants"
                value={stats.total_participants}
                icon="👥"
              />
              <StatsCard
                title="Waste Collected"
                value={`${stats.total_waste_kg.toFixed(1)} kg`}
                icon="🗑️"
              />
              <StatsCard
                title="Area Covered"
                value={`${stats.total_area_sqm.toFixed(0)} m²`}
                icon="📏"
              />
            </div>
          </motion.section>
        )}

        {/* recent sightings */}
        <RecentSightings sightings={recentSightings} />
      </main>
    </div>
  );
};


export default Dashboard;