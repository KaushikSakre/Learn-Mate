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
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Create Account</h2>
        {error && <div className="error">{error}</div>}
        <div className="form-control">
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Full Name (Optional)"
          />
        </div>
        <div className="form-control">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            required
          />
        </div>
        <div className="form-control">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
        </div>
        <div className="form-control">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password (min 6 characters)"
            required
          />
        </div>
        <div className="form-control">
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            required
          />
        </div>
        <button type="submit" disabled={loading} className="btn">
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
        <p className="switch-auth">
          Already have an account? <button type="button" onClick={onSwitchToLogin}>Sign In</button>
        </p>
      </form>
    </div>
  );
};

export default RegisterForm;