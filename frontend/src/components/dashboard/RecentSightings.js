import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const RecentSightings = ({ sightings }) => {
  const navigate = useNavigate();

  if (!sightings || sightings.length === 0) {
    return (
      <section className="recent-sightings">
        <h2>Recent Community Sightings</h2>
        <p className="empty-state">No sightings yet. Make one!</p>
      </section>
    );
  }

  return (
    <section className="recent-sightings">
      <div className="section-header">
        <h2>Recent Community Sightings</h2>
        <button onClick={() => navigate('/sightings')} className="btn-text">
          View All →
        </button>
      </div>
      
      <div className="sightings-list">
        {sightings.map((sighting) => (
          <div key={sighting.id} className="sighting-item">
            <div className="sighting-header">
              <h4>{sighting.species_name}</h4>
              <span className="species-badge">{sighting.species_type}</span>
            </div>
            <p className="sighting-meta">
              📍 {sighting.location_name || 'Unknown location'} • 
              👤 {sighting.user_name} • 
              📅 {new Date(sighting.date_spotted).toLocaleDateString()}
            </p>
            {sighting.group_size > 1 && (
              <p className="sighting-detail">Group of {sighting.group_size}</p>
            )}
            {sighting.behavior && (
              <p className="sighting-detail">Behavior: {sighting.behavior}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentSightings;