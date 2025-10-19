import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsAPI } from '../../services/api';
import BeachReportCard from './BeachReportCard';
import '../sightings/Sightings.css';

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

  if (loading) {
    return <div className="page-loading">Loading beach reports...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>🏖️ Beach Reports</h1>
          <p className="page-subtitle">Community beach condition reports</p>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            ← Back
          </button>
          <button onClick={() => navigate('/reports/new')} className="btn-primary">
            + New Report
          </button>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="empty-state">
          <p>No beach reports yet. Make the first one!</p>
        </div>
      ) : (
        <div className="cards-grid">
          {reports.map(report => (
            <BeachReportCard 
              key={report.id} 
              report={report}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BeachReportsList;