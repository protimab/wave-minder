import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../sightings/Sightings.css';

const BeachReportCard = ({ report, onDelete }) => {
  const { user } = useAuth();
  const isOwner = user && report.user_name === user.name;

  const getQualityColor = (score) => {
    if (score >= 4) return '#4caf50';
    if (score >= 3) return '#ff9800';
    return '#f44336';
  };

  const getQualityLabel = (value) => {
    const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    return labels[value - 1] || 'N/A';
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3>{report.beach_name}</h3>
          {report.quality_score && (
            <span 
              className="badge" 
              style={{ 
                background: getQualityColor(report.quality_score),
                color: 'white'
              }}
            >
              Score: {report.quality_score}/5
            </span>
          )}
        </div>
        {isOwner && (
          <button 
            onClick={() => onDelete(report.id)}
            className="btn-delete"
            title="Delete report"
          >
            🗑️
          </button>
        )}
      </div>

      <div className="card-body">
        <div className="report-metrics">
          <div className="metric">
            <span className="metric-label">Water Quality:</span>
            <span className="metric-value">{getQualityLabel(report.water_quality)}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Pollution Level:</span>
            <span className="metric-value">{getQualityLabel(report.pollution_level)}</span>
          </div>
        </div>

        {report.water_temp && (
          <p className="card-detail">
            <span className="detail-icon">🌡️</span>
            Water Temperature: {report.water_temp}°C
          </p>
        )}

        {report.wildlife_activity && (
          <p className="card-detail">
            <span className="detail-icon">🐟</span>
            Wildlife Activity: {report.wildlife_activity.charAt(0).toUpperCase() + report.wildlife_activity.slice(1)}
          </p>
        )}

        {report.weather_conditions && (
          <p className="card-detail">
            <span className="detail-icon">☀️</span>
            {report.weather_conditions}
          </p>
        )}

        <p className="card-detail">
          <span className="detail-icon">📅</span>
          {new Date(report.report_date).toLocaleDateString()}
        </p>

        {report.notes && (
          <p className="card-notes">{report.notes}</p>
        )}
      </div>

      <div className="card-footer">
        <span>Reported by {report.user_name}</span>
      </div>
    </div>
  );
};

export default BeachReportCard;