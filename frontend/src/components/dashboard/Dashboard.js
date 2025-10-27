import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFish, FaSignOutAlt, FaQuoteLeft } from 'react-icons/fa';
import { GiShrimp, GiJellyfish, GiWhaleTail, GiDolphin, GiTurtle } from 'react-icons/gi';
import { MdWaves } from 'react-icons/md';
import StatsCard from './StatsCard';
import RecentSightings from './RecentSightings';
import { statsAPI, sightingsAPI, reportsAPI, actionsAPI } from '../../services/api';

const oceanFacts = [
  { fact: "The ocean produces over 50% of the world's oxygen and absorbs 25% of all carbon dioxide emissions.", icon: "🌊" },
  { fact: "More than 80% of the ocean remains unexplored and unmapped by humans.", icon: "🗺️" },
  { fact: "The longest mountain range in the world is underwater - the Mid-Ocean Ridge spans over 65,000 kilometers.", icon: "⛰️" },
  { fact: "Coral reefs support 25% of all marine life, despite covering less than 1% of the ocean floor.", icon: "🪸" },
  { fact: "A single blue whale can consume up to 40 million krill in a single day.", icon: "🐋" },
  { fact: "Ocean currents can take up to 1,000 years to circulate the entire globe.", icon: "🌀" },
];

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
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrolled / maxScroll;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const backgroundY = scrollProgress * 10;
  const heroOpacity = Math.max(0, 1 - scrollProgress * 3.33);
  const heroScale = Math.max(0.95, 1 - scrollProgress * 0.167);

  useEffect(() => {
    fetchDashboardData();
    const factInterval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % oceanFacts.length);
    }, 10000);
    return () => clearInterval(factInterval);
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
      rotate: [0, 5, -5, 0],
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
      y: [0, -15, 0],
      rotate: [0, -10, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

   if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#b5d8f3] via-[#e5d4ef] to-[#f8d7e8]">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" } }}
          className="text-[#8fbcd4] text-6xl mb-4"
        >
          <MdWaves />
        </motion.div>
        <motion.span 
          className="text-[#8fbcd4] text-xl font-light tracking-wider"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ fontFamily: "'Quicksand', sans-serif" }}
        >
          Floating through calm seas...
        </motion.span>
      </div>
    );
  }

    return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0b3d4b 0%, #0f5961 40%, #124c47 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 20s ease infinite'
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600&family=Playfair+Display:wght@400;600&display=swap');
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 bg-[#1a6f7c]/30 rounded-full blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-40 w-96 h-96 bg-[#1a7a66]/25 rounded-full blur-3xl"
          animate={{ x: [0, -100, 0], y: [0, 100, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-96 h-96 bg-[#186d70]/25 rounded-full blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, -50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

       {/* floating background animals */}
      <motion.div 
        className="fixed inset-0 pointer-events-none overflow-hidden z-0"
        style={{ y: `${backgroundY}%` }}
      >
        <div className="absolute inset-0 opacity-15">
          <motion.div 
            variants={floatVariants} 
            animate="animate" 
            className="absolute top-20 left-10"
          >
            <GiWhaleTail className="text-purple-300 text-8xl drop-shadow-2xl" />
          </motion.div>
          <motion.div 
            variants={swimVariants} 
            animate="animate" 
            className="absolute top-40 right-20"
          >
            <GiJellyfish className="text-pink-300 text-7xl drop-shadow-2xl" />
          </motion.div>
          <motion.div 
            variants={floatVariants} 
            animate="animate" 
            className="absolute top-1/2 left-1/4"
            style={{ animationDelay: '1s' }}
          >
            <GiDolphin className="text-cyan-300 text-6xl drop-shadow-2xl" />
          </motion.div>
          <motion.div 
            variants={swimVariants} 
            animate="animate" 
            className="absolute bottom-40 left-1/3"
            style={{ animationDelay: '2s' }}
          >
            <GiTurtle className="text-emerald-300 text-7xl drop-shadow-2xl" />
          </motion.div>
          <motion.div 
            variants={floatVariants} 
            animate="animate" 
            className="absolute bottom-60 right-1/4"
            style={{ animationDelay: '3s' }}
          >
            <FaFish className="text-orange-300 text-5xl drop-shadow-2xl" />
          </motion.div>
          <motion.div 
            variants={swimVariants} 
            animate="animate" 
            className="absolute top-3/4 right-1/3"
            style={{ animationDelay: '4s' }}
          >
            <GiShrimp className="text-rose-300 text-5xl drop-shadow-2xl" />
          </motion.div>
        </div>
      </motion.div>

      {/* header */}
      <motion.header 
        className="sticky top-0 backdrop-blur-md bg-[#0d2f35]/70 shadow-lg border-b border-[#184a4a]/40 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <MdWaves className="text-[#74c9c5] text-5xl" />
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold text-[#e1f7f5]" style={{ fontFamily: "'Playfair Display', serif" }}>
                WaveMinder
              </h1>
              <p className="text-sm text-[#a0d8d1]" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                Protecting Our Oceans Together
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[#8ccac3] text-xs" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                Welcome back,
              </p>
              <span className="text-[#e1f7f5] font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                {user?.name}
              </span>
            </div>
            <motion.button
              onClick={logout}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1a4e4f]/60 hover:bg-[#1f5f5f]/70 text-[#e1f7f5] rounded-2xl border border-[#2d7676]/40 transition-all shadow-md"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              <FaSignOutAlt />
              <span className="hidden sm:inline font-medium">Logout</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* ocean fact section */}
      <motion.section className="relative z-10 py-12 px-4" style={{ opacity: heroOpacity, scale: heroScale }}>
        <div className="max-w-5xl mx-auto bg-[#0f3438]/70 backdrop-blur-md border border-[#1f5f5f]/40 p-10 rounded-3xl shadow-xl">
          <div className="flex items-start gap-4">
            <motion.div
              className="text-5xl"
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {oceanFacts[currentFactIndex].icon}
            </motion.div>
            <div>
              <FaQuoteLeft className="text-[#74c9c5]/70 text-xl mb-2" />
              <h3 className="text-[#a0d8d1] text-sm uppercase font-semibold tracking-widest mb-2" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                Ocean Fact
              </h3>
              <motion.p
                key={currentFactIndex}
                className="text-[#d4f3ef] text-lg leading-relaxed"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                style={{ fontFamily: "'Quicksand', sans-serif" }}
              >
                {oceanFacts[currentFactIndex].fact}
              </motion.p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* quick action cards */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center drop-shadow-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Take Action
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.button
              onClick={() => navigate('/sightings/new')}
              className="relative overflow-hidden group backdrop-blur-xl bg-white/20 p-8 shadow-2xl hover:shadow-3xl transition-all border border-white/30"
              whileHover={{ scale: 1.05, y: -8, rotate: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                borderRadius: '50px 20px 50px 20px',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all" />
              <div className="relative">
                <motion.div 
                  className="text-7xl mb-4"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                >
                  🐋
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Log Sighting
                </h3>
                <p className="text-white/80 text-sm font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Document marine life encounters
                </p>
              </div>
            </motion.button>

            <motion.button
              onClick={() => navigate('/reports/new')}
              className="relative overflow-hidden group backdrop-blur-xl bg-white/20 p-8 shadow-2xl hover:shadow-3xl transition-all border border-white/30"
              whileHover={{ scale: 1.05, y: -8, rotate: 2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                borderRadius: '20px 50px 20px 50px',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 group-hover:from-cyan-500/30 group-hover:to-teal-500/30 transition-all" />
              <div className="relative">
                <motion.div 
                  className="text-7xl mb-4"
                  whileHover={{ scale: 1.2, rotate: -10 }}
                >
                  🏖️
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Beach Report
                </h3>
                <p className="text-white/80 text-sm font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Share coastal conditions
                </p>
              </div>
            </motion.button>

            <motion.button
              onClick={() => navigate('/actions/new')}
              className="relative overflow-hidden group backdrop-blur-xl bg-white/20 p-8 shadow-2xl hover:shadow-3xl transition-all border border-white/30"
              whileHover={{ scale: 1.05, y: -8, rotate: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                borderRadius: '40px 30px 40px 30px',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all" />
              <div className="relative">
                <motion.div 
                  className="text-7xl mb-4"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                >
                  ♻️
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Conservation Action
                </h3>
                <p className="text-white/80 text-sm font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Join cleanup efforts
                </p>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* user contributions :p */}
        <motion.div
          className="relative mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <motion.div 
              className="h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent flex-1 rounded-full"
              animate={{ scaleX: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center drop-shadow-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Your Impact
            </h2>
            <motion.div 
              className="h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent flex-1 rounded-full"
              animate={{ scaleX: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
          
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
        </motion.div>

        {/* community impact */}
        {stats && (
          <motion.div
            className="relative mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <motion.div 
                className="h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent flex-1 rounded-full"
                animate={{ scaleX: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              />
              <h2 className="text-4xl md:text-5xl font-bold text-white text-center drop-shadow-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Community Impact
              </h2>
              <motion.div 
                className="h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent flex-1 rounded-full"
                animate={{ scaleX: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          </motion.div>
        )}

        {/* recent sightings */}
        <RecentSightings sightings={recentSightings} />

        {/* footer waves */}
        <motion.div 
          className="mt-24 text-center pb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex justify-center gap-3 mb-6">
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            >
              <MdWaves className="text-white/60 text-5xl drop-shadow-xl" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
            >
              <MdWaves className="text-white/60 text-5xl drop-shadow-xl" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
            >
              <MdWaves className="text-white/60 text-5xl drop-shadow-xl" />
            </motion.div>
          </div>
          <p className="text-white/90 text-xl italic font-light mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
            "The sea, once it casts its spell, holds one in its net of wonder forever."
          </p>
          <p className="text-white/70 text-sm font-light tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>
            — Jacques Cousteau
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;