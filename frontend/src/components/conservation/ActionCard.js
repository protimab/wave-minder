import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../sightings/Sightings.css';

const ActionCard = ({ action, onDelete }) => {
  const { user } = useAuth();
  const isOwner = user && action.user_name === user.name;

  const getActionIcon = (type) => {
    const icons = {
      beach_cleanup: '🧹',
      citizen_science: '🔬',
      education: '📚',
      restoration: '🌱',
      monitoring: '👁️',
      policy_advocacy: '📢'
    };
    return icons[type] || '♻️';
  };

  const formatActionType = (type) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3>{action.title}</h3>
          <span className="badge">
            {getActionIcon(action.action_type)} {formatActionType(action.action_type)}
          </span>
        </div>
        {isOwner && (
          <button 
            onClick={() => onDelete(action.id)}
            className="btn-delete"
            title="Delete action"
          >
            🗑️
          </button>
        )}
      </div>

      <div className="card-body">
        {action.description && (
          <p className="card-description">{action.description}</p>
        )}

        {action.location_name && (
          <p className="card-detail">
            <span className="detail-icon">📍</span>
            {action.location_name}
          </p>
        )}

        <div className="action-stats">
          <div className="stat-item">
            <span className="stat-icon">👥</span>
            <span className="stat-label">Participants:</span>
            <span className="stat-value">{action.participants}</span>
          </div>

          {action.waste_collected > 0 && (
            <div className="stat-item">
              <span className="stat-icon">🗑️</span>
              <span className="stat-label">Waste:</span>
              <span className="stat-value">{action.waste_collected.toFixed(1)} kg</span>
            </div>
          )}

          {action.area_covered > 0 && (
            <div className="stat-item">
              <span className="stat-icon">📏</span>
              <span className="stat-label">Area:</span>
              <span className="stat-value">{action.area_covered.toFixed(0)} m²</span>
            </div>
          )}
        </div>

        <p className="card-detail">
          <span className="detail-icon">📅</span>
          {new Date(action.date_completed).toLocaleDateString()}
        </p>
      </div>

      <div className="card-footer">
        <span>Led by {action.user_name}</span>
      </div>
    </div>
  );
};

export default ActionCard;