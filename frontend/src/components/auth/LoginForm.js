import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaWater, FaFish } from 'react-icons/fa';
import { MdWaves } from 'react-icons/md';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
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
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-ocean-gradient relative overflow-hidden p-5">
      {/* info about the animated bg elements */}
      <motion.div 
        className="absolute inset-0 opacity-30"
        animate={{ 
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          repeatType: 'reverse' 
        }}
      >
        <FaFish className="absolute top-20 left-20 text-ocean-200 text-6xl animate-float" /> {/* fish */}
        <FaFish className="absolute bottom-20 right-10 text-ocean-600 text-6xl opacity-100 animate-float" />
        <MdWaves className="absolute bottom-10 left-1/4 text-ocean-200 text-5xl animate-wave" /> {/* wave */}
        <MdWaves className="absolute bottom-5 right-1/4 text-ocean-600 text-5xl animate-wave" />
        <FaWater className="absolute top-10 left-1/4 text-ocean-200 text-4xl animate-float" /> {/* ripples */}
        <FaWater className="absolute top-1/4 right-1/4 text-ocean-600 text-4xl animate-float" />

        <FaFish className="absolute top-50 left-50 text-ocean-200 text-6xl animate-float" /> {/* fish */}
        <FaFish className="absolute bottom-40 right-20 text-ocean-600 text-6xl opacity-100 animate-float" />
        <MdWaves className="absolute bottom-20 left-1/8 text-ocean-200 text-5xl animate-wave" /> {/* wave */}
        <MdWaves className="absolute bottom-20 right-1/8 text-ocean-600 text-5xl animate-wave" />
        <FaWater className="absolute top-20 left-1/8 text-ocean-200 text-4xl animate-float" /> {/* ripples */}
        <FaWater className="absolute top-1/4 right-1/8 text-ocean-600 text-4xl animate-float" />

      </motion.div>

      <motion.div 
        className="bg-white rounded-3xl p-12 w-full max-w-md shadow-3xl relative z-10 border border-ocean-400/20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-ocean-400 via-ocean-200 to-ocean-400 rounded-t-3xl" />

        <motion.div variants={itemVariants}>
          <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-ocean-600 to-ocean-400 bg-clip-text text-transparent">
            Login to WaveMinder
          </h2>
          <p className="text-ocean-600 mb-8 opacity-80">
            Track marine life and ocean conservation
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
          <motion.div className="mb-6" variants={itemVariants}>
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

          <motion.div className="mb-6" variants={itemVariants}>
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
              {loading ? 'Logging in...' : 'Login'}
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
            Don't have an account?{' '}
            <motion.span
              onClick={() => navigate('/signup')}
              className="text-ocean-400 cursor-pointer font-semibold relative inline-block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign up
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

export default LoginForm;