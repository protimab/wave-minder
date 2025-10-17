import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import StatsCard from './StatsCard';
import RecentSightings from './RecentSightings';
import { statsAPI, sightingsAPI, reportsAPI, actionsAPI } from '../../services/api';
import './Dashboard.css';

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

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🌊 WaveMinder</h1>
          <div className="header-actions">
            <span className="user-greeting">Welcome, {user?.name}!</span>
            <button onClick={logout} className="btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="quick-actions">
          <button onClick={() => navigate('/sightings/new')} className="action-btn">
            + Log Sighting
          </button>
          <button onClick={() => navigate('/reports/new')} className="action-btn">
            + Beach Report
          </button>
          <button onClick={() => navigate('/actions/new')} className="action-btn">
            + Conservation Action
          </button>
        </div>

        <section className="stats-section">
          <h2>Your Contributions</h2>
          <div className="stats-grid">
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
        </section>

        {stats && (
          <section className="stats-section">
            <h2>Community Impact</h2>
            <div className="stats-grid">
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
          </section>
        )}

        <RecentSightings sightings={recentSightings} />
      </div>
    </div>
  );
};

export default Dashboard;