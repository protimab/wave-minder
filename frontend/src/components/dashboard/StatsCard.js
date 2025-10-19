
import React from 'react';
import './Dashboard.css';

const StatsCard = ({ title, value, icon, onClick }) => {
  return (
    <div className={`stats-card ${onClick ? 'clickable' : ''}`} onClick={onClick}>
      <div className="stats-icon">{icon}</div>
      <div className="stats-content">
        <h3>{title}</h3>
        <p className="stats-value">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;