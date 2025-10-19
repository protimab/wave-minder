import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sightingsAPI } from '../../services/api';
import { SPECIES_TYPES } from '../../utils/constants';
import './Sightings.css';

const SightingForm = () => {
  const [formData, setFormData] = useState({
    species_name: '',
    species_type: '',
    location_name: '',
    latitude: '',
    longitude: '',
    date_spotted: new Date().toISOString().split('T')[0],
    time_spotted: '',
    group_size: 1,
    behavior: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        group_size: parseInt(formData.group_size) || 1,
      };

      await sightingsAPI.create(submitData);
      navigate('/sightings');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create sighting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Log Marine Sighting</h1>
        <button onClick={() => navigate('/sightings')} className="btn-secondary">
          Cancel
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="species_name">Species Name *</label>
            <input
              type="text"
              id="species_name"
              name="species_name"
              value={formData.species_name}
              onChange={handleChange}
              placeholder="e.g., Humpback Whale"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="species_type">Species Type *</label>
            <select
              id="species_type"
              name="species_type"
              value={formData.species_type}
              onChange={handleChange}
              required
            >
              <option value="">Select type...</option>
              {SPECIES_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location_name">Location Name</label>
          <input
            type="text"
            id="location_name"
            name="location_name"
            value={formData.location_name}
            onChange={handleChange}
            placeholder="e.g., La Jolla Cove"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="latitude">Latitude</label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              step="0.000001"
              placeholder="32.8509"
            />
          </div>

          <div className="form-group">
            <label htmlFor="longitude">Longitude</label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              step="0.000001"
              placeholder="-117.2713"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date_spotted">Date Spotted *</label>
            <input
              type="date"
              id="date_spotted"
              name="date_spotted"
              value={formData.date_spotted}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="time_spotted">Time Spotted</label>
            <input
              type="time"
              id="time_spotted"
              name="time_spotted"
              value={formData.time_spotted}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="group_size">Group Size</label>
            <input
              type="number"
              id="group_size"
              name="group_size"
              value={formData.group_size}
              onChange={handleChange}
              min="1"
              max="1000"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="behavior">Behavior</label>
          <input
            type="text"
            id="behavior"
            name="behavior"
            value={formData.behavior}
            onChange={handleChange}
            placeholder="e.g., Breaching, feeding, traveling"
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Additional Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            placeholder="Any additional observations..."
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Log Sighting'}
        </button>
      </form>
    </div>
  );
};

export default SightingForm;