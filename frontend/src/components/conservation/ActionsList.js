import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { actionsAPI } from '../../services/api';
import ActionCard from './ActionCard';
import '../sightings/Sightings.css';

const ActionsList = () => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    try {
      const response = await actionsAPI.getAll({ limit: 100 });
      setActions(response.data);
    } catch (error) {
      console.error('Error fetching actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this action?')) {
      try {
        await actionsAPI.delete(id);
        setActions(actions.filter(a => a.id !== id));
      } catch (error) {
        alert('Error deleting action: ' + error.response?.data?.detail);
      }
    }
  };

  const filteredActions = filter === 'all' 
    ? actions 
    : actions.filter(a => a.action_type === filter);

  const actionTypes = [...new Set(actions.map(a => a.action_type))];

  if (loading) {
    return <div className="page-loading">Loading conservation actions...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>♻️ Conservation Actions</h1>
          <p className="page-subtitle">Community conservation efforts</p>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            ← Back
          </button>
          <button onClick={() => navigate('/actions/new')} className="btn-primary">
            + New Action
          </button>
        </div>
      </div>

      <div className="filters">
        <button 
          className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('all')}
        >
          All ({actions.length})
        </button>
        {actionTypes.map(type => (
          <button
            key={type}
            className={filter === type ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter(type)}
          >
            {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} ({actions.filter(a => a.action_type === type).length})
          </button>
        ))}
      </div>

      {filteredActions.length === 0 ? (
        <div className="empty-state">
          <p>No conservation actions yet. Make the first one!</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredActions.map(action => (
            <ActionCard 
              key={action.id} 
              action={action}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionsList;