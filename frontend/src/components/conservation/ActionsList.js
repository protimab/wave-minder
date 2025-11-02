import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRecycle, FaArrowLeft, FaPlus, FaLeaf, FaHandHoldingHeart, FaSeedling } from 'react-icons/fa';
import { GiWindSlap, GiEarthAmerica } from 'react-icons/gi';
import { actionsAPI } from '../../services/api';
import ActionCard from './ActionCard';

const ActionsList = () => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    try {
      const response = await actionsAPI.getAll({ limit: 100 });
      setActions(response.data);
    } catch (error) {
      console.error('Error fetching actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this action?')) {
      try {
        await actionsAPI.delete(id);
        setActions(actions.filter(a => a.id !== id));
      } catch (error) {
        alert('Error deleting action: ' + error.response?.data?.detail);
      }
    }
  };

  const filteredActions = filter === 'all' 
    ? actions 
    : actions.filter(a => a.action_type === filter);

  const actionTypes = [...new Set(actions.map(a => a.action_type))];

  const floatVariants = {
    animate: {
      y: [0, -15, 0],
      rotate: [0, 5, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" } }}
          className="text-green-500 text-6xl"
        >
          <FaRecycle />
        </motion.div>
        <span className="ml-4 text-green-700 text-xl font-semibold">Loading conservation actions...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 relative overflow-hidden">
      {/* background decor */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <motion.div variants={floatVariants} animate="animate" className="absolute top-20 left-20">
          <FaRecycle className="text-green-500 text-7xl" />
        </motion.div>
        <motion.div variants={floatVariants} animate="animate" style={{ animationDelay: '1s' }} className="absolute top-40 right-32">
          <FaLeaf className="text-emerald-400 text-6xl" />
        </motion.div>
        <motion.div variants={floatVariants} animate="animate" style={{ animationDelay: '2s' }} className="absolute bottom-32 left-1/4">
          <GiEarthAmerica className="text-teal-500 text-8xl" />
        </motion.div>
        <motion.div variants={floatVariants} animate="animate" style={{ animationDelay: '1.5s' }} className="absolute bottom-20 right-1/4">
          <FaSeedling className="text-green-400 text-6xl" />
        </motion.div>
        <motion.div variants={floatVariants} animate="animate" style={{ animationDelay: '2.5s' }} className="absolute top-1/2 left-1/3">
          <FaHandHoldingHeart className="text-emerald-500 text-7xl" />
        </motion.div>
      </div>

      {/* header */}
      <motion.header
        className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 shadow-lg relative z-10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <FaRecycle className="text-white text-4xl" />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Conservation Actions</h1>
                <p className="text-emerald-100 text-sm">Community-driven environmental initiatives</p>
              </div>
            </motion.div>
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm border border-white/30 font-semibold"
                whileHover={{ scale: 1.05, x: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaArrowLeft />
                <span className="hidden sm:inline">Back</span>
              </motion.button>
              <motion.button
                onClick={() => navigate('/actions/new')}
                className="flex items-center gap-2 px-5 py-2 bg-white text-green-600 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPlus />
                <span>New Action</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* stats card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border-2 border-green-200">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🌍</div>
              <div>
                <p className="text-green-800 font-semibold">Total Actions</p>
                <p className="text-2xl font-bold text-green-600">{actions.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6 flex flex-wrap gap-3"
        >
          <motion.button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${
              filter === 'all'
                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg'
                : 'bg-white/60 text-green-700 hover:bg-white/80 border-2 border-green-200'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            All ({actions.length})
          </motion.button>
          {actionTypes.map(type => (
            <motion.button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                filter === type
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg'
                  : 'bg-white/60 text-green-700 hover:bg-white/80 border-2 border-green-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} ({actions.filter(a => a.action_type === type).length})
            </motion.button>
          ))}
        </motion.div>

        {filteredActions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-green-200"
          >
            <div className="text-7xl mb-4">♻️</div>
            <h3 className="text-2xl font-bold text-green-700 mb-2">No Conservation Actions Yet</h3>
            <p className="text-green-600 mb-6">Start making a difference today!</p>
            <motion.button
              onClick={() => navigate('/actions/new')}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg font-semibold shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create First Action
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredActions.map((action) => (
              <motion.div key={action.id} variants={cardVariants}>
                <ActionCard action={action} onDelete={handleDelete} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default ActionsList;