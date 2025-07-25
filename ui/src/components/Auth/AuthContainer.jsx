
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import './AuthPage.css';

const AuthContainer = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-side">
          <div className="auth-header">
            <div className="logo">LearnMate</div>
            <h1>Welcome to LearnMate</h1>
            <p>Your personal AI-powered learning assistant.</p>
          </div>
          <div className="auth-features">
            <div className="feature">
              <i className="fas fa-robot"></i>
              <p>Engage with an intelligent chatbot that answers your questions in real-time.</p>
            </div>
            <div className="feature">
              <i className="fas fa-file-alt"></i>
              <p>Upload your documents and get instant insights and summaries.</p>
            </div>
            <div className="feature">
              <i className="fas fa-lightbulb"></i>
              <p>Explore complex topics with a powerful knowledge base.</p>
            </div>
          </div>
        </div>
        <div className="auth-main">
          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;
