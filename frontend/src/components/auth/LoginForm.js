import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const formatError = (errorDetail) => {
    // array of validation errors from FastAPI
    if (Array.isArray(errorDetail)) {
      return errorDetail.map(err => err.msg || JSON.stringify(err)).join(', ');
    }
    // string errors
    if (typeof errorDetail === 'string') {
      return errorDetail;
    }
    // object errors
    if (typeof errorDetail === 'object') {
      return errorDetail.msg || JSON.stringify(errorDetail);
    }
    return 'An error occurred';
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    setLoading(false);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(formatError(result.error));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to WaveMinder</h2>
        <p className="auth-subtitle">Track marine life and ocean conservation</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <span onClick={() => navigate('/signup')} className="link">
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;