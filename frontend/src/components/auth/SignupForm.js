import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaUser, FaMapMarkerAlt, FaFish, FaWater, FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdWaves } from 'react-icons/md';
import { GiShrimp, GiSeaTurtle, GiJellyfish } from 'react-icons/gi';

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
   const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

   /* animation variants */
  const floatVariants = {
    animate: {
      y: [0, -30, 0],
      x: [0, 15, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const swimVariants = {
    animate: {
      x: [0, 40, 0],
      y: [0, -20, 0],
      rotate: [0, 5, 0, -5, 0],
      transition: {
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const waveVariants = {
    animate: {
      x: [0, -30, 0],
      y: [0, 10, 0],
      scale: [1, 1.1, 1],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const jellyfishVariants = {
    animate: {
      y: [0, -40, 0],
      scale: [1, 1.05, 1],
      transition: {
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-ocean-gradient relative overflow-hidden p-5">
      {/* Animated bg elements */}
      {/* animate bg elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {/* top left */}
        <motion.div variants={floatVariants} animate="animate" className="absolute top-[10%] left-[5%] lg:left-[8%]">
          <FaFish className="text-ocean-200 text-4xl md:text-5xl" />
        </motion.div>
        <motion.div variants={swimVariants} animate="animate" style={{ animationDelay: '1s' }} className="absolute top-[15%] left-[12%] lg:left-[15%]">
          <GiShrimp className="text-ocean-300 text-3xl md:text-4xl" />
        </motion.div>
        <motion.div variants={waveVariants} animate="animate" className="absolute top-[8%] left-[18%] lg:left-[20%]">
          <FaWater className="text-ocean-200 text-2xl md:text-3xl" />
        </motion.div>

        {/* top right */}
        <motion.div variants={swimVariants} animate="animate" style={{ animationDelay: '2s' }} className="absolute top-[12%] right-[5%] lg:right-[10%]">
          <FaFish className="text-ocean-300 text-5xl md:text-6xl transform scale-x-[-1]" />
        </motion.div>
        <motion.div variants={jellyfishVariants} animate="animate" className="absolute top-[18%] right-[15%] lg:right-[18%]">
          <GiJellyfish className="text-ocean-200 text-4xl md:text-5xl" />
        </motion.div>
        <motion.div variants={floatVariants} animate="animate" style={{ animationDelay: '3s' }} className="absolute top-[5%] right-[22%] lg:right-[25%]">
          <FaWater className="text-ocean-300 text-3xl md:text-4xl" />
        </motion.div>

        {/* middle left */}
        <motion.div variants={jellyfishVariants} animate="animate" style={{ animationDelay: '1.5s' }} className="hidden lg:block absolute top-[40%] left-[5%]">
          <GiJellyfish className="text-ocean-200 text-4xl" />
        </motion.div>
        <motion.div variants={swimVariants} animate="animate" className="hidden lg:block absolute top-[45%] left-[12%]">
          <FaFish className="text-ocean-300 text-5xl" />
        </motion.div>

        {/* middle right */}
        <motion.div variants={floatVariants} animate="animate" style={{ animationDelay: '2.5s' }} className="hidden lg:block absolute top-[38%] right-[8%]">
          <GiSeaTurtle className="text-ocean-300 text-7xl" />
        </motion.div>
        <motion.div variants={swimVariants} animate="animate" style={{ animationDelay: '4s' }} className="hidden lg:block absolute top-[48%] right-[15%]">
          <FaFish className="text-ocean-200 text-4xl transform scale-x-[-1]" />
        </motion.div>

        {/* bottom left */}
        <motion.div variants={waveVariants} animate="animate" className="absolute bottom-[15%] left-[5%] lg:left-[10%]">
          <MdWaves className="text-ocean-200 text-5xl md:text-6xl" />
        </motion.div>
        <motion.div variants={swimVariants} animate="animate" style={{ animationDelay: '3s' }} className="absolute bottom-[20%] left-[15%] lg:left-[18%]">
          <FaFish className="text-ocean-300 text-4xl md:text-5xl" />
        </motion.div>
        <motion.div variants={floatVariants} animate="animate" style={{ animationDelay: '1s' }} className="absolute bottom-[12%] left-[2%] lg:left-[5%]">
          <GiShrimp className="text-ocean-200 text-2xl md:text-3xl" />
        </motion.div>

        {/* bottom right */}
        <motion.div variants={waveVariants} animate="animate" style={{ animationDelay: '2s' }} className="absolute bottom-[18%] right-[8%] lg:right-[12%]">
          <MdWaves className="text-ocean-300 text-6xl md:text-7xl" />
        </motion.div>
        <motion.div variants={floatVariants} animate="animate" style={{ animationDelay: '4s' }} className="absolute bottom-[25%] right-[18%] lg:right-[20%]">
          <FaFish className="text-ocean-200 text-4xl md:text-5xl transform scale-x-[-1]" />
        </motion.div>
        <motion.div variants={jellyfishVariants} animate="animate" style={{ animationDelay: '1.5s' }} className="absolute bottom-[10%] right-[5%] lg:right-[8%]">
          <GiJellyfish className="text-ocean-300 text-3xl md:text-4xl" />
        </motion.div>

        {/* bottom center */}
        <motion.div variants={waveVariants} animate="animate" style={{ animationDelay: '3s' }} className="hidden md:block absolute bottom-[8%] left-[45%]">
          <MdWaves className="text-ocean-200 text-5xl" />
        </motion.div>
        <motion.div variants={swimVariants} animate="animate" style={{ animationDelay: '2s' }} className="hidden md:block absolute bottom-[22%] left-[40%]">
          <FaWater className="text-ocean-300 text-4xl" />
        </motion.div>

        {/* additional elements */}
        <motion.div variants={floatVariants} animate="animate" style={{ animationDelay: '5s' }} className="hidden xl:block absolute top-[30%] left-[30%]">
          <FaWater className="text-ocean-200 text-3xl" />
        </motion.div>
        <motion.div variants={swimVariants} animate="animate" style={{ animationDelay: '6s' }} className="hidden xl:block absolute top-[60%] right-[35%]">
          <GiShrimp className="text-ocean-300 text-3xl" />
        </motion.div>
        <motion.div variants={jellyfishVariants} animate="animate" style={{ animationDelay: '4s' }} className="hidden xl:block absolute top-[25%] right-[40%]">
          <GiJellyfish className="text-ocean-200 text-4xl" />
        </motion.div>
      </div>

        {/* form box */}
      <motion.div 
        className="bg-white rounded-2xl p-8 md:p-10 w-full max-w-md shadow-2xl relative z-10 my-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* inside form box */}
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-ocean-600 to-ocean-400 bg-clip-text text-transparent">
            Join WaveMinder
          </h2>
          <p className="text-ocean-600 mb-8 opacity-60 text-sm md:text-base">
            Start tracking marine life today
          </p>
        </motion.div>
        
        {error && (
          <motion.div 
            className="bg-gradient-to-r from-red-50 to-red-100 text-red-700 px-4 py-3 rounded-xl mb-6 border-2 border-red-200 font-medium text-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {error}
          </motion.div>
        )}
        
        {/* form fields */}
        <form onSubmit={handleSubmit}>
          <motion.div className="mb-5" variants={itemVariants}>
            <label htmlFor="name" className="block mb-2 text-ocean-600 font-semibold text-sm">
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
                className="w-full pl-12 pr-4 py-3 border-2 border-ocean-100 rounded-xl text-ocean-700 bg-ocean-50 focus:outline-none focus:border-ocean-400 focus:bg-white focus:shadow-lg focus:shadow-ocean-400/10 transition-all duration-300"
                required
              />
            </div>
          </motion.div>

          <motion.div className="mb-5" variants={itemVariants}>
            <label htmlFor="email" className="block mb-2 text-ocean-600 font-semibold text-sm">
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
                className="w-full pl-12 pr-4 py-3 border-2 border-ocean-100 rounded-xl text-ocean-700 bg-ocean-50 focus:outline-none focus:border-ocean-400 focus:bg-white focus:shadow-lg focus:shadow-ocean-400/10 transition-all duration-300"
                required
              />
            </div>
          </motion.div>

          <motion.div className="mb-5" variants={itemVariants}>
            <label htmlFor="location" className="block mb-2 text-ocean-600 font-semibold text-sm">
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
                className="w-full pl-12 pr-4 py-3 border-2 border-ocean-100 rounded-xl text-ocean-700 bg-ocean-50 focus:outline-none focus:border-ocean-400 focus:bg-white focus:shadow-lg focus:shadow-ocean-400/10 transition-all duration-300 placeholder-ocean-300"
              />
            </div>
          </motion.div>

          <motion.div className="mb-5" variants={itemVariants}>
            <label htmlFor="password" className="block mb-2 text-ocean-600 font-semibold text-sm">
              Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ocean-400" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-12 py-3 border-2 border-ocean-100 rounded-xl text-ocean-700 bg-ocean-50 focus:outline-none focus:border-ocean-400 focus:bg-white focus:shadow-lg focus:shadow-ocean-400/10 transition-all duration-300"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-ocean-400 hover:text-ocean-600 transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
          </motion.div>

          <motion.div className="mb-6" variants={itemVariants}>
            <label htmlFor="confirmPassword" className="block mb-2 text-ocean-600 font-semibold text-sm">
              Confirm Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ocean-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-12 pr-12 py-3 border-2 border-ocean-100 rounded-xl text-ocean-700 bg-ocean-50 focus:outline-none focus:border-ocean-400 focus:bg-white focus:shadow-lg focus:shadow-ocean-400/10 transition-all duration-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-ocean-400 hover:text-ocean-600 transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
          </motion.div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-ocean-400 to-ocean-600 text-white font-semibold text-sm tracking-wider uppercase mt-2 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group"
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
          className="mt-7 text-center text-ocean-600 text-sm md:text-base"
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