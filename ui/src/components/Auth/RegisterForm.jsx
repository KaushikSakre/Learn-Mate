import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const result = await register(
      formData.username,
      formData.email,
      formData.password,
      formData.fullName
    );
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-card fade-in">
      <div className="auth-header">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join LearnMate to start learning</p>
      </div>
      
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="error shake">{error}</div>}
        
        <div className="form-group">
          <div className="input-container">
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder=" "
              className={`animated-input ${formData.fullName ? 'has-value' : ''}`}
              id="fullName"
            />
            <label htmlFor="fullName" className="floating-label">Full Name (Optional)</label>
            <div className="input-border"></div>
          </div>
        </div>
        
        <div className="form-group">
          <div className="input-container">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder=" "
              required
              className={`animated-input ${formData.username ? 'has-value' : ''}`}
              id="username"
            />
            <label htmlFor="username" className="floating-label">Username</label>
            <div className="input-border"></div>
          </div>
        </div>
        
        <div className="form-group">
          <div className="input-container">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder=" "
              required
              className={`animated-input ${formData.email ? 'has-value' : ''}`}
              id="email-register"
            />
            <label htmlFor="email-register" className="floating-label">Email Address</label>
            <div className="input-border"></div>
          </div>
        </div>
        
        <div className="form-group">
          <div className="input-container">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder=" "
              required
              className={`animated-input ${formData.password ? 'has-value' : ''}`}
              id="password-register"
            />
            <label htmlFor="password-register" className="floating-label">Password (min 6 characters)</label>
            <div className="input-border"></div>
          </div>
        </div>
        
        <div className="form-group">
          <div className="input-container">
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder=" "
              required
              className={`animated-input ${formData.confirmPassword ? 'has-value' : ''}`}
              id="confirmPassword"
            />
            <label htmlFor="confirmPassword" className="floating-label">Confirm Password</label>
            <div className="input-border"></div>
          </div>
        </div>
        
        <button type="submit" disabled={loading} className={`btn btn-primary ${loading ? 'loading' : ''}`}>
          <span className="btn-text">{loading ? 'Creating Account...' : 'Create Account'}</span>
          {loading && <div className="loading-spinner"></div>}
        </button>
        
        <div className="auth-divider">
          <span>or</span>
        </div>
        
        <p className="switch-auth">
          Already have an account? 
          <button type="button" onClick={onSwitchToLogin} className="switch-btn">
            Sign In
          </button>
        </p>
      </form>
    </div>
  );
};

export default RegisterForm;