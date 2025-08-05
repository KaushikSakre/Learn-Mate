import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const LoginForm = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    console.log('LoginForm: Starting login process...');
    console.log('LoginForm: Email:', email);
    
    const result = await login(email, password);
    
    console.log('LoginForm: Login result:', result);
    
    if (!result.success) {
      console.log('LoginForm: Login failed:', result.error);
      setError(result.error || 'Failed to login. Please check your credentials.');
    } else {
      console.log('LoginForm: Login successful!');
    }
    
    setLoading(false);
  };

  const handleForgotPasswordStep1 = async (e) => {
    e.preventDefault();
    setForgotPasswordMessage('');
    
    if (!forgotPasswordEmail) {
      setForgotPasswordMessage('Please enter your email address.');
      return;
    }
    
    // Simulate checking if email exists and get security question
    await new Promise(resolve => setTimeout(resolve, 500));
    setSecurityQuestion('What was the name of your first pet?');
    setForgotPasswordStep(2);
  };

  const handleForgotPasswordStep2 = async (e) => {
    e.preventDefault();
    setForgotPasswordMessage('');
    
    if (!securityAnswer) {
      setForgotPasswordMessage('Please answer the security question.');
      return;
    }
    
    // Simulate verifying security answer
    await new Promise(resolve => setTimeout(resolve, 500));
    if (securityAnswer.toLowerCase().includes('pet') || securityAnswer.toLowerCase().includes('dog') || securityAnswer.toLowerCase().includes('cat')) {
      setForgotPasswordStep(3);
    } else {
      setForgotPasswordMessage('Incorrect answer. Please try again.');
    }
  };

  const handleForgotPasswordStep3 = async (e) => {
    e.preventDefault();
    setForgotPasswordMessage('');
    
    if (!newPassword || !confirmPassword) {
      setForgotPasswordMessage('Please fill in both password fields.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setForgotPasswordMessage('Passwords do not match.');
      return;
    }
    
    if (newPassword.length < 6) {
      setForgotPasswordMessage('Password must be at least 6 characters long.');
      return;
    }
    
    // Simulate password reset
    await new Promise(resolve => setTimeout(resolve, 1000));
    setForgotPasswordMessage('Password has been reset successfully! You can now login with your new password.');
    setTimeout(() => {
      setShowForgotPassword(false);
      setForgotPasswordStep(1);
      setForgotPasswordEmail('');
      setSecurityAnswer('');
      setNewPassword('');
      setConfirmPassword('');
      setForgotPasswordMessage('');
    }, 2000);
  };

  if (showForgotPassword) {
    return (
      <div className="auth-card fade-in">
        <div className="progress-bar">
          <div className={`progress-step ${forgotPasswordStep >= 1 ? 'active' : ''}`}>1</div>
          <div className={`progress-step ${forgotPasswordStep >= 2 ? 'active' : ''}`}>2</div>
          <div className={`progress-step ${forgotPasswordStep >= 3 ? 'active' : ''}`}>3</div>
        </div>

        {forgotPasswordStep === 1 && (
          <form onSubmit={handleForgotPasswordStep1} className="slide-in">
            <h2>Reset Password</h2>
            <p className="step-description">Enter your email to find your account</p>
            {forgotPasswordMessage && (
              <div className="error">{forgotPasswordMessage}</div>
            )}
            <div className="form-control">
              <input 
                type="email" 
                value={forgotPasswordEmail} 
                onChange={(e) => setForgotPasswordEmail(e.target.value)} 
                placeholder="Enter your email" 
                required 
                className="animated-input"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Continue
            </button>
          </form>
        )}

        {forgotPasswordStep === 2 && (
          <form onSubmit={handleForgotPasswordStep2} className="slide-in">
            <h2>Security Question</h2>
            <p className="step-description">Answer your security question</p>
            {forgotPasswordMessage && (
              <div className="error">{forgotPasswordMessage}</div>
            )}
            <div className="security-question">
              <p><strong>{securityQuestion}</strong></p>
            </div>
            <div className="form-control">
              <input 
                type="text" 
                value={securityAnswer} 
                onChange={(e) => setSecurityAnswer(e.target.value)} 
                placeholder="Your answer" 
                required 
                className="animated-input"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Verify Answer
            </button>
          </form>
        )}

        {forgotPasswordStep === 3 && (
          <form onSubmit={handleForgotPasswordStep3} className="slide-in">
            <h2>New Password</h2>
            <p className="step-description">Create your new password</p>
            {forgotPasswordMessage && (
              <div className={forgotPasswordMessage.includes('successfully') ? 'success' : 'error'}>
                {forgotPasswordMessage}
              </div>
            )}
            <div className="form-control">
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="New password" 
                required 
                className="animated-input"
              />
            </div>
            <div className="form-control">
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="Confirm password" 
                required 
                className="animated-input"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Reset Password
            </button>
          </form>
        )}

        <p className="switch-auth">
          <button type="button" onClick={() => {
            setShowForgotPassword(false);
            setForgotPasswordStep(1);
            setForgotPasswordMessage('');
          }} className="back-btn">
            ← Back to Login
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="auth-card fade-in">
      <div className="auth-header">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account</p>
      </div>
      
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="error shake">{error}</div>}
        
        <div className="form-group">
          <div className="input-container">
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder=" " 
              required 
              className={`animated-input ${email ? 'has-value' : ''}`}
              id="email"
            />
            <label htmlFor="email" className="floating-label">Email Address</label>
            <div className="input-border"></div>
          </div>
        </div>
        
        <div className="form-group">
          <div className="input-container">
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder=" " 
              required 
              className={`animated-input ${password ? 'has-value' : ''}`}
              id="password"
            />
            <label htmlFor="password" className="floating-label">Password</label>
            <div className="input-border"></div>
          </div>
        </div>
        
        <button 
          type="button" 
          className="forgot-password-link" 
          onClick={() => setShowForgotPassword(true)}
        >
          Forgot Password?
        </button>
        
        <button type="submit" disabled={loading} className={`btn btn-primary ${loading ? 'loading' : ''}`}>
          <span className="btn-text">{loading ? 'Signing in...' : 'Sign In'}</span>
          {loading && <div className="loading-spinner"></div>}
        </button>
        
        <div className="auth-divider">
          <span>or</span>
        </div>
        
        <p className="switch-auth">
          Don't have an account? 
          <button type="button" onClick={onSwitchToRegister} className="switch-btn">
            Create one
          </button>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;