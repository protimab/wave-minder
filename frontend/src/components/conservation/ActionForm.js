import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { actionsAPI } from '../../services/api';
import { ACTION_TYPES } from '../../utils/constants';
import '../sightings/Sightings.css';

const ActionForm = () => {
  const [formData, setFormData] = useState({
    action_type: '',
    title: '',
    description: '',
    location_name: '',
    latitude: '',
    longitude: '',
    participants: 1,
    waste_collected: 0,
    area_covered: 0,
    date_completed: new Date().toISOString().split('T')[0],
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
        participants: parseInt(formData.participants) || 1,
        waste_collected: parseFloat(formData.waste_collected) || 0,
        area_covered: parseFloat(formData.area_covered) || 0,
      };

      await actionsAPI.create(submitData);
      navigate('/actions');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create action');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Log Conservation Action</h1>
        <button onClick={() => navigate('/actions')} className="btn-secondary">
          Cancel
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label htmlFor="action_type">Action Type *</label>
          <select
            id="action_type"
            name="action_type"
            value={formData.action_type}
            onChange={handleChange}
            required
          >
            <option value="">Select type...</option>
            {ACTION_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Pacific Beach Cleanup"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Brief description of the conservation action..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="location_name">Location Name</label>
          <input
            type="text"
            id="location_name"
            name="location_name"
            value={formData.location_name}
            onChange={handleChange}
            placeholder="e.g., Pacific Beach"
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
            <label htmlFor="participants">Participants *</label>
            <input
              type="number"
              id="participants"
              name="participants"
              value={formData.participants}
              onChange={handleChange}
              min="1"
              max="10000"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="waste_collected">Waste Collected (kg)</label>
            <input
              type="number"
              id="waste_collected"
              name="waste_collected"
              value={formData.waste_collected}
              onChange={handleChange}
              min="0"
              max="10000"
              step="0.1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="area_covered">Area Covered (m²)</label>
            <input
              type="number"
              id="area_covered"
              name="area_covered"
              value={formData.area_covered}
              onChange={handleChange}
              min="0"
              max="1000000"
              step="0.1"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="date_completed">Date Completed *</label>
          <input
            type="date"
            id="date_completed"
            name="date_completed"
            value={formData.date_completed}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Log Action'}
        </button>
      </form>
    </div>
  );
};

export default ActionForm;