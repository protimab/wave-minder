import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Sightings.css';

const SightingCard = ({ sighting, onDelete }) => {
  const { user } = useAuth();
  const isOwner = user && sighting.user_name === user.name;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3>{sighting.species_name}</h3>
          <span className="badge">{sighting.species_type}</span>
        </div>
        {isOwner && (
          <button 
            onClick={() => onDelete(sighting.id)}
            className="btn-delete"
            title="Delete sighting"
          >
            🗑️
          </button>
        )}
      </div>

      <div className="card-body">
        {sighting.location_name && (
          <p className="card-detail">
            <span className="detail-icon">📍</span>
            {sighting.location_name}
          </p>
        )}

        {(sighting.latitude && sighting.longitude) && (
          <p className="card-detail">
            <span className="detail-icon">🗺️</span>
            {sighting.latitude.toFixed(4)}, {sighting.longitude.toFixed(4)}
          </p>
        )}

        <p className="card-detail">
          <span className="detail-icon">📅</span>
          {new Date(sighting.date_spotted).toLocaleDateString()}
          {sighting.time_spotted && ` at ${sighting.time_spotted}`}
        </p>

        {sighting.group_size > 1 && (
          <p className="card-detail">
            <span className="detail-icon">👥</span>
            Group of {sighting.group_size}
          </p>
        )}

        {sighting.behavior && (
          <p className="card-detail">
            <span className="detail-icon">🐋</span>
            {sighting.behavior}
          </p>
        )}

        {sighting.notes && (
          <p className="card-notes">{sighting.notes}</p>
        )}
      </div>

      <div className="card-footer">
        <span>Reported by {sighting.user_name}</span>
      </div>
    </div>
  );
};

export default SightingCard;