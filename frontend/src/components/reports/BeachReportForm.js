import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsAPI } from '../../services/api';
import { QUALITY_SCALE, WILDLIFE_ACTIVITY_LEVELS } from '../../utils/constants';
import '../sightings/Sightings.css';

const BeachReportForm = () => {
  const [formData, setFormData] = useState({
    beach_name: '',
    latitude: '',
    longitude: '',
    water_quality: 3,
    pollution_level: 3,
    water_temp: '',
    wildlife_activity: '',
    weather_conditions: '',
    notes: '',
    report_date: new Date().toISOString().split('T')[0],
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
        water_quality: parseInt(formData.water_quality),
        pollution_level: parseInt(formData.pollution_level),
        water_temp: formData.water_temp ? parseFloat(formData.water_temp) : null,
      };

      await reportsAPI.create(submitData);
      navigate('/reports');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Create Beach Report</h1>
        <button onClick={() => navigate('/reports')} className="btn-secondary">
          Cancel
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label htmlFor="beach_name">Beach Name *</label>
          <input
            type="text"
            id="beach_name"
            name="beach_name"
            value={formData.beach_name}
            onChange={handleChange}
            placeholder="e.g., La Jolla Shores"
            required
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
            <label htmlFor="water_quality">Water Quality (1-5) *</label>
            <select
              id="water_quality"
              name="water_quality"
              value={formData.water_quality}
              onChange={handleChange}
              required
            >
              {QUALITY_SCALE.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="water_temp">Water Temperature (°C)</label>
            <input
              type="number"
              id="water_temp"
              name="water_temp"
              value={formData.water_temp}
              onChange={handleChange}
              step="0.1"
              placeholder="20.5"
            />
          </div>

          <div className="form-group">
            <label htmlFor="wildlife_activity">Wildlife Activity</label>
            <select
              id="wildlife_activity"
              name="wildlife_activity"
              value={formData.wildlife_activity}
              onChange={handleChange}
            >
              <option value="">Select level...</option>
              {WILDLIFE_ACTIVITY_LEVELS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="weather_conditions">Weather Conditions</label>
          <input
            type="text"
            id="weather_conditions"
            name="weather_conditions"
            value={formData.weather_conditions}
            onChange={handleChange}
            placeholder="e.g., Sunny, calm winds"
          />
        </div>

        <div className="form-group">
          <label htmlFor="report_date">Report Date *</label>
          <input
            type="date"
            id="report_date"
            name="report_date"
            value={formData.report_date}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            required
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
          {loading ? 'Saving...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default BeachReportForm;