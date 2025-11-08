import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaHome, 
  FaFish, 
  FaUmbrellaBeach, 
  FaRecycle, 
  FaChartLine, 
  FaWater, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUser
} from 'react-icons/fa';
import { MdWaves } from 'react-icons/md';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard', color: 'from-blue-500 to-cyan-500' },
    { path: '/sightings', icon: FaFish, label: 'Sightings', color: 'from-cyan-500 to-teal-500' },
    { path: '/reports', icon: FaUmbrellaBeach, label: 'Beach Reports', color: 'from-orange-400 to-amber-500' },
    { path: '/actions', icon: FaRecycle, label: 'Conservation', color: 'from-green-500 to-emerald-500' },
    { path: '/analytics', icon: FaChartLine, label: 'Analytics', color: 'from-purple-500 to-pink-500' },
    { path: '/ocean-data', icon: FaWater, label: 'Ocean Data', color: 'from-blue-600 to-indigo-600' },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0d2f35] via-[#0f3d47] to-[#0d2f35] backdrop-blur-md border-b border-white/10 shadow-2xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* logo */}
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => handleNavigation('/dashboard')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <MdWaves className="text-[#74c9c5] text-3xl" />
              </motion.div>
              <span className="text-xl font-bold text-[#e1f7f5]" style={{ fontFamily: "'Playfair Display', serif" }}>
                WaveMinder
              </span>
            </motion.div>

            {/* desktop nav */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <motion.button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      active
                        ? 'text-white bg-white/20'
                        : 'text-[#a0d8d1] hover:text-white hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="text-lg" />
                    <span className="text-sm">{item.label}</span>
                    {active && (
                      <motion.div
                        className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${item.color}`}
                        layoutId="activeTab"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* user menu */}
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-[#a0d8d1] text-xs">Welcome,</p>
                <p className="text-[#e1f7f5] text-sm font-semibold">{user?.name}</p>
              </div>
              <motion.button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-[#e1f7f5] rounded-xl border border-white/20 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaSignOutAlt />
                <span className="text-sm">Logout</span>
              </motion.button>
            </div>

            {/* mobile menu button */}
            <motion.button
              className="md:hidden text-[#e1f7f5] p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </motion.button>
          </div>
        </div>

        {/* mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-[#0d2f35]/95 backdrop-blur-md border-t border-white/10"
            >
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <motion.button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                        active
                          ? 'text-white bg-white/20'
                          : 'text-[#a0d8d1] hover:text-white hover:bg-white/10'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="text-xl" />
                      <span>{item.label}</span>
                    </motion.button>
                  );
                })}
                
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3 px-4 py-2 text-[#a0d8d1]">
                    <FaUser />
                    <div>
                      <p className="text-xs">Logged in as</p>
                      <p className="text-sm font-semibold text-[#e1f7f5]">{user?.name}</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 mt-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-xl transition-all"
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      
      {/* */}
      <div className="h-16" />
    </>
  );
};

export default Navigation;