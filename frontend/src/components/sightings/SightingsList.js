import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sightingsAPI } from '../../services/api';
import SightingCard from './SightingCard';
import './Sightings.css';

const SightingsList = () => {
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSightings();
  }, []);

  const fetchSightings = async () => {
    try {
      const response = await sightingsAPI.getAll({ limit: 100 });
      setSightings(response.data);
    } catch (error) {
      console.error('Error fetching sightings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sighting?')) {
      try {
        await sightingsAPI.delete(id);
        setSightings(sightings.filter(s => s.id !== id));
      } catch (error) {
        alert('Error deleting sighting: ' + error.response?.data?.detail);
      }
    }
  };

  const filteredSightings = filter === 'all' 
    ? sightings 
    : sightings.filter(s => s.species_type.toLowerCase() === filter.toLowerCase());

  const speciesTypes = [...new Set(sightings.map(s => s.species_type))];

  if (loading) {
    return <div className="page-loading">Loading sightings...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>🐋 Marine Sightings</h1>
          <p className="page-subtitle">Community marine life observations</p>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            ← Back
          </button>
          <button onClick={() => navigate('/sightings/new')} className="btn-primary">
            + New Sighting
          </button>
        </div>
      </div>

      <div className="filters">
        <button 
          className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('all')}
        >
          All ({sightings.length})
        </button>
        {speciesTypes.map(type => (
          <button
            key={type}
            className={filter === type ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter(type)}
          >
            {type} ({sightings.filter(s => s.species_type === type).length})
          </button>
        ))}
      </div>

      {filteredSightings.length === 0 ? (
        <div className="empty-state">
          <p>No sightings found. Log one!</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredSightings.map(sighting => (
            <SightingCard 
              key={sighting.id} 
              sighting={sighting}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SightingsList;