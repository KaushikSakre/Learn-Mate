import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const LoginForm = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Login</h2>
        {error && <div className="error">{error}</div>}
        <div className="form-control">
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Email" 
            required 
          />
        </div>
        <div className="form-control">
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Password" 
            required 
          />
        </div>
        <a href="/forgot-password" className="forgot-password">Forgot Password?</a>
        <button type="submit" disabled={loading} className="btn">
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="switch-auth">
          Don't have an account? <button type="button" onClick={onSwitchToRegister}>Register</button>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;