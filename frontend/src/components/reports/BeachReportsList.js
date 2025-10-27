import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUmbrellaBeach, FaArrowLeft, FaPlus, FaWater, FaFish } from 'react-icons/fa';
import { MdWaves } from 'react-icons/md';
import { GiShrimp } from 'react-icons/gi';
import { reportsAPI } from '../../services/api';
import BeachReportCard from './BeachReportCard';

const BeachReportsList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await reportsAPI.getAll({ limit: 100 });
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await reportsAPI.delete(id);
        setReports(reports.filter(r => r.id !== id));
      } catch (error) {
        alert('Error deleting report: ' + error.response?.data?.detail);
      }
    }
  };

  const floatVariants = {
    animate: {
      y: [0, -15, 0],
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-orange-400 text-6xl"
        >
          <FaUmbrellaBeach />
        </motion.div>
        <span className="ml-4 text-orange-700 text-xl font-semibold">Loading beach reports...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 relative overflow-hidden">
      {/* beach background decor */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <motion.div variants={floatVariants} animate="animate" className="absolute top-20 left-20">
          <FaUmbrellaBeach className="text-orange-400 text-6xl" />
        </motion.div>
        <motion.div variants={floatVariants} animate="animate" style={{ animationDelay: '1s' }} className="absolute top-40 right-32">
          <MdWaves className="text-orange-300 text-7xl" />
        </motion.div>
        <motion.div variants={floatVariants} animate="animate" style={{ animationDelay: '2s' }} className="absolute bottom-32 left-1/4">
          <FaWater className="text-amber-400 text-5xl" />
        </motion.div>
        <motion.div variants={floatVariants} animate="animate" style={{ animationDelay: '1.5s' }} className="absolute bottom-20 right-1/4">
          <GiShrimp className="text-orange-400 text-6xl" />
        </motion.div>
      </div>

      {/* header */}
      <motion.header
        className="bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500 shadow-lg relative z-10"
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
              <FaUmbrellaBeach className="text-white text-4xl" />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Beach Reports</h1>
                <p className="text-orange-100 text-sm">Community beach condition monitoring</p>
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
                onClick={() => navigate('/reports/new')}
                className="flex items-center gap-2 px-5 py-2 bg-white text-orange-600 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPlus />
                <span>New Report</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border-2 border-orange-200">
            <div className="flex items-center gap-3">
              <div className="text-3xl">📊</div>
              <div>
                <p className="text-orange-800 font-semibold">Total Reports</p>
                <p className="text-2xl font-bold text-orange-600">{reports.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {reports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-orange-200"
          >
            <div className="text-7xl mb-4">🏖️</div>
            <h3 className="text-2xl font-bold text-orange-700 mb-2">No Beach Reports Yet</h3>
            <p className="text-orange-600 mb-6">Be the first to document beach conditions!</p>
            <motion.button
              onClick={() => navigate('/reports/new')}
              className="px-6 py-3 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-lg font-semibold shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create First Report
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {reports.map((report) => (
              <motion.div key={report.id} variants={cardVariants}>
                <BeachReportCard report={report} onDelete={handleDelete} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default BeachReportsList;