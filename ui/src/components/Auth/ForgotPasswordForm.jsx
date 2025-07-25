import React, { useState } from 'react';
import './Auth.css';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    // Here you would typically call an API to handle the password reset request
    // For this example, we'll just simulate a success message.
    setTimeout(() => {
      setLoading(false);
      setMessage(`If an account with the email ${email} exists, a password reset link has been sent.`);
    }, 1500);
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Forgot Password</h2>
        {message && <div className="success">{message}</div>}
        <div className="form-control">
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Enter your email" 
            required 
          />
        </div>
        <button type="submit" disabled={loading} className="btn">
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
        <p className="switch-auth">
          <a href="/">Back to Login</a>
        </p>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;