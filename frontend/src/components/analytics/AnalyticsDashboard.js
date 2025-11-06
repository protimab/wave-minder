import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import { statsAPI, sightingsAPI, reportsAPI, actionsAPI } from '../../services/api';

const AnalyticsDashboard = () => {
  const [data, setData] = useState({
    stats: null,
    sightings: [],
    reports: [],
    actions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const [stats, sightings, reports, actions] = await Promise.all([
        statsAPI.getCommunityStats(),
        sightingsAPI.getAll({ limit: 100 }),
        reportsAPI.getAll({ limit: 100 }),
        actionsAPI.getAll({ limit: 100 })
      ]);

      setData({
        stats: stats.data,
        sightings: sightings.data,
        reports: reports.data,
        actions: actions.data
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  // process data for charts
  const speciesData = data.sightings.reduce((acc, s) => {
    acc[s.species_type] = (acc[s.species_type] || 0) + 1;
    return acc;
  }, {});

  const speciesChartData = Object.entries(speciesData).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8">
      {/* header statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Sightings"
          value={data.sightings.length}
          icon="🐋"
          color="blue"
        />
        <StatCard
          title="Beach Reports"
          value={data.reports.length}
          icon="🏖️"
          color="orange"
        />
        <StatCard
          title="Conservation"
          value={data.stats?.total_actions || 0}
          icon="♻️"
          color="green"
        />
        <StatCard
          title="Participants"
          value={data.stats?.total_participants || 0}
          icon="👥"
          color="purple"
        />
      </div>

      {/* species distribution */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-2xl font-bold mb-6">Marine Species Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={speciesChartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {speciesChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* environmental impact */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-green-900 mb-6 text-center">
          🌍 Community Environmental Impact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ImpactStat
            value={`${data.stats?.total_waste_kg?.toFixed(0) || 0} kg`}
            label="Waste Collected"
            sublabel={`≈ ${((data.stats?.total_waste_kg || 0) * 2.2).toFixed(0)} plastic bottles`}
          />
          <ImpactStat
            value={`${data.stats?.total_area_sqm?.toFixed(0) || 0} m²`}
            label="Area Cleaned"
            sublabel={`≈ ${((data.stats?.total_area_sqm || 0) / 4047).toFixed(1)} acres`}
          />
          <ImpactStat
            value={data.sightings.length + data.reports.length + (data.stats?.total_actions || 0)}
            label="Total Activities"
            sublabel="Community engagement events"
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    orange: 'from-orange-500 to-orange-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <motion.div
      className={`bg-gradient-to-br ${colors[color]} rounded-2xl p-6 text-white shadow-xl`}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm mb-2 opacity-80">{title}</p>
          <p className="text-4xl font-bold">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </motion.div>
  );
};

const ImpactStat = ({ value, label, sublabel }) => (
  <div className="text-center">
    <div className="text-5xl font-bold text-green-600 mb-2">{value}</div>
    <p className="text-green-700 font-semibold">{label}</p>
    <p className="text-sm text-green-600 mt-1">{sublabel}</p>
  </div>
);

export default AnalyticsDashboard;