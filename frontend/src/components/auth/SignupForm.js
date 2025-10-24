import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaUser, FaMapMarkerAlt, FaFish, FaWater } from 'react-icons/fa';
import { MdWaves } from 'react-icons/md';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    location: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const formatError = (errorDetail) => {
    // array of validation errors from FastAPI
    if (Array.isArray(errorDetail)) {
      return errorDetail.map(err => err.msg || JSON.stringify(err)).join(', ');
    }
    // string errors
    if (typeof errorDetail === 'string') {
      return errorDetail;
    }
    // object errors
    if (typeof errorDetail === 'object') {
      return errorDetail.msg || JSON.stringify(errorDetail);
    }
    return 'An error occurred';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...signupData } = formData;
    const result = await signup(signupData);
    
    setLoading(false);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(formatError(result.error));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-ocean-gradient relative overflow-hidden p-5">
      {/* Animated bg elements */}
      <motion.div 
        className="absolute inset-0 opacity-10"
        animate={{ 
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          repeatType: 'reverse' 
        }}
      >
        <FaFish className="absolute top-20 right-20 text-ocean-200 text-6xl animate-float" />
        <MdWaves className="absolute bottom-32 left-10 text-ocean-200 text-8xl animate-wave" />
        <FaWater className="absolute top-1/3 right-1/4 text-ocean-200 text-5xl animate-float" style={{ animationDelay: '1.5s' }} />
        <FaFish className="absolute bottom-20 right-1/3 text-ocean-200 text-4xl animate-float" style={{ animationDelay: '3s' }} />
      </motion.div>

      <motion.div 
        className="bg-white/95 backdrop-blur-lg rounded-3xl p-12 w-full max-w-md shadow-2xl relative z-10 border border-ocean-200/20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-ocean-400 via-ocean-200 to-ocean-400 rounded-t-3xl" />

        <motion.div variants={itemVariants}>
          <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-ocean-600 to-ocean-400 bg-clip-text text-transparent">
            Join WaveMinder
          </h2>
          <p className="text-ocean-600 mb-8 opacity-80">
            Start tracking marine life today
          </p>
        </motion.div>
        
        {error && (
          <motion.div 
            className="bg-gradient-to-r from-red-50 to-red-100 text-red-700 px-4 py-3 rounded-xl mb-6 border-2 border-red-200 font-medium"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {error}
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit}>
          <motion.div className="mb-5" variants={itemVariants}>
            <label htmlFor="name" className="block mb-2 text-ocean-600 font-semibold text-sm tracking-wide">
              Name
            </label>
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ocean-400" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-ocean-100 rounded-xl text-ocean-700 bg-ocean-50 focus:outline-none focus:border-ocean-400 focus:bg-white focus:shadow-lg focus:shadow-ocean-400/10 transition-all duration-300"
                required
              />
            </div>
          </motion.div>

          <motion.div className="mb-5" variants={itemVariants}>
            <label htmlFor="email" className="block mb-2 text-ocean-600 font-semibold text-sm tracking-wide">
              Email
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ocean-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-ocean-100 rounded-xl text-ocean-700 bg-ocean-50 focus:outline-none focus:border-ocean-400 focus:bg-white focus:shadow-lg focus:shadow-ocean-400/10 transition-all duration-300"
                required
              />
            </div>
          </motion.div>

          <motion.div className="mb-5" variants={itemVariants}>
            <label htmlFor="location" className="block mb-2 text-ocean-600 font-semibold text-sm tracking-wide">
              Location <span className="text-ocean-300 text-xs">(Optional)</span>
            </label>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ocean-400" />
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., San Diego, CA"
                className="w-full pl-12 pr-4 py-3.5 border-2 border-ocean-100 rounded-xl text-ocean-700 bg-ocean-50 focus:outline-none focus:border-ocean-400 focus:bg-white focus:shadow-lg focus:shadow-ocean-400/10 transition-all duration-300 placeholder-ocean-300"
              />
            </div>
          </motion.div>

          <motion.div className="mb-5" variants={itemVariants}>
            <label htmlFor="password" className="block mb-2 text-ocean-600 font-semibold text-sm tracking-wide">
              Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ocean-400" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-ocean-100 rounded-xl text-ocean-700 bg-ocean-50 focus:outline-none focus:border-ocean-400 focus:bg-white focus:shadow-lg focus:shadow-ocean-400/10 transition-all duration-300"
                required
                minLength={6}
              />
            </div>
          </motion.div>

          <motion.div className="mb-6" variants={itemVariants}>
            <label htmlFor="confirmPassword" className="block mb-2 text-ocean-600 font-semibold text-sm tracking-wide">
              Confirm Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ocean-400" />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-ocean-100 rounded-xl text-ocean-700 bg-ocean-50 focus:outline-none focus:border-ocean-400 focus:bg-white focus:shadow-lg focus:shadow-ocean-400/10 transition-all duration-300"
                required
              />
            </div>
          </motion.div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-ocean-400 to-ocean-600 text-white rounded-xl font-semibold text-sm tracking-wider uppercase mt-2 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group"
            variants={itemVariants}
            whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            <span className="relative z-10">
              {loading ? 'Creating account...' : 'Sign Up'}
            </span>
            <motion.div
              className="absolute inset-0 bg-ocean-200/40"
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 2, opacity: 1 }}
              transition={{ duration: 0.6 }}
            />
          </motion.button>
        </form>

        <motion.div 
          className="mt-7 text-center text-ocean-600"
          variants={itemVariants}
        >
          <p>
            Already have an account?{' '}
            <motion.span
              onClick={() => navigate('/login')}
              className="text-ocean-400 cursor-pointer font-semibold relative inline-block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
              <motion.span 
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-ocean-400 to-ocean-200"
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.3 }}
              />
            </motion.span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignupForm;